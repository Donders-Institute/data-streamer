const path = require('path');
const fs = require('fs');
const utility = require('./utility');

const restPaths = {
    'postJob': '/:date/:project/:subject/:session'
};

// create new streamer job on a POST action to the streamer
var _createStreamerJob = function(name, config, queue) {

  return function( req, res ) {

      // submit a streamer job
      // - the job shouldn't take more than 30 minutes to complete
      // - the job has max. 5 attempts in case of failure, each attempt is delayed by 1 min.
      if ( queue ) {
          var job = queue.create('streamer', {
              modality: name,
              title: '[' + (new Date()).toISOString() + '] ' + req.params['project'] + ":sub-" + req.params['subject'] + ":ses-opm" + req.params['session'],
              date: req.params['date'],
              project: req.params['project'],
              subject: req.params['subject'],
              session: req.params['session']
          }).attempts(5).ttl(1800*1000).backoff( {delay: 60*1000, type:'fixed'} ).save(function(err) {
              if ( err ) {
                  utility.printErr(job.id + ':OPM:create streamer job', err);
                  utility.responseOnError('json',{'error': 'fail creating job: ' + err}, res);
              } else {
                  res.json({'message': 'job ' + job.id + ' created'});
              }
          });
      } else {
          utility.printErr(job.id + ':OPM:create streamer job', 'invalid job queue: ' + queue);
          utility.responseOnError('json',{'error': 'invalid queue'}, res);
      }
  }
}

// run a streamer job given a job data
var _execStreamerJob = function(name, config, job, cb_remove, cb_done) {

    var async = require('async');

    /* General function to copy data from catchall project to individual projects */
    var copyToProjects = function(srcDir, minProgress, maxProgress, cb_async) {

        var dstDir = path.join(
            "/project",
            job.data.project,
            "raw",
            "sub-" + job.data.subject,
            "ses-opm" + job.data.session
        );

        var ncp = require('ncp').ncp;
        ncp.limit = 2;
        ncp(srcDir, dstDir, function(err) {
            if (err) {
                var errmsg = 'failed copy data: ' + err;
                utility.printErr(job.id + ':OPM:execStreamerJob:copyToProjects', errmsg);
                return cb_async(errmsg, false);
            } else {
                utility.printLog(job.id + ':OPM:execStreamerJob:copyToProjects', srcDir + ' -> ' + dstDir);
                job.progress(maxProgress, 100);
                return cb_async(null, true);
            }
        });
    };

    /*
    //    General function to submit stager job.
    //    The stager job is responsible for uploading data to RDM archive.
    */
    var submitStagerJob = function(srcDir, minProgress, maxProgress, cb_async ) {

        var RestClient = require('node-rest-client').Client;
        var sconfig = require('config').get('DataStager');

        var c_stager = new RestClient({
            user: sconfig.username,
            password: sconfig.password
        });

        var rget_args = { headers: { 'Accept': 'application/json' } };

        var myurl = sconfig.url + '/dac/project/' + job.data.project;

        var complete = () => {
            job.progress(maxProgress, 100);
            return cb_async(null, true)
        };

        c_stager.get(myurl, rget_args, function(rdata, resp) {
            if ( resp.statusCode >= 400 ) {
                var errmsg = 'HTTP error: (' + resp.statusCode + ') ' + resp.statusMessage;
                if ( resp.statusCode == 404 && !toCatchall ) {
                    // accept 404 NOT FOUND error if it's not about a catchall collection
                    // it can happen when it's about a PILOT project; or a project not having
                    // a RDM collection being created/mapped properly.
                    utility.printLog(job.id + ':OPM:execStreamerJob:submitStagerJob', 'collection not found for project: ' + p);
                    return complete;
                } else {
                    utility.printErr(job.id + ':OPM:execStreamerJob:submitStagerJob', errmsg);
                    return cb_async(errmsg, false);
                }
            }

            // here we get the collection namespace for the project
            var rpost_args = {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                data: {
                    jobs: []
                }
            };

            if ( src_list.length == 0 ) {
                return complete;
            }

            var dstColl = 'irods:' + path.join(
                rdata.collName,
                'raw',
                'sub-' + job.data.subject,
                'ses-opm' + job.data.session
            );

            rpost_args.data.jobs.push({
                "drUser": utility.getOuFromCollName(rdata.collName) + "-stager@ru.nl",
                "dstURL": dstColl,
                "srcURL": srcDir,
                "stagerUser": sconfig.username,
                "stagerUserEmail": "",
                "timeout": 1800,
                "timeout_noprogress": 600,
                "title": '[' + (new Date()).toISOString() + '] Streamer.OPM: ' + path.basename(src_list[i])                
            })

            // post new jobs to stager
            c_stager.post(sconfig.url + '/jobs', rpost_args, function(rdata, resp) {
                if ( resp.statusCode >= 400 ) {  //HTTP error
                    var errmsg = 'HTTP error: (' + resp.statusCode + ') ' + resp.statusMessage;
                    utility.printErr(job.id + ':OPM:execStreamerJob:submitStagerJob', errmsg);
                    return cb_async(errmsg, false);
                } else {
                    rdata.jobs.forEach( function(stagerJobData) {
                        utility.printLog(job.id + ':OPM:execStreamerJob:submitStagerJob', JSON.stringify(stagerJobData));
                    });
                    // everything is fine
                    return complete;
                }
            }).on('error', function(err) {
                utility.printErr(job.id + ':OPM:execStreamerJob:submitStagerJob', err);
                var errmsg = 'fail submitting stager jobs: ' + JSON.stringify(src_list);
                job.log(errmsg);
                return cb_async(errmsg, false);
            });
        }).on('error', function(err) {
            // fail to get collection for project
            var errmsg = 'cannot get collection for project: ' + p;
            utility.printErr(job.id + ':OPM:execStreamerJob:submitStagerJob', err);
            job.log(errmsg);
            // this will cause process to stop
            return cb_async(errmsg, false);
        });
    }

    // here are logical steps run in sequential order
    var i = 0;

    // catchall directory
    var dirCatchall = path.join(
        config.streamerDataDirRoot,
        job.data.date,
        job.data.project,
        "sub-" + job.data.subject,
        "ses-opm" + job.data.session
    );

    async.waterfall([
        function(cb) {
            // check existance of `dirCatchall`
            try {
                var stats = fs.lstatSync(dirCatchall)
                if ( ! stats.isDirectory() ) {
                    throw new Error("" + dirCatchall + " not a directory");
                }
                return cb(null, true);
            } catch(err) {
                return cb(err, false);
            }
        },
        function(cb) {
            // step 1: copy data from catch-all to corresponding project
            copyToProjects(dirCatchall, 0, 50, cb);
        },
        function(cb) {
            // step 2: archive data to individual project collection
            submitStagerJob(dirCatchall, 50, 100, cb);
        }],
        function(err, results) {
            if (err) {
                cb_done(err, false);
            } else {
                utility.printLog(job.id + ':OPM:execStreamerJob', 'output: ' + JSON.stringify(results));
                cb_done(null, true);
            }
        }
    );
}

module.exports.restPaths = restPaths;
module.exports.createStreamerJob = _createStreamerJob;
module.exports.execStreamerJob = _execStreamerJob;
