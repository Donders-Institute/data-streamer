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

    var occ = new oc({
        url: config.get('MRI.orthancEndpoint'),
        auth: {
            username: config.get('MRI.orthancUsername'),
            password: config.get('MRI.orthancPassword')
        }
    });

    /*
    // General function to get DICOM header attribute and image data files of
    // a Series.
    */
    var getInstanceFiles = function(isCatchall, cb_async) {

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

        // get patient DICOM tags
        occ.series.getPatient(sid).then( function(data) {
            if ( data['MainDicomTags'] ) {
                sinfo['patientId'] = data['MainDicomTags']['PatientID'];
            } else {
                throw new Error('no DICOM tags for patient, series: ' + sid);
            }
        }).then( function(data) {
            // get study DICOM tags
            occ.series.getStudy(sid).then( function(data) {
                if ( data['MainDicomTags'] ) {
                    sinfo['studyId'] = data['MainDicomTags']['StudyID'];
                    sinfo['studyDate'] = data['MainDicomTags']['StudyDate'];
                    sinfo['studyTime'] = data['MainDicomTags']['StudyTime'];
                    sinfo['studyDescription'] = date['MainDicomTags']['StudyDescription'];
                } else {
                    throw new Error('no DICOM tags for study, series: ' + sid);
                }
            });
        }).then( function(data) {
            // get series DICOM tags and loop over instances to get files
            occ.series.get(sid).then( function(data) {
                sinfo['instances'] = data['Instances'];
                if ( data['MainDicomTags'] ) {
                    sinfo['seriesNumber'] = data['MainDicomTags']['SeriesNumber'];
                    sinfo['seriesDescription'] = data['MainDicomTags']['SeriesDescription'];
                } else {
                    throw new Error('no DICOM tags for series, series: ' + sid);
                }
            });
        }).then( function(data) {
            // construct the directory of project storage
            var baseDir = null;
            var prj_sub_regex = new RegExp("^(30[0-9]{5}\.[0-9]{2})_(sub.*)$");
            var m = prj_sub_regex.exec(sinfo['patientId']);

            if ( isCatchall ) {
                baseDir = config.get('MRI.streamerDataDirRoot') + '/raw/';
                if (m) {
                    // directory structure for an expected patientId convention
                    baseDir += m[1] + '/' + m[2] + '/' + sinfo['studyId'] + '/' +
                              ('0000' + sinfo['seriesNumber']).slice(-3) + '-' +
                              sinfo['seriesDescription'];
                } else {
                    // directory structure for an unexpected patientId convention
                    baseDir += sinfo['studyDate'] + '/' +
                               sinfo['studyDescription'] + '/' +
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
                    return cb_async(null, 0);
                }
            }

            utility.printLog('MRI:execStreamerJob:getInstanceFiles',
                             'writing ' + instances.length + ' instances to ' + baseDir);
            return cb_async(null, 0);
        }).catch( function(err) {
            utility.printErr('MRI:execStreamerJob:getInstanceFiles', err);
            return cb_async(err, 1);
        });
    }

    // here are logical steps run in sequencial order
    async.series([
        function(cb) {
            // step 1: get all instances of a the series to catch-all buffer
            getInstanceFiles(true, cb);
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
            getInstanceFiles(false, cb);
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
