/*

This module is for handling streamer jobs for lab data with
input provided by the streamer-ui interface.  

*/
const auth = require('basic-auth');
const utility = require('./utility');

const restPaths = {
    // proj_id - project identifier
    // subj_id - subject identifier
    // sess_id - session identifier
    // dtype - data type
    'postJob': '/:proj_id/:subj_id/:sess_id/:dtype'
};

// create new streamer job on a POST action to the streamer
var _createStreamerJob = function(name, config, queue) {

  return function( req, res ) {

      var projId = req.params['proj_id'];
      var subjId = req.params['subj_id'];
      var sessId = req.params['sess_id'];
      var dataType = req.params['dtype'];

      var jobTitle = 'UI: ' + projId + '-' + subjId + '-' + sessId + '-' + dataType;

      console.log('creating job for: ' + jobTitle);

      // submit a streamer job
      // - the job shouldn't take more than 1hr to complete
      // - the job has max. 5 attempts in case of failure, each attempt is delayed by 1 min.
      if ( queue ) {
          var job = queue.create('streamer', {
              modality: name,
              title: '[' + (new Date()).toISOString() + '] ' + jobTitle,
              projId: projId,
              subjId: subjId,
              sessId: sessId,
              dataType: dataType
          }).attempts(5).ttl(3600*1000).backoff( {delay: 60*1000, type:'fixed'} ).save(function(err) {
              if ( err ) {
                  console.log('fail creating new job: ' + err);
                  utility.responseOnError('json',{'error': 'fail creating job: ' + err}, res);
              } else {
                  res.json({'message': 'job ' + job.id + ' created'});
              }
          });
      } else {
          console.log('invalid queue');
          utility.responseOnError('json',{'error': 'invalid queue'}, res);
      }
  }
}

// run a streamer job given a job data
var _execStreamerJob = function(name, config, job, cb_remove, cb_done) {
    console.log('job data: ' + JSON.stringify(job.data));
    var i = 0;
    var timer = setInterval( function() {
        try {
            if ( cb_remove() ) {
                // graceful stop of the running process
                console.log('graceful stop of the removed job: ' + job.id);
                clearInterval(timer);
                cb_done(null, true);
                return;
            }

            if (i < 100) {
                i++;
                console.log('job progress: ' + i);
                job.progress(i, 100);
            } else {
                clearInterval(timer);
                cb_done(null, true);
            }
        } catch(err) {
            console.error('job processing error: ' + err)
            clearInterval(timer);
            cb_done(err, false);
        }
    }, 1000);
}

module.exports.restPaths = restPaths;
module.exports.createStreamerJob = _createStreamerJob;
module.exports.execStreamerJob = _execStreamerJob;
