/*

This module is for handling streamer jobs for lab data with
input provided by the streamer-ui interface.  

*/
const child_process = require('child_process');
const path = require('path');
const kill = require('tree-kill');
const fs = require('fs');
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

    // General function to sync data from one local path to the other.
    var syncPath = function(src, dst, createDir, minProgress, maxProgress, cb_async ) {

        // skip this step if src is the same as dst.
        if ( src == dst ) {
            utility.printLog(job.id + ':USER:execStreamerJob:syncPath', 'skipped');
            job.progress(maxProgress, 100);
            return cb_async(null, dst);
        }

        // create destination directory on request
        if ( ! fs.existsSync(dst) && createDir ) {
            try {
                //TODO: this is NOT a good way to create directory recursively
                child_process.execSync('mkdir -p "' + dst + '"');
            } catch(err) {}
        }        

        // execute rsync command to copy data from src to dst
        var cmd = 'rsync';
        var cmd_args = ['-rpv',src+"/", dst+"/"];
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
                utility.printErr(job.id + ':USER:execStreamerJob:syncPath', errmsg);
                return cb_async(errmsg, false);
            } else {
                // set job progress to maxProgress
                utility.printLog(job.id + ':USER:execStreamerJob:syncPath', src + ' -> ' + dst);
                return cb_async(null, true);
            }
        });

        child.on('error', function(err) {
            utility.printErr(job.id + ':User:execStreamerJob:syncPath',err);
            return cb_async('rsync process error: ' + err, false);
        });

        // define callback when receiving new stderr from the child process
        child.stderr.on('data', function(errbuf) {
            var errmsg = errbuf.toString();
            errbuf = null;
            job.log(errmsg);
            utility.printErr(job.id + ':USER:execStreamerJob:syncPath', errmsg);
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
                        utility.printErr(job.id + ':USER:execStreamerJob:syncPath', err);
                    }
                });
            }

            // clear the timer when the process has been closed
            if ( cp_end ) {
                clearInterval(timer);
            }
        },1000);
    };

    // General function to submit stager job.
    // The stager job is responsible for uploading data to Donders Repository.
    var submitStagerJob = function(src, toCatchall, minProgress, maxProgress, cb_async ) {

        var RestClient = require('node-rest-client').Client;
        var sconfig = require('config').get('DataStager');

        var p = job.data.projId;

        // setup connection to the stager service
        var c_stager = new RestClient({
            user: sconfig.username,
            password: sconfig.password
        });
        var rget_args = { headers: { 'Accept': 'application/json' } };
        var myurl = sconfig.url + '/rdm/DAC/project/';
        if ( toCatchall || p == 'unknown' ) {
            // NOTE: it requires the stager to provide endpoint to get the USER catchall collection.
            myurl += '_CATCHALL.USER';
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
                    utility.printLog(job.id + ':USER:execStreamerJob:submitStagerJob', 'collection not found for project: ' + p);
                    job.progress(maxProgress, 100);
                    return cb_async(null, true);
                } else {
                    utility.printErr(job.id + ':USER:execStreamerJob:submitStagerJob', errmsg);
                    return cb_async(errmsg, false);
                }
            }

            // here we get the collection namespace for the project
            var rpost_args = {
                headers: { 'Accept': 'application/json',
                           'Content-Type': 'application/json' },
                data: []
            };

            // construct destination collection
            var dst = 'irods:' + rdata.collName;
            if ( toCatchall ) {
                // for catchall, simply replace the path prefix with collection prefix

                // NOTE: not sure if we should also organise data in year/date like
                //       the catchall collections of MEG and MRI data.
                // var year_reg = new RegExp('^\/([2-9][0-9]{3})[0-9]{4}\/.*');
                // var today = new Date();

                // src: /project/3055000.01/raw/3010001.02/sub-xxx/ses-yyy/...
                // dst: irods:/nl.ru.donders/di/dccn/DAC_3055000.01_467/raw/3010001.02/sub-xxx/ses-yyy/...
                dst_sdir = src.replace(config.streamerDataDirRoot + '/', '');
                dst += '/raw/' + dst_sdir;
            } else {
                // src: /project/3055000.01/raw/3010001.02/sub-xxx/ses-yyy/...
                // dst: irods:/nl.ru.donders/di/dccn/DAC_3010001.02_123/raw/sub-xxx/ses-yyy/...                
                dst_sdir = src.replace(config.streamerDataDirRoot + '/' + p + '/', '');
                dst += '/raw/' + dst_sdir;
            }

            // compose POST data for submitting stager jobs
            rpost_args.data.push({
                'type': 'rdm',
                'data': { 'clientIF': 'irods',
                          'stagerUser': 'root',
                          'rdmUser': 'irods',
                          'title': '[' + (new Date()).toISOString() + '] Streamer.MEG: ' + path.basename(src_list[i]),
                          'timeout': 3600,
                          'timeout_noprogress': 600,
                          'srcURL': src,
                          'dstURL': dst },
                'options': { 'attempts': 5,
                             'backoff': { 'delay' : 60000,
                                          'type'  : 'fixed' } }
            });

            // submit jobs to stager
            c_stager.post(sconfig.url + '/job', rpost_args, function(rdata, resp) {
                if ( resp.statusCode >= 400 ) {  //HTTP error
                    var errmsg = 'HTTP error: (' + resp.statusCode + ') ' + resp.statusMessage;
                    utility.printErr(job.id + ':USER:execStreamerJob:submitStagerJob', errmsg);
                    return cb_async(errmsg, false);
                } else {
                    rdata.forEach( function(d) {
                        utility.printLog(job.id + ':USER:execStreamerJob:submitStagerJob', JSON.stringify(d));
                    });
                    // everything is fine
                    job.progress(maxProgress, 100);
                    return cb_async(null, true);
                }
            }).on('error', function(err) {
                utility.printErr(job.id + ':USER:execStreamerJob:submitStagerJob', err);
                var errmsg = 'fail submitting stager jobs: ' + JSON.stringify(src_list);
                job.log(errmsg);
                return cb_async(errmsg, false);
            });
        }).on('error', function(err) {
            // fail to get collection for project
            var errmsg = 'cannot get collection for project: ' + p;
            utility.printErr(job.id + ':USER:execStreamerJob:submitStagerJob', err);
            job.log(errmsg);
            // this will cause process to stop
            return cb_async(errmsg, false);
        });
    };

    // here are logical steps run in sequencial order
    var i = 0;
    async.waterfall([
        function(cb) {
            // step 1: rsync data from UI buffer to the catch-all project
            var src = path.join(config.streamerUiDataDirRoot, job.data.projId, 'sub-' + job.data.subjId, 'ses-' + job.data.sessId, job.data.dataType);
            var dst = path.join(config.streamerDataDirRoot,   job.data.projId, 'sub-' + job.data.subjId, 'ses-' + job.data.sessId, job.data.dataType);
            syncPath(src, dst, true, 0, 40, cb);
        },
        function(pathCatchall, cb) {
            // step 3: archive data to the catch-all collection
            submitStagerJob(pathCatchall, true, 40, 50, cb);
        },
        function(pathCatchall, cb) {
            // step 4: archive data to individual project collection
            submitStagerJob(pathCatchall, false, 50, 60, cb);
        },
        function(pathCatchall, cb) {
            // step 5: rsync data from catchall to individual projects
            var src = pathCatchall;
            var dst = path.join('project', job.data.projId, 'raw', 'sub-' + job.data.subjId, 'ses-' + job.data.sessId, job.data.dataType);
            syncPath(src, dst, true, 60, 100, cb);
        }],
        function(err, results) {
            if (err) {
                cb_done(err, false);
            } else {
                utility.printLog(job.id + ':USER:execStreamerJob', 'output: ' + JSON.stringify(results));
                cb_done(null, true);
            }
        }
    );
}

module.exports.restPaths = restPaths;
module.exports.createStreamerJob = _createStreamerJob;
module.exports.execStreamerJob = _execStreamerJob;