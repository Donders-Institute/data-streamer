const auth = require('basic-auth');
const child_process = require('child_process');
const path = require('path');
const kill = require('tree-kill');
const fs = require('fs');
const utility = require('./utility');

const restPaths = {
    'postJob': '/:date/:ds?'
};

// create new streamer job on a POST action to the streamer
var _createStreamerJob = function(name, config, queue) {

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
              modality: name,
              title: '[' + (new Date()).toISOString() + '] ' + srcPathConsole,
              srcDir: srcPathConsole
          }).attempts(5).ttl(3600*1000).backoff( {delay: 60*1000, type:'fixed'} ).save(function(err) {
              if ( err ) {
                  utility.printErr(job.id + ':MEG:create streamer job', err);
                  utility.responseOnError('json',{'error': 'fail creating job: ' + err}, res);
              } else {
                  res.json({'message': 'job ' + job.id + ' created'});
              }
          });
      } else {
          utility.printErr(job.id + ':MEG:create streamer job', 'invalid job queue: ' + queue);
          utility.responseOnError('json',{'error': 'invalid queue'}, res);
      }
  }
}

// run a streamer job given a job data
var _execStreamerJob = function(name, config, job, cb_remove, cb_done) {

    var async = require('async');

    /*
    // General function to run meg_copy.sh in a child process
    // The meg_copy.sh script is a shell script running the rsync command
    // to copy files from the MEG console to the central storage that is
    // accessible as a local file system of the streamer.
    */
    var rsyncToCatchall = function(src, dst, createDir, minProgress, maxProgress, cb_async ) {

        var cp_end = false;

        // TODO: need a better way to refer to the executable directory
        var cmd = __dirname + '/../bin/meg_copy.sh';

        var cmd_args = [
            src,
            config.consoleUsername,
            config.consolePassword,
            dst];

        var cmd_opts = {
            shell: '/bin/bash'
        };

        // create destination directory on request
        if ( ! fs.existsSync(dst) && createDir ) {
            try {
                //TODO: this is NOT a good way to create directory recursively
                child_process.execSync('mkdir -p "' + dst + '"');
            } catch(err) {}
        }

        var child = child_process.spawn(cmd, cmd_args, cmd_opts);

        // define callback when child process is closed
        child.on('close', function(code, signal) {
            // notify the timer that the child process has been finished
            cp_end = true;

            // close up the stdin stream
            // TODO: is it really necessary??
            child.stdin.end();

            // interruption handling (null if process is not interrupted)
            if ( code != 0 ) {
                utility.printErr(job.id + ':MEG:execStreamerJob:rsyncToCatchall', 'non-zero exit code: ' + code);
                return cb_async('rsync process non-zero exit code: ' + code + ' (' + signal + ')', dst);
            } else {
                // set job progress to maxProgress
                utility.printLog(job.id + ':MEG:execStreamerJob:rsyncToCatchall', 'done');
                job.progress(maxProgress, 100);
                return cb_async(null, dst);
            }
        });

        child.on('error', function(err) {
            utility.printErr(job.id + ':MEG:execStreamerJob:rsyncToCatchall',err);
            return cb_async('rsync process error: ' + err, dst);
        })

        // define callback when receiving new stderr from the child process
        child.stderr.on('data', function(errbuf) {
            var errmsg = errbuf.toString();
            errbuf = null;
            job.log(errmsg);
            utility.printErr(job.id + ':MEG:execStreamerJob:rsyncToCatchall', errmsg);
        });

        // define callback when receiving new stderr from the child process
        child.stdout.on('data', function(outbuf) {
            var outmsg = outbuf.toString();
            outbuf = null;
            try {
                var p = minProgress + Math.round( parseInt(outmsg.trim()) * maxProgress / 100 );
                job.progress(p, 100);
            } catch(err) {
                // something wrong in parsing the data into progress value
                job.log(outmsg);
                utility.printErr(job.id + ':MEG:execStreamerJob:rsyncToCatchall',err);
            }
        });

        // set timer to check whether there is a removal request from end user
        var timer = setInterval( function() {
            if ( cb_remove() ) {
                kill(child.pid, 'SIGKILL', function(err) {
                    if (err) {
                        utility.printErr(job.id + ':MEG:execStreamerJob:rsyncToCatchall', err);
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
    var resolveUpdatedDatasets = function(baseDir, cb_async) {
        var os = require('os');
        var cmd = __dirname + '/../bin/find-update-ds.sh'
        var cmd_args = [baseDir, config.timeWindowInMinute]
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
                var m = prj_regex.exec(l.replace(config.streamerDataDirRoot + '/', ''));
                if (m) {
                    var prj = (m[1].indexOf('.') == 7) ? m[1]:[m[1].slice(0, 7), '.', m[1].slice(7)].join('')
                    if ( ! prj_ds[prj] ) { prj_ds[prj] = []; }
                    prj_ds[prj].push(l);
                } else {
                    prj_ds['unknown'].push(l);
                }
            }
        });

        return cb_async(null, prj_ds);
    };

    /* General function to resolve the dataset directory within individual project */
    var resolveDatasetProjectPaths = function(prefix_prj, ds_list) {
        var path_list = [];
        var subses_regex = new RegExp("^.*sub([0-9]+)ses([0-9]+).*$");
        ds_list.forEach( function(ds) {
            var m = subses_regex.exec( path.basename(ds).split('_')[0] );
            if ( m ) {
                path_list.push(path.join(prefix_prj, 'raw', 'sub-' + m[1], 'ses-meg' + m[2], path.basename(ds)));
            } else {
                path_list.push(path.join(prefix_prj, 'raw', path.basename(ds)));
            }
        } );
        return path_list;
    };

    /* General function to copy data from catchall project to individual projects */
    var copyToProjects = function(prj_ds, useRsync, minProgress, maxProgress, cb_async) {

        var p_total = Object.keys(prj_ds).length;
        var p_done = 0;
        async.mapValues( prj_ds, function( src_list, p, cb_copy) {
            if ( p == 'unknown' ) {
                utility.printLog(job.id + ':MEG:execStreamerJob:copyToProjects', 'skip datasets: '+JSON.stringify(src_list));
                job.progress(minProgress+Math.round((++p_done)*(maxProgress-minProgress)/p_total), 100);
                return cb_copy(null, true);
            }

            // skip if the project storage folder is not presented
            if ( ! fs.existsSync(path.join('/project', p)) ) {
                  // skip: non-existing project in central storage
                  utility.printLog(job.id + ':MEG:execStreamerJob:copyToProjects', 'project storage not found, skip: ' + p);
                  job.progress(minProgress+Math.round((++p_done)*(maxProgress-minProgress)/p_total), 100);
                  return cb_copy(null, true);
            }

            // construct destination directories for ds dep. on the availability of sub-ses number
            var dst_list = resolveDatasetProjectPaths(path.join('/project', p), src_list);

            // TODO: perform actual data synchronisation from source (src_list) to destination (dst_list)
            var tasks = {};
            for( var i=0; i<src_list.length; i++ ) {
                tasks[src_list[i]] = dst_list[i];
            }

            // actual dataset copy
            async.mapValuesLimit(tasks, 2, function(dst, src, cb_task) {
                // make sure the parent directory is presented at the destination
                try {
                  //TODO: this is NOT a good way to create directory recursively
                  child_process.execSync('mkdir -p "' + path.dirname(dst) + '"');
                } catch(err) {}

                if ( useRsync ) {
                    var cmd = 'rsync';
                    var cmd_args = ['-rpv',src, path.dirname(dst)];
                    var cmd_opts = {
                        shell: '/bin/bash'
                    };
                    var cp_end = false;
                    var child = child_process.spawn(cmd, cmd_args, cmd_opts);
                    // define callback when child process is closed
                    child.on('close', function(code, signal) {
                        // notify the timer that the child process has been finished
                        cp_end = true;

                        // close up the stdin stream
                        // TODO: is it really necessary??
                        child.stdin.end();

                        // interruption handling (null if process is not interrupted)
                        if ( code != 0 ) {
                            var errmsg = 'rsync process non-zero exit code: ' + code + ' (' + signal + ')';
                            utility.printErr(job.id + ':MEG:execStreamerJob:copyToProjects', errmsg);
                            return cb_task(errmsg, false);
                        } else {
                            // set job progress to maxProgress
                            utility.printLog(job.id + ':MEG:execStreamerJob:copyToProjects', src + ' -> ' + dst);
                            return cb_task(null, true);
                        }
                    });

                    child.on('error', function(err) {
                        utility.printErr(job.id + ':MEG:execStreamerJob:copyToProjects',err);
                        return cb_task('rsync process error: ' + err, false);
                    })

                    // define callback when receiving new stderr from the child process
                    child.stderr.on('data', function(errbuf) {
                        var errmsg = errbuf.toString();
                        errbuf = null;
                        job.log(errmsg);
                        utility.printErr(job.id + ':MEG:execStreamerJob:copyToProjects', errmsg);
                    });

                    // define callback when receiving new stderr from the child process
                    child.stdout.on('data', function(outbuf) {
                        outbuf = null;
                    });

                    // set timer to check whether there is a removal request from end user
                    var timer = setInterval( function() {
                        if ( cb_remove() ) {
                            kill(child.pid, 'SIGKILL', function(err) {
                                if (err) {
                                    utility.printErr(job.id + ':MEG:execStreamerJob:copyToProjects', err);
                                }
                            });
                        }

                        // clear the timer when the process has been closed
                        if ( cp_end ) {
                            clearInterval(timer);
                        }
                    },1000);
                } else {
                    var ncp = require('ncp').ncp;
                    ncp.limit = 10;
                    ncp(src, dst, function(err) {
                        if (err) {
                            var errmsg = 'failed copy data: ' + err;
                            utility.printErr(job.id + ':MEG:execStreamerJob:copyToProjects', errmsg);
                            return cb_task(errmsg, false);
                        } else {
                            utility.printLog(job.id + ':MEG:execStreamerJob:copyToProjects', src + ' -> ' + dst);
                            return cb_task(null, true);
                        }
                    });
                }
            }, function( err, results ) {
                if (err) {
                    return cb_copy(err, false);
                } else {
                    job.progress(minProgress+Math.round((++p_done)*(maxProgress-minProgress)/p_total), 100);
                    return cb_copy(null, true);
                }
            });

        }, function (err, outputs) {
            // the mapValues are done
            utility.printLog(job.id + ':MEG:execStreamerJob:copyToProjects', 'output: ' + JSON.stringify(outputs));
            if (err) {
                return cb_async('fail rsyncing data to projects', prj_ds);
            } else {
                // we are done in this step
                job.progress( maxProgress, 100 );
                return cb_async(null, prj_ds);
            }
        });
    };

    /*
    //    General function to submit stager job.
    //    The stager job is responsible for uploading data to RDM archive.
    */
    var submitStagerJob = function(prj_ds, toCatchall, minProgress, maxProgress, cb_async ) {

        var RestClient = require('node-rest-client').Client;
        var sconfig = require('config').get('DataStager');

        // mapValue model to submit stager jobs in parallel
        async.mapValues( prj_ds, function(src_list, p, cb_async_stager) {

            if ( p == 'unknown' && ! toCatchall ) {
                utility.printLog(job.id + ':MEG:execStreamerJob:submitStagerJob', 'skip datasets: '+JSON.stringify(src_list));
                return cb_async_stager(null, true);
            }

            var c_stager = new RestClient({
                user: sconfig.username,
                password: sconfig.password
            });

            var rget_args = { headers: { 'Accept': 'application/json' } };

            var myurl = sconfig.url + '/rdm/DAC/project/';
            if ( toCatchall || p == 'unknown' ) {
                myurl += '_CATCHALL.MEG';
            } else {
                myurl += p;
            }

            c_stager.get(myurl, rget_args, function(rdata, resp) {
                if ( resp.statusCode >= 400 ) {
                    var errmsg = 'HTTP error: (' + resp.statusCode + ') ' + resp.statusMessage;
                    if ( resp.statusCode == 404 && !toCatchall ) {
                        // accept 404 NOT FOUND error if it's not about a catchall collection
                        // it can happen when it's about a PILOT project; or a project not having
                        // a RDM collection being created/mapped properly.
                        utility.printLog(job.id + ':MRI:execStreamerJob:submitStagerJob', 'collection not found for project: ' + p);
                        return cb_async_stager(null, true);
                    } else {
                        utility.printErr(job.id + ':MEG:execStreamerJob:submitStagerJob', errmsg);
                        return cb_async_stager(errmsg, false);
                    }
                }

                // here we get the collection namespace for the project
                var rpost_args = {
                    headers: { 'Accept': 'application/json',
                               'Content-Type': 'application/json' },
                    data: []
                };

                if ( src_list.length == 0 ) {
                    return cb_async_stager(null, true);
                }

                // construct destination collection
                var dst_list = [];
                if ( toCatchall ) {
                    // for catchall, simply replace the path prefix with collection prefix
                    src_list.forEach( function(src) {
                        dst_list.push('irods:' + rdata.collName + '/raw/' +
                                      src.replace(config.streamerDataDirRoot + '/', ''));
                    });
                } else {
                    // for individual project, try resolve sub-ses subtree structure if available
                    dst_list = resolveDatasetProjectPaths('irods:' + rdata.collName + '/', src_list);
                }

                for( var i=0; i<src_list.length; i++ ) {
                    // add job data to post_args
                    rpost_args.data.push({
                        'type': 'rdm',
                        'data': { 'clientIF': 'irods',
                                  'stagerUser': 'root',
                                  'rdmUser': 'irods',
                                  'title': '[' + (new Date()).toISOString() + '] Streamer.MEG: ' + path.basename(src_list[i]),
                                  'timeout': 3600,
                                  'timeout_noprogress': 600,
                                  'srcURL': src_list[i],
                                  'dstURL': dst_list[i] },
                        'options': { 'attempts': 5,
                                     'backoff': { 'delay' : 60000,
                                                  'type'  : 'fixed' } }
                    });
                }

                // post new jobs to stager
                if ( rpost_args.data.length > 0 ) {
                    c_stager.post(sconfig.url + '/job', rpost_args, function(rdata, resp) {
                        if ( resp.statusCode >= 400 ) {  //HTTP error
                            var errmsg = 'HTTP error: (' + resp.statusCode + ') ' + resp.statusMessage;
                            utility.printErr(job.id + ':MEG:execStreamerJob:submitStagerJob', errmsg);
                            return cb_async_stager(errmsg, false);
                        } else {
                            rdata.forEach( function(d) {
                                utility.printLog(job.id + ':MEG:execStreamerJob:submitStagerJob', JSON.stringify(d));
                            });
                            // everything is fine
                            return cb_async_stager(null, true);
                        }
                    }).on('error', function(err) {
                        utility.printErr(job.id + ':MEG:execStreamerJob:submitStagerJob', err);
                        var errmsg = 'fail submitting stager jobs: ' + JSON.stringify(src_list);
                        job.log(errmsg);
                        return cb_async_stager(errmsg, false);
                    });
                } else {
                    return cb_async_stager(null, true);
                }
            }).on('error', function(err) {
                // fail to get collection for project
                var errmsg = 'cannot get collection for project: ' + p;
                utility.printErr(job.id + ':MEG:execStreamerJob:submitStagerJob', err);
                job.log(errmsg);
                // this will cause process to stop
                return cb_async_stager(errmsg, false);
            });
        }, function (err, outputs) {
            // the mapValues are done
            utility.printLog(job.id + ':MEG:execStreamerJob:submitStagerJob', 'output: ' + JSON.stringify(outputs));
            if (err) {
                return cb_async('fail submitting stager jobs', prj_ds);
            } else {
                // we are done in this step
                job.progress( maxProgress, 100 );
                return cb_async(null, prj_ds);
            }
        });
    }

    // here are logical steps run in sequencial order
    var i = 0;
    async.waterfall([
        function(cb) {
            // step 1: rsync from MEG console to the catch-all project
            var src = config.consoleHostname + ':' +
                      config.consoleDataDirRoot + '/' + job.data.srcDir;
            var dst = config.streamerDataDirRoot + '/' + job.data.srcDir;
            rsyncToCatchall(src, dst, true, 0, 40, cb);
        },
        function(src, cb) {
            // step 2: resolve recently updated datasets by project number
            resolveUpdatedDatasets(src, cb);
        },
        function(prj_ds, cb) {
            // step 3: archive data to the catch-all collection
            submitStagerJob(prj_ds, true, 40, 50, cb);
        },
        function(prj_ds, cb) {
            // step 4: archive data to individual project collection
            submitStagerJob(prj_ds, false, 50, 60, cb);
        },
        function(prj_ds, cb) {
            // step 5: rsync data from catchall to individual projects
            var useRsync = true;
            copyToProjects(prj_ds, useRsync, 70, 100, cb);
        }],
        function(err, results) {
            if (err) {
                cb_done(err, false);
            } else {
                utility.printLog(job.id + ':MEG:execStreamerJob', 'output: ' + JSON.stringify(results));
                cb_done(null, true);
            }
        }
    );
}

module.exports.restPaths = restPaths;
module.exports.createStreamerJob = _createStreamerJob;
module.exports.execStreamerJob = _execStreamerJob;
