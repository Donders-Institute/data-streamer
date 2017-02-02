const auth = require('basic-auth');
const child_process = require('child_process');
const path = require('path');
const kill = require('tree-kill');
const fs = require('fs');
const utility = require('./utility');
const targz = require('tar.gz');

const restPaths = {
    'postJob': '/series/:id'
};

// create new streamer job on a POST action to the streamer
var _createStreamerJob = function(name, config, queue) {

    return function( req, res ) {

        var seriesId = req.params['id'];

        // submit a streamer job
        // - the job shouldn't take more than 1hr to complete
        // - the job has max. 5 attempts in case of failure, each attempt is delayed by 1 min.
        if ( queue ) {
            var job = queue.create('streamer', {
                modality: name,
                title: '[' + (new Date()).toISOString() + '] series: ' + seriesId,
                series: seriesId
            }).attempts(5).ttl(3600*1000).backoff( {delay: 60*1000, type:'fixed'} ).save(function(err) {
                if ( err ) {
                    utility.printErr(job.id + ':MRI:createStreamerJob', err);
                    utility.responseOnError('json',{'error': 'fail creating job: ' + err}, res);
                } else {
                    res.json({'message': 'job ' + job.id + ' created'});
                }
            });
        } else {
            utility.printErr(job.id + ':MRI:createStreamerJob', 'invalid job queue: ' + queue);
            utility.responseOnError('json',{'error': 'invalid queue'}, res);
        }
    }
}

// run a streamer job given a job data
var _execStreamerJob = function(name, config, job, cb_remove, cb_done) {

    var http = require('http');
    var oc_url = require('url').parse(config.orthancEndpoint);

    var async = require('async');
    var oc = require('orthanc-client');
    var oc_cfg = {
        url: config.orthancEndpoint,
        auth: {
            username: config.orthancUsername,
            password: config.orthancPassword
        }
    }

    /*
    // General function to get DICOM header attribute and image data files of
    // a Series.
    */
    var getInstanceFiles = function(isCatchall, createDir, minProgress, maxProgress, cb_async) {

        var sid = job.data.series;

        // initialise series DICOM tags
        var sinfo = {
            'patientId': null,
            'studyId': null,
            'studyDate': null,
            'studyTime': null,
            'studyDescription': null,
            'seriesNumber': null,
            'seriesDescription': null,
            'instances': []
        }

        var baseDir = null;
        var projectNumber = null;

        async.series([
            function(_cb) { // get patient DICOM tags
                (new oc(oc_cfg)).series.getPatient(sid).then( function(data) {
                    if ( data['MainDicomTags'] ) {
                        sinfo['patientId'] = data['MainDicomTags']['PatientID'];
                        return _cb(null, true);
                    } else {
                        throw new Error('no DICOM tags for patient, series: ' + sid);
                    }
                }).catch( function(err) {
                    return _cb(err, false);
                });
            },
            function(_cb) { // get study DICOM tags
                (new oc(oc_cfg)).series.getStudy(sid).then( function(data) {
                    if ( data['MainDicomTags'] ) {
                        sinfo['studyId'] = data['MainDicomTags']['StudyID'];
                        sinfo['studyDate'] = data['MainDicomTags']['StudyDate'];
                        sinfo['studyTime'] = data['MainDicomTags']['StudyTime'];

                        if ( data['MainDicomTags']['StudyDescription'] ) {
                            sinfo['studyDescription'] = data['MainDicomTags']['StudyDescription'];
                        } else {
                            // mimicing the studyDescription using RequestedProcedureDescription
                            sinfo['studyDescription'] = data['MainDicomTags']['RequestedProcedureDescription'];
                        }

                        return _cb(null, true);
                    } else {
                        throw new Error('no DICOM tags for study, series: ' + sid);
                    }
                }).catch( function(err) {
                    return _cb(err, false);
                });
            },
            function(_cb) { // get series DICOM tags and loop over instances to get files
                (new oc(oc_cfg)).series.get(sid).then( function(data) {
                    sinfo['instances'] = data['Instances'];
                    if ( data['MainDicomTags'] ) {
                        sinfo['seriesNumber'] = data['MainDicomTags']['SeriesNumber'];
                        sinfo['seriesDescription'] = data['MainDicomTags']['SeriesDescription'];
                        return _cb(null, true);
                    } else {
                        throw new Error('no DICOM tags for series, series: ' + sid);
                    }
                }).catch( function(err) {
                    return _cb(err, false);
                });
            },
            function(_cb) {  // get the instance data to project storage
                var prj_sub_regex = new RegExp("^(30[0-9]{5}\.[0-9]{2})_(sub.*)$");
                var m = prj_sub_regex.exec(sinfo['patientId']);

                if ( isCatchall ) {
                    baseDir = config.streamerDataDirRoot + '/';
                    if (m) {
                        // directory structure for an expected patientId convention
                        baseDir += sinfo['studyDate'] + '/' + m[1] + '/' + m[2] + '/' + sinfo['studyId'] + '/' +
                                  ('0000' + sinfo['seriesNumber']).slice(-3) + '-' +
                                  sinfo['seriesDescription'];

                        projectNumber = m[1];
                    } else {
                        // directory structure for an unexpected patientId convention
                        // study directory prefix constructed from studyDescription,
                        // with space-characters replaced with '^'.
                        var sdir_pre = (sinfo['studyDescription']) ?
                                        sinfo['studyDescription'].replace(/\s/g,'^'):'unknown';

                        baseDir += sinfo['studyDate'] + '/' +
                                   sdir_pre + '_' + sinfo['studyTime'] + '/' +
                                   ('0000' + sinfo['seriesNumber']).slice(-3) + '-' +
                                   sinfo['seriesDescription'];
                    }
                } else {
                    if (m) {
                        // directory strucutre for an expected patientId convention
                        baseDir = '/project/' + m[1] + '/raw/' +
                                  m[2] + '/' + sinfo['studyId'] + '/' +
                                  ('0000' + sinfo['seriesNumber']).slice(-3) + '-' +
                                  sinfo['seriesDescription'];

                        projectNumber = m[1];

                        // check whether the project directory exists
                        if ( ! fs.existsSync('/project/' + m[1]) ) {
                              // skip: non-existing project in central storage
                              utility.printLog(job.id + ':MRI:execStreamerJob:getInstanceFiles', 'storage of project (' + m[1] + ') not found, skip: ' + sid);
                              return _cb(null, true);
                        }
                    } else {
                        // skip: unexpected patientId convention
                        utility.printLog(job.id + ':MRI:execStreamerJob:getInstanceFiles', 'unresolvable patientId (' + sinfo['patientId'] + '), skip: ' + sid);
                        return _cb(null, true);
                    }
                }

                // copy the data over to baseDir, using async.every
                // TODO: shall we limited the downloading concurrency?
                utility.printLog(job.id + ':MRI:execStreamerJob:getInstanceFiles',
                                 'writing ' + sinfo['instances'].length + ' instances to ' + baseDir);

                // create destination directory on request
                if ( ! fs.existsSync(baseDir) && createDir ) {
                    try {
                      //TODO: this is NOT a good way to create directory recursively
                      child_process.execSync('mkdir -p "' + baseDir + '"');
                    } catch(err) {}
                }

                var i = 0;
                var total_instances = sinfo['instances'].length;
                async.everyLimit(sinfo['instances'], 20, function(iid, _cbb) {
                    (new oc(oc_cfg)).instances.get(iid).then( function(data) {
                        var errmsg = '';
                        if ( data['MainDicomTags'] ) {
                            // construct instance filename
                            var f_dcm = baseDir + '/' +
                                        ('0000000' + data['MainDicomTags']['InstanceNumber']).slice(-5) +
                                        '_' + data['MainDicomTags']['SOPInstanceUID'] + '.IMA';
                            // get data from Orthanc and write to the filename
                            var f = fs.createWriteStream(f_dcm);

                            /* method 1: using the build-in http client */
                            http.get({
                                hostname: oc_url.hostname,
                                port: oc_url.port,
                                path: '/instances/' + iid + '/file',
                                auth: "'" + config.orthancUsername + "':'" + config.orthancPassword + "'"
                            }, function(resp) {
                                if ( resp.statusCode != 200 ) {
                                    fs.unlink(f_dcm, function(err) {});
                                    errmsg =  'fail to retrieve instance data: ' + iid + ' (' + resp.statusCode + ') ';
                                    utility.printErr(job.id + ':MRI:execStreamerJob:getInstanceFiles', errmsg);
                                    return _cbb(errmsg, false);
                                }
                                resp.pipe(f);
                                f.on('finish', function() {
                                    f.close( function(err) {
                                        if (err) {
                                            errmsg = 'fail to close instance data file: ' + err;
                                            utility.printErr(job.id + ':MRI:execStreamerJob:getInstanceFiles', errmsg);
                                            return _cbb(errmsg, false);
                                         }
                                         job.progress(minProgress +
                                                      Math.round((i++)*(maxProgress-minProgress)/total_instances),100);
                                         return _cbb(null, true);
                                    });
                                });
                            }).on('error', function(err) {
                                fs.unlink(f_dcm, function(err) {});
                                errmsg = 'fail to download data for instance: ' + err;
                                utility.printErr(job.id + ':MRI:execStreamerJob:getInstanceFiles', errmsg);
                                return _cbb(errmsg, false);
                            });

                            /* method 2: using the orthanc-client */
                            // (new oc(oc_cfg)).instances.getFile(iid).then( function(buf) {
                            //     fs.writeFile(f_dcm, buf, function(err) {
                            //         if (err) {
                            //             throw new Error('cannot write instance data: ' + f_dcm);
                            //         }
                            //         // set job progress
                            //         job.progress(minProgress +
                            //                      Math.round((i++)*(maxProgress-minProgress)/total_instances),100);
                            //         return _cbb(null,true);
                            //     });
                            // }).catch( function(err) {
                            //     return _cbb(err, false);
                            // });
                        } else {
                            errmsg = 'no DICOM tags for instance: ' + iid;
                            utility.printErr(job.id + ':MRI:execStreamerJob:getInstanceFiles', errmsg);
                            return _cbb(errmsg, false);
                        }
                    }).catch( function(err) {
                        return _cbb(err, false);
                    });
                }, function(err, isComplete) {
                    return _cb(err, isComplete);
                });
            }
        ],
        function(err, results) {
            if (err) {
                utility.printErr(job.id + ':MRI:execStreamerJob:getInstanceFiles', err);
                return cb_async(err, null, null);
            } else {
                // set job to its maxProgress for the task
                job.progress(maxProgress, 100);
                return cb_async(null, baseDir, projectNumber);
            }
        });
    }

    /*
    // function for compress series data into a tarball (.tar.gz)
    */
    var compressSeriesData = function(src, projectNumber, minProgress, maxProgress, cb_async) {

        // resolve the destination path of the tarball
        var f_tgz = src + '.tar.gz';

        // compress directory into single tarball
        targz().compress(src, f_tgz, function(err) {
            if (err) {
                return cb_async(err, null, projectNumber);
            }
            job.progress(maxProgress, 100);
            return cb_async(null, f_tgz, projectNumber);
        });
    }

    /*
    // General function to submit a staging job for uploading series data to
    // RDM.
    */
    var submitStagerJob = function(src, projectNumber, toCatchall, minProgress, maxProgress, cb_async ) {

        // skip staging job if the source path is not referring to a project storage
        if ( ! projectNumber && ! toCatchall ) {
            utility.printLog(job.id + ':MRI:execStreamerJob:submitStagerJob', 'skip data staging: ' + src);
            // set to job's maxProgress for the task
            job.progress(maxProgress, 100);
            return cb_async(null, src, projectNumber);
        }

        var sconfig = require('config').get('DataStager');

        // construct project and RESTful endpoint for resolving RDM collection namespace
        var p = (toCatchall) ? '_CATCHALL.MRI':projectNumber;
        var myurl = sconfig.url + '/rdm/DAC/project/' + p;

        // general function to construct destination URL for stager job
        var _mkDst = function(_src, _collName) {
            // The following logic assumes the _src is a path within the catch-all project's directory
            // 1. replace project-storage prefix with collection namespace
            var _dst = 'irods:' + _collName + '/';
            if ( fs.statSync(_src).isDirectory() ) {
                _dst += _src.replace(new RegExp(config.projectStorageRegex), '');
            } else {
                _dst += path.dirname(_src).replace(new RegExp(config.projectStorageRegex), '');
            }

            // 2. for project-specific collection, remove the date and project number
            //    after the '/raw/' directory, as the project number has been
            //    presented as part of the collection namespace.
            if ( ! toCatchall ) {
                // e.g. transform '/raw/20170201/3010010.01/sub-01/ses-mri02/...' to '/raw/sub-01/ses-mri02/...'
                _dst = _dst.replace(new RegExp('\/raw\/[1-9][0-9]{7}\/' + projectNumber + '\/'), '/raw/');
            }
            return _dst;
        }

        // Initialise RESTful client
        var RestClient = require('node-rest-client').Client;
        var c_stager = new RestClient({
            user: sconfig.username,
            password: sconfig.password
        });
        var rget_args = { headers: { 'Accept': 'application/json' } };

        // Resolve collection namespace
        c_stager.get(myurl, rget_args, function(rdata, resp) {

            if ( resp.statusCode >= 400 ) {  //HTTP error
                var errmsg = 'HTTP error: (' + resp.statusCode + ') ' + resp.statusMessage;
                if ( resp.statusCode == 404 && !toCatchall ) {
                    // accept 404 NOT FOUND error if it's not about a catchall collection
                    // it can happen when it's about a PILOT project; or a project not having
                    // a RDM collection being created/mapped properly.
                    utility.printLog(job.id + ':MRI:execStreamerJob:submitStagerJob', 'collection not found for project: ' + p);
                    return cb_async(null, src, projectNumber);
                } else {
                    utility.printErr(job.id + ':MRI:execStreamerJob:submitStagerJob', errmsg);
                    return cb_async(errmsg, src, projectNumber);
                }
            }

            var rpost_args = {
                headers: { 'Accept': 'application/json',
                           'Content-Type': 'application/json' },
                data: [{
                    'type': 'rdm',
                    'data': { 'clientIF': 'irods',
                              'stagerUser': 'root',
                              'rdmUser': 'irods',
                              'title': '[' + (new Date()).toISOString() + '] Streamer.MRI: ' + src,
                              'timeout': 3600,
                              'timeout_noprogress': 600,
                              'srcURL': src,
                              'dstURL': _mkDst(src, rdata.collName) },
                    'options': { 'attempts': 5,
                                 'backoff': { 'delay' : 60000,
                                              'type'  : 'fixed' } }
                }]
            };

            // Submit stager job
            c_stager.post(sconfig.url + '/job', rpost_args, function(rdata, resp) {
                if ( resp.statusCode >= 400 ) {  //HTTP error
                    var errmsg = 'HTTP error: (' + resp.statusCode + ') ' + resp.statusMessage;
                    utility.printErr(job.id + ':MRI:execStreamerJob:submitStagerJob', errmsg);
                    return cb_async(errmsg, src, projectNumber);
                } else {
                    rdata.forEach( function(d) {
                        utility.printLog(job.id + ':MRI:execStreamerJob:submitStagerJob', JSON.stringify(d));
                    });
                    // job submitted!! set to job's maxProgress for the task
                    job.progress(maxProgress, 100);
                    return cb_async(null, src, projectNumber);
                }
            }).on('error', function(err) {
                utility.printErr(job.id + ':MRI:execStreamerJob:submitStagerJob', err);
                var errmsg = 'fail submitting stager jobs: ' + JSON.stringify(ds_list);
                job.log(errmsg);
                return cb_async(errmsg, src, projectNumber);
            });
        }).on('error', function(err) {
            // fail to get collection for project
            var errmsg = 'cannot get collection for project: ' + p;
            utility.printErr(job.id + ':MRI:execStreamerJob:submitStagerJob', err);
            job.log(errmsg);
            // this will cause process to stop
            return cb_async(errmsg, src, projectNumber);
        });
    }

    // here are logical steps run in sequencial order
    async.waterfall([
        function(cb) {
            // get all instances of a the series to catch-all project storage
            // it returns a directory on central storage, and the
            // project number.
            // The project number can be null if the subject naming
            // convention is not followed.
            getInstanceFiles(true, true, 0, 30, cb);
        },
        function(dataPath, projectNumber, cb) {
            // compress series data
            compressSeriesData(dataPath, projectNumber, 30, 40, cb);
        },
        function(dataPath, projectNumber, cb) {
            // archive DICOM images given by dataPath
            // to a catch-all collection in RDM.
            if ( dataPath ) {
                submitStagerJob(dataPath, projectNumber, true, 40, 50, cb);
            } else {
                // it should never happen that the dataDir of catch-all storage is 'null' or 'undefined'
                // this call terminates the rest async process immediately
                cb('dataPath not found: ' + dataPath, dataPath);
            }
        },
        function( dataPath, projectNumber, cb) {
            // just convert dataPath back to the directory in which
            // the instances of the series is stored
            cb(null, dataPath.replace(new RegExp('\.tar\.gz$'), ''), projectNumber);
        },
        function(dataPath, projectNumber, cb) {
            // archive DICOM images in dataPath
            // to the project-specific collection in RDM.
            submitStagerJob(dataPath, projectNumber, false, 50, 60, cb);
        },
        function(dataPath, projectNumber, cb) {
            // step 4: get all instances of a series to project storage
            getInstanceFiles(false, true, 60, 100, cb);
        }],
        function(err, dataPath, projectNumber) {
            if (err) {
                utility.printErr(job.id + ':MRI:execStreamerJob', err);
                cb_done(err, false);
            } else {
                utility.printLog(job.id + ':MRI:execStreamerJob', 'success');
                cb_done(null, true);
            }
        }
    );
}

module.exports.restPaths = restPaths;
module.exports.createStreamerJob = _createStreamerJob;
module.exports.execStreamerJob = _execStreamerJob;
