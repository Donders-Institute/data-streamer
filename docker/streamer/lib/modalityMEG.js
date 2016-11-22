var config = require('config');
var auth = require('basic-auth');
var child_process = require('child_process');
var path = require('path');
var kill = require('tree-kill');
var utility = require('./utility');

// create new streamer job on a POST action to the streamer
var _createStreamerJob = function(queue) {

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
              modality: 'meg',
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
var _execStreamerJob = function( job, cb_remove, cb_done) {
    console.log('job data: ' + JSON.stringify(job.data));

    var async = require('async');

    var cp_end = false;
    var i = 0;
    async.series([
        function(cb) {
            console.log('job ' + job.id + ': rsync start');

            // TODO: need a better way to refer to the executable directory
            var cmd = __dirname + '/../bin/meg_copy.sh';

            var cmd_args = [
                config.MEG.consoleHostname + ':' + config.MEG.consoleDataDirRoot + '/' + job.data.srcDir,
                config.MEG.consoleUsername,
                config.MEG.consolePassword,
                config.MEG.streamerDataDirRoot + '/' + job.data.srcDir];

            var cmd_opts = {
                maxBuffer: 10*1024*1024
            };

            var child = child_process.execFile(cmd, cmd_args, cmd_opts, function(err, stdout, stderr) {

                // child process has been determined
                cp_end = true;

                // push the last 5-lines of stdout, and  stderr to job log
                job.log({
                    "stdout": stdout.split("\n").slice(-5),
                    "stderr": stderr.split("\n").slice(-5)
                });

                // error handling
                if (err) {
                    console.error('rsync process error: ' + err);
                }
            });

            // define callback when child process is closed
            child.on( "close", function(code, signal) {

                cp_end = true;

                // interruption handling (null if process is not interrupted)
                if ( code != 0 ) {
                    cb('rsync process failed: ' + signal, code);
                } else {
                    // set job progress to 25%
                    // TODO: this is too artifical
                    i = 25;
                    job.progress(i, 100);
                    cb(null,0);
                }
            });

            // set timer to check whether there is a removal request from end user
            var timer = setInterval( function() {
                if ( cb_remove() ) {
                    kill(child.pid, 'SIGKILL', function(err) {
                        if (err) {
                            console.error('fail killing rsync job ' + child.pid + ': ' + err);
                        }
                    });
                }

                // clear the timer when the process has been closed
                if ( cp_end ) {
                    clearInterval(timer);
                }
            },1000);
        },
        function(cb) {
            console.log('job ' + job.id + ': cp2proj start');
            var timer = setInterval( function() {
                if ( cb_remove() ) {
                    clearInterval(timer);
                    cb('cp2proj process interrupted due to job removal')
                } else {
                    if ( i < 50 ) {
                        job.progress(i++,100);
                    } else {
                        clearInterval(timer);
                        cb(null, 0);
                    }
                }
            },1000);
        },
        function(cb) {
            console.log('job ' + job.id + ': stage2collc start');
            var timer = setInterval( function() {
                if ( cb_remove() ) {
                    clearInterval(timer);
                    cb('stage2collc process interrupted due to job removal')
                } else {
                    if ( i < 75 ) {
                        job.progress(i++,100);
                    } else {
                        clearInterval(timer);
                        cb(null, 0);
                    }
                }
            },1000);
        },
        function(cb) {
            console.log('job ' + job.id + ': stager2collp start');
            var timer = setInterval( function() {
                if ( cb_remove() ) {
                    clearInterval(timer);
                    cb('stage2collp process interrupted due to job removal')
                } else {
                    if ( i < 100 ) {
                        job.progress(i++,100);
                    } else {
                        clearInterval(timer);
                        cb(null, 0);
                    }
                }
            },1000);
        }],
        function(err, results) {
            if (err) {
                cb_done(err);
            } else {
                console.log('MEG streamer output: ' + JSON.stringify(results));
                cb_done();
            }
        }
    );
}

module.exports.createStreamerJob = _createStreamerJob;
module.exports.execStreamerJob = _execStreamerJob;
