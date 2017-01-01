var auth = require('basic-auth');
var utility = require('./utility');

var restPaths = {
    'postJob': '/:date/:ds?'
};

// create new streamer job on a POST action to the streamer
var _createStreamerJob = function(name, config, queue) {

  return function( req, res ) {

      var srcPathConsole = req.params['date'];

      if ( req.params['ds'] ) {
          srcPathConsole += '/' + req.params['ds'];
      }

      console.log('srcPathConsole: ' + srcPathConsole);

      // submit a streamer job
      // - the job shouldn't take more than 1hr to complete
      // - the job has max. 5 attempts in case of failure, each attempt is delayed by 1 min.
      if ( queue ) {
          var job = queue.create('streamer', {
              modality: name,
              title: '[' + (new Date()).toISOString() + '] ' + srcPathConsole,
              srcDir: srcPathConsole
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
