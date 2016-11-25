var config = require('config');
var auth = require('basic-auth');
var child_process = require('child_process');
var path = require('path');
var kill = require('tree-kill');
var fs = require('fs');
var utility = require('./utility');

// create new streamer job on a POST action to the streamer
var _createStreamerJob = function(queue) {

    return function( req, res ) {

        var seriesId = req.params['id'];

        // submit a streamer job
        // - the job shouldn't take more than 1hr to complete
        // - the job has max. 5 attempts in case of failure, each attempt is delayed by 1 min.
        if ( queue ) {
            var job = queue.create('streamer', {
                modality: 'mri',
                title: '[' + (new Date()).toISOString() + '] series: ' + seriesId,
                series: seriesId
            }).attempts(5).ttl(3600*1000).backoff( {delay: 60*1000, type:'fixed'} ).save(function(err) {
                if ( err ) {
                    utility.printErr('MRI:createStreamerJob', err);
                    utility.responseOnError('json',{'error': 'fail creating job: ' + err}, res);
                } else {
                    res.json({'message': 'job ' + job.id + ' created'});
                }
            });
        } else {
            utility.printErr('MRI:createStreamerJob', 'invalid job queue: ' + queue);
            utility.responseOnError('json',{'error': 'invalid queue'}, res);
        }
    }
}

// run a streamer job given a job data
var _execStreamerJob = function( job, cb_remove, cb_done) {

    var async = require('async');
    var oc = require('orthanc-client');

    // function to get new Orthanc Client instance
    var occ = function() {
        return new oc({
            url: config.get('MRI.orthancEndpoint'),
            auth: {
                username: config.get('MRI.orthancUsername'),
                password: config.get('MRI.orthancPassword')
              }
        });
    };

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

        async.series([
            function(_cb) { // get patient DICOM tags
                occ().series.getPatient(sid).then( function(data) {
                    if ( data['MainDicomTags'] ) {
                        sinfo['patientId'] = data['MainDicomTags']['PatientID'];
                        return _cb(null, 0);
                    } else {
                        throw new Error('no DICOM tags for patient, series: ' + sid);
                    }
                }).catch( function(err) {
                    return _cb(err, 1);
                });
            },
            function(_cb) { // get study DICOM tags
                occ().series.getStudy(sid).then( function(data) {
                    if ( data['MainDicomTags'] ) {
                        sinfo['studyId'] = data['MainDicomTags']['StudyID'];
                        sinfo['studyDate'] = data['MainDicomTags']['StudyDate'];
                        sinfo['studyTime'] = data['MainDicomTags']['StudyTime'];
                        sinfo['studyDescription'] = data['MainDicomTags']['StudyDescription'];
                        return _cb(null, 0);
                    } else {
                        throw new Error('no DICOM tags for study, series: ' + sid);
                    }
                }).catch( function(err) {
                    return _cb(err, 1);
                });
            },
            function(_cb) { // get series DICOM tags and loop over instances to get files
                occ().series.get(sid).then( function(data) {
                    sinfo['instances'] = data['Instances'];
                    if ( data['MainDicomTags'] ) {
                        sinfo['seriesNumber'] = data['MainDicomTags']['SeriesNumber'];
                        sinfo['seriesDescription'] = data['MainDicomTags']['SeriesDescription'];
                        return _cb(null, 0);
                    } else {
                        throw new Error('no DICOM tags for series, series: ' + sid);
                    }
                }).catch( function(err) {
                    return _cb(err, 1);
                });
            },
            function(_cb) {  // get the instance data to project storage
                var prj_sub_regex = new RegExp("^(30[0-9]{5}\.[0-9]{2})_(sub.*)$");
                var m = prj_sub_regex.exec(sinfo['patientId']);

                if ( isCatchall ) {
                    baseDir = config.get('MRI.streamerDataDirRoot') + '/';
                    if (m) {
                        // directory structure for an expected patientId convention
                        baseDir += m[1] + '/' + m[2] + '/' + sinfo['studyId'] + '/' +
                                  ('0000' + sinfo['seriesNumber']).slice(-3) + '-' +
                                  sinfo['seriesDescription'];
                    } else {
                        // directory structure for an unexpected patientId convention
                        baseDir += sinfo['studyDate'] + '/' +
                                   sinfo['studyDescription'] + '_' +
                                   sinfo['studyTime'] + '/' +
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
                    } else {
                        // skip for unexpected patientId convention
                        utility.printLog('MRI:execStreamerJob:getInstanceFiles', 'skip: ' + sid);
                        return _cb(null, 0);
                    }
                }

                // copy the data over to baseDir, using async.every
                // TODO: shall we limited the downloading concurrency?
                utility.printLog('MRI:execStreamerJob:getInstanceFiles',
                                 'writing ' + sinfo['instances'].length + ' instances to ' + baseDir);

                // create destination directory on request
                if ( ! fs.existsSync(baseDir) && createDir ) {
                    try {
                      //TODO: this is NOT a good way to create directory recursively
                      child_process.execSync('mkdir -p ' + baseDir);
                    } catch(err) {}
                }

                async.each(sinfo['instances'], function(iid, _cbb) {
                    occ().instances.get(iid).then( function(data) {
                        if ( data['MainDicomTags'] ) {
                            // construct instance filename
                            var f_dcm = baseDir + '/' +
                                        ('0000000' + data['MainDicomTags']['InstanceNumber']).slice(-5) +
                                        '_' + data['MainDicomTags']['SOPInstanceUID'] + '.IMA';
                            // get data from Orthanc and write to the filename
                            occ().instances.getFile(iid).then( function(buf) {
                                fs.writeFile(f_dcm, buf, function(err) {
                                    if (err) {
                                        throw new Error('cannot write instance data: ' + f_dcm);
                                    }
                                    return _cbb(null,0);
                                });
                            }).catch( function(err) {
                                return _cbb(err, 1);
                            });
                        } else {
                            throw new Error('no DICOM tags for instance: ' + iid);
                        }
                    }).catch( function(err) {
                        return _cbb(err, 1);
                    });
                }, function(err, results) {
                    if ( err ) {
                        return _cb(err, 1);
                    } else {
                        return _cb(null, 0);
                    }
                });
            }
        ],
        function(err, results) {
            if (err) {
                utility.printErr('MRI:execStreamerJob:getInstanceFiles', err);
                return cb_async(err, 1);
            } else {
                return cb_async(null, 0);
            }
        });
    }

    // here are logical steps run in sequencial order
    async.series([
        function(cb) {
            // step 1: get all instances of a the series to catch-all buffer
            getInstanceFiles(true, true, 0, 40, cb);
        },
        function(cb) {
            // step 2: archive to catch-all collection
            cb(null, 0);
        },
        function(cb) {
            // step 3: archive to project collection
            cb(null, 0);
        },
        function(cb) {
            // step 4: get all instances of a series to project storage
            getInstanceFiles(false, true, 60, 100, cb);
        }],
        function(err, results) {
            if (err) {
                cb_done(err);
            } else {
                utility.printLog('MRI:execStreamerJob', 'output: ' + JSON.stringify(results));
                cb_done();
            }
        }
    );
}

module.exports.createStreamerJob = _createStreamerJob;
module.exports.execStreamerJob = _execStreamerJob;
