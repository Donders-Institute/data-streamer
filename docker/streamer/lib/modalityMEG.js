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

      var srcPathConsole = req.params['date'];

      if ( req.params['ds'] ) {
          srcPathConsole += '/' + req.params['ds'];
      }

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
                  utility.printErr('[MEG:create streamer job]', err);
                  utility.responseOnError('json',{'error': 'fail creating job: ' + err}, res);
              } else {
                  res.json({'message': 'job ' + job.id + ' created'});
              }
          });
      } else {
          utility.printErr('[MEG:create streamer job]', 'invalid job queue: ' + queue);
          utility.responseOnError('json',{'error': 'invalid queue'}, res);
      }
  }
}

// run a streamer job given a job data
var _execStreamerJob = function( job, cb_remove, cb_done) {

    var async = require('async');

    /*
    // General function to run meg_copy.sh in a child process
    // The meg_copy.sh script is a shell script running the rsync command
    // to copy files from the MEG console to the central storage that is
    // accessible as a local file system of the streamer.
    */
    var runRsync = function(src, dst, createDir, minProgress, maxProgress, cb_async ) {

        var cp_end = false;

        // TODO: need a better way to refer to the executable directory
        var cmd = __dirname + '/../bin/meg_copy.sh';

        var cmd_args = [
            src,
            config.get('MEG.consoleUsername'),
            config.get('MEG.consolePassword'),
            dst];

        var cmd_opts = {
            maxBuffer: 10*1024*1024
        };

        // create destination directory on request
        if ( ! fs.existsSync(dst) && createDir ) {
            try {
                //TODO: this is NOT a good way to create directory recursively
                child_process.execSync('mkdir -p ' + dst);
            } catch(err) {}
        }

        var child = child_process.execFile(cmd, cmd_args, cmd_opts, function(err, stdout, stderr) {

            // notify the timer that the child process has been finished
            // TODO: is this one necessary, as we have set one in child.on('close')
            cp_end = true;

            // push the last 5-lines of stdout, and  stderr to job log
            job.log({
                "stdout": stdout.split("\n").slice(-5),
                "stderr": stderr.split("\n").slice(-5)
            });

            // error handling
            if (err) {
                utility.printErr('[MEG:execStreamerJob:runRsync]', err);
            }
        });

        // define callback when child process is closed
        child.on( "close", function(code, signal) {
            // notify the timer that the child process has been finished
            cp_end = true;
            // interruption handling (null if process is not interrupted)
            if ( code != 0 ) {
                return cb_async('rsync process error: ' + signal, code);
            } else {
                // set job progress to 40%
                job.progress(maxProgress, 100);
                return cb_async(null,0);
            }
        });

        // define callback when receiving new stderr from the child process
        child.stderr.on('data', function(data) {
            // use the child process's stderr data to update job's progress
            // the progress is normalised to maxProgress w/ offset minProgress.
            var p = minProgress + Math.round( parseInt(data.trim()) * maxProgress / 100 );
            job.progress(p, 100);
        });

        // set timer to check whether there is a removal request from end user
        var timer = setInterval( function() {
            if ( cb_remove() ) {
                kill(child.pid, 'SIGKILL', function(err) {
                    if (err) {
                        utility.printErr('[MEG:execStreamerJob:runRsync]', err);
                    }
                });
            }

            // clear the timer when the process has been closed
            if ( cp_end ) {
                clearInterval(timer);
            }
        },1000);
    };

    /*
    //    General function to resolve latest updated datasets and their
    //    association with projects.
    */
    var findUpdateProjectDs = function(baseDir) {
        var os = require('os');
        var cmd = __dirname + '/../bin/find-update-ds.sh'
        var cmd_args = [baseDir, config.get('MEG.timeWindowInMinute')]
        var cmd_opts = {
            maxBuffer: 10*1024*1024
        }

        // list dataset directories in which there are files being update
        // TODO: here we assume the project number is presented either
        //       3010000.01 or 301000001 on name of the dataset
        var prj_regex = new RegExp("^.*(30[0-9]{5}\.{0,1}[0-9]{2}).*$");
        var prj_ds = {'unknown': []};
        var stdout = child_process.execFileSync(cmd, cmd_args, cmd_opts);
        stdout.toString().split(os.EOL).forEach( function(l) {
            if ( l ) {
                var m = prj_regex.exec(l.replace(config.get('MEG.streamerDataDirRoot') + '/', ''));
                if (m) {
                    var prj = (m[1].indexOf('.') == 7) ? m[1]:[m[1].slice(0, 7), '.', m[1].slice(7)].join('')
                    if ( ! prj_ds[prj] ) { prj_ds[prj] = []; }
                    prj_ds[prj].push(l);
                } else {
                    prj_ds['unknown'].push(l);
                }
            }
        });

        return prj_ds;
    }

    /*
    //    General function to submit stager job.
    //    The stager job is responsible for uploading data to RDM archive.
    */
    var submitStagerJob = function(src, toCatchall, minProgress, maxProgress, cb_async ) {

        var RestClient = require('node-rest-client').Client;

        var prj_ds = {};
        try {
            prj_ds = findUpdateProjectDs(src);
            // assuming we are halfway done in this step
            job.progress( minProgress + (maxProgress - minProgress)/2, 100 );
        } catch(err) {
            // stop the process
            utility.printErr('[MEG:execStreamerJob:submitStagerJob]', err);
            return cb_async(err, 1);
        }

        // mapValue model to submit stager jobs in parallel
        async.mapValues( prj_ds, function( ds_list, p, cb_async_stager) {

            if ( p == 'unknown' && ! toCatchall ) {
                utility.printLog('[MEG:execStreamerJob:submitStagerJob]', 'skip: '+JSON.stringify(ds_list));
                return cb_async_stager(null, true);
            }

            var c_stager = new RestClient({
                user: config.get('DataStager.username'),
                password: config.get('DataStager.password')
            });

            var rget_args = { headers: { 'Accept': 'application/json' } };

            var myurl = config.get('DataStager.url') + '/rdm/DAC/project/';
            if ( toCatchall || p == 'unknown' ) {
                myurl += '_CATCHALL.MEG';
            } else {
                myurl += p;
            }

            c_stager.get(myurl, rget_args, function(rdata, resp) {

                if ( resp.statusCode >= 400 ) {  //HTTP error
                    var errmsg = 'HTTP error: (' + resp.statusCode + ') ' + resp.statusMessage;
                    utility.printErr('[MEG:execStreamerJob:submitStagerJob]', errmsg);
                    return cb_async_stager(errmsg, false);
                }

                // here we get the collection namespace for the project

                var rpost_args = {
                    headers: { 'Accept': 'application/json',
                               'Content-Type': 'application/json' },
                    data: []
                };

                if ( ds_list.length == 0 ) {
                    return cb_async_stager(null, true);
                }

                ds_list.forEach( function(ds) {
                    // construct destination URL
                    var dst = 'irods:' + rdata.collName + '/raw/';
                    var dst_tail = ds.replace(config.get('MEG.streamerDataDirRoot') + '/', '');
                    if( toCatchall ) {
                        if ( p == 'unknown' ) {
                            // the date folder is preserved
                            dst += dst_tail;
                        } else {
                            // the date folder is removed
                            dst += p + '/' + dst_tail.replace(new RegExp('^20[0-9]{6}/'), '');
                        }
                    } else {
                        // the date folder is removed
                        dst += dst_tail.replace(new RegExp('^20[0-9]{6}/'), '');
                    }

                    // add job data to post_args
                    rpost_args.data.push({
                        'type': 'rdm',
                        'data': { 'clientIF': 'irods',
                                  'stagerUser': 'root',
                                  'rdmUser': 'irods',
                                  'title': '[' + (new Date()).toISOString() + '] Streamer.MEG: ' + path.basename(ds),
                                  'timeout': 3600,
                                  'timeout_noprogress': 600,
                                  'srcURL': ds,
                                  'dstURL': dst },
                        'options': { 'attempts': 5,
                                     'backoff': { 'delay' : 60000,
                                                  'type'  : 'fixed' } }
                    });
                }
                
                // post new jobs to stager
                if ( rpost_args.data.length > 0 ) {
                    c_stager.post(config.get('DataStager.url') + '/job', rpost_args, function(rdata, resp) {
                        if ( resp.statusCode >= 400 ) {  //HTTP error
                            var errmsg = 'HTTP error: (' + resp.statusCode + ') ' + resp.statusMessage;
                            utility.printErr('[MEG:execStreamerJob:submitStagerJob]', errmsg);
                            return cb_async_stager(errmsg, false);
                        } else {
                            rdata.forEach( function(d) {
                                utility.printLog('[MEG:execStreamerJob:submitStagerJob]', JSON.stringify(d));
                            });
                            // everything is fine
                            return cb_async_stager(null, true);
                        }
                    }).on('error', function(err) {
                        utility.printErr('[MEG:execStreamerJob:submitStagerJob]', err);
                        var errmsg = 'fail submitting stager jobs: ' + JSON.stringify(ds_list);
                        job.log(errmsg);
                        return cb_async_stager(errmsg, false);
                    });
                } else {
                    return cb_async_stager(null, true);
                }
            }).on('error', function(err) {
                // fail to get collection for project
                var errmsg = 'cannot get collection for project: ' + p;
                utility.printErr('[MEG:execStreamerJob:submitStagerJob]', err);
                job.log(errmsg);
                // this will cause process to stop
                return cb_async_stager(errmsg, false);
            });
        }, function (err, outputs) {
            // the mapValues are done
            utility.printLog('[MEG:execStreamerJob:submitJobStager]', 'output: ' + JSON.stringify(outputs));
            if (err) {
                return cb_async('fail submitting stager jobs', 1);
            } else {
                // we are done in this step
                job.progress( maxProgress, 100 );
                return cb_async(null, 0);
            }
        });
    }

    // here are logical steps run in sequencial order
    var i = 0;
    async.series([
        function(cb) {
            // step 1: rsync to catch-all project storage
            var src = config.get('MEG.consoleHostname') + ':' +
                      config.get('MEG.consoleDataDirRoot') + '/' + job.data.srcDir;
            var dst = config.get('MEG.streamerDataDirRoot') + '/' + job.data.srcDir;
            runRsync(src, dst, true, 0, 40, cb);
        },
        function(cb) {
            // step 2: archive to catch-all collection
            var src = config.get('MEG.streamerDataDirRoot') + '/' + job.data.srcDir;
            submitStagerJob(src, true, 40, 70, cb);
        },
        // function(cb) {
        //     // step 3: rsync to project storage
        //     i = 50;
        //     console.log('job ' + job.id + ': stage2collc start');
        //     var timer = setInterval( function() {
        //         if ( cb_remove() ) {
        //             clearInterval(timer);
        //             return cb('stage2collc process interrupted due to job removal')
        //         } else {
        //             if ( i < 75 ) {
        //                 job.progress(i++,100);
        //             } else {
        //                 clearInterval(timer);
        //                 return cb(null, 0);
        //             }
        //         }
        //     },1000);
        // },
        function(cb) {
            // step 4: archive to project collection
            var src = config.get('MEG.streamerDataDirRoot') + '/' + job.data.srcDir;
            submitStagerJob(src, false, 70, 100, cb);
        }],
        function(err, results) {
            if (err) {
                cb_done(err);
            } else {
                utility.printLog('[MEG:execStreamerJob]', 'output: ' + JSON.stringify(results));
                cb_done();
            }
        }
    );
}

module.exports.createStreamerJob = _createStreamerJob;
module.exports.execStreamerJob = _execStreamerJob;
