var kue = require('kue');
var cluster = require('cluster');
var bodyParser = require('body-parser');
var fs = require('fs')
var queue = kue.createQueue({
    redis: {
        port: process.env.REDIS_PORT,
        host: process.env.REDIS_HOST
    }
});
var path = require('path');

// utility module
var util = require('util');
var utility = require('./lib/utility');

// modality modules
var m_list = {};
var m_config = require('config').get('Modalities');
Object.keys(m_config).forEach(function(k) {
    m_list[k] = require('./lib/modality' + m_config[k].type );
});

// admin module
var m_admin = require('./lib/admin');

var active_pids = {};

const streamer_bindir = __dirname + path.sep + 'bin';

queue.on( 'error', function(err) {
    if ( cluster.isMaster) {
        utility.printErr(null, err);
    }
}).on( 'job enqueue', function(id, type) {
    if ( cluster.isMaster) {
        utility.printLog(null, util.format('job %d enqueued for %s', id, type));
    }
}).on( 'job complete', function(id, result) {
    if ( cluster.isMaster) {
        utility.printLog(null, util.format('job %d complete', id));
    }
}).on( 'job failed attempt', function(id, err, nattempts) {
    if ( cluster.isMaster) {
        utility.printLog(null, util.format('job %d failed, attempt %d', id, nattempts));
    }
}).on( 'job failed' , function(id, err) {
    if ( cluster.isMaster) {
        utility.printLog(null, util.format('job %d failed', id));
    }
}).on( 'job remove', function(id, err) {
    if ( cluster.isMaster) {
        var pinfo = active_pids[id];
        if ( ! (pinfo === undefined) ) {
            // inform worker to kill the process
            pinfo['worker'].send({'type': 'KILL', 'jid': id});
        }
        delete active_pids[id];
        utility.printLog(null, util.format('job %d removed', id));
    }
});

// Master process of the cluster
if (cluster.isMaster) {

    // set up express app
    var express = require('express');
    var app = express();

    // basicAuth
    var auth = require('./lib/auth');
    app.use(auth.basicAuth);

    // bodyParser so that FORM data become available in req.body
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));

    // RESTful interfaces for creating modality-specific streamer job
    Object.keys(m_list).forEach(function(k) {
        app.post( path.join('/', k, m_list[k].restPaths.postJob),
                  m_list[k].createStreamerJob(k, m_config[k], queue) );
    });

    // RESTful interfaces for queue maintenance
    app.delete('/queue/:unit/:age', m_admin.cleanupQueue(queue));

    // start service for RESTful APIs
    app.use(kue.app);

    app.listen(3001);

    // fork workers
    var create_worker = function() {
        var w = cluster.fork();
        utility.printLog(null, 'new worker created: ' + w.id);
        // message handling when the master receives message from a worker
        w.on('message', function(msg) {
            switch( msg.type ) {

                case 'START':
                    active_pids[msg['jid']] = {'worker': this};
                    utility.printLog(null, util.format('job %s run by worker %s', msg['jid'], active_pids[msg['jid']]['worker'].id));
                    break;

                default:
                    break;
            }
        });

        w.on('exit', function(code, signal) {
            utility.printErr(null, util.format('worker %s exits with code (%s) signal (%s)', this.id, code, signal));
            create_worker();
        });
    }

    //var nworkers = require('os').cpus().length - 1;
    var nworkers = 2;
    for (var i = 0; i < nworkers; i++) {
        create_worker();
    }
}

// Worker process of the cluster
if ( cluster.isWorker ) {

    //var heapdump = require('heapdump');

    var job_removed = false;

    // a worker lable indicating whether the worker is busy on a job
    var isBusy = false;

    // message handling when the worker receives message from the master
    process.on('message', function(msg) {
        switch( msg.type ) {
            case 'KILL':
                utility.printLog( null, 'job ' + msg['jid'] + ' killed upon user removal');
                job_removed = true;
                break;

            default:
                break;
        }
    });

    // main logic of streamer task
    queue.process("streamer", function(job, done) {

        var domain = require('domain').create();
        isBusy = true;

        domain.on('error', function(err) {
            isBusy = false;
            done(err);
        });

        domain.run( function() {

            // inform master the job has been started
            process.send({'type':'START', 'jid': job.id});

            var job_exec_logic = (m_list[job.data.modality]) ? m_list[job.data.modality].execStreamerJob:undefined;

            // run the job execution logic
            if ( job_exec_logic ) {
                var cb_remove = function() {
                    return job_removed;
                }
                console.log( "mem report@job start, worker " + cluster.worker.id + ": " + JSON.stringify(process.memoryUsage()) );

                var async = require('async');
                async.series([
                    function(cb_done) {
                        job_exec_logic(job.data.modality, m_config[job.data.modality], job, cb_remove, cb_done);
                    }
                ],
                function(err, results) {
                    isBusy = false;
                    if (err) {
                      done(err);
                    } else {
                      done();
                    }
                });
            }
        });
    });

    setInterval( function() {
        // force garbadge collection
        gc();
        console.log( "mem report, " + ((isBusy)?"busy worker ":"idle worker ") + cluster.worker.id + ": " + JSON.stringify(process.memoryUsage()) );
    }, 60*1000 );

}

// graceful shutdown of the queue and the service
function shutdown() {
    if ( cluster.isMaster ) {
        queue.shutdown( 60000, function(err) {
            utility.printLog(null, 'Kue shutdown: ' + err );
            process.exit( 0 );
        });
    }
}

process.once( 'SIGTERM', function(sig) { shutdown(sig); } );
process.once( 'SIGINT', function(sig) { shutdown(sig); } );
