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

        occ.series.get(sid).then( function(data) {
            utility.printLog('MRI:execStreamerJob:getInstanceFiles', JSON.stringify(data));
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
