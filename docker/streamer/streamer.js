var config = require('config');
var kue = require('kue');
var cluster = require('cluster');
var bodyParser = require('body-parser');
var fs = require('fs')
var queue = kue.createQueue({
    redis: {
        port: 6379,
        host: 'streamer-db'
    }
});
var path = require('path');

// utility module
var util = require('util');
var utility = require('./lib/utility');

// modality modules
var m_meg = require('./lib/modalityMEG');
var m_mri = require('./lib/modalityMRI');
var m_test = require('./lib/modalityTEST');

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
    app.post('/meg/:date/:ds?', m_meg.createStreamerJob(queue));
    app.post('/mri/series/:id', m_mri.createStreamerJob(queue));
    app.post('/test/:date/:ds?', m_test.createStreamerJob(queue));

    // RESTful interfaces for queue maintenance
    app.delete('/queue/:unit/:age', m_admin.cleanupQueue(queue));

    // start service for RESTful APIs
    app.use(kue.app);

    app.listen(3001);

    // fork workers
    //var nworkers = require('os').cpus().length - 1;
    var nworkers = 2;
    for (var i = 0; i < nworkers; i++) {
        var w = cluster.fork();

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
    }
}

// Worker process of the cluster
if ( cluster.worker ) {

    var job_removed = false;

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

        domain.on('error', function(err) {
            done(err);
        });

        domain.run( function() {

            // inform master the job has been started
            process.send({'type':'START', 'jid': job.id});

            var job_exec_logic = undefined;
            switch( job.data.modality ) {
                case 'meg':
                    job_exec_logic = m_meg.execStreamerJob;
                    break;

                case 'mri':
                    job_exec_logic = m_mri.execStreamerJob;
                    break;

                case 'test':
                    job_exec_logic = m_test.execStreamerJob;
                    break;

                default:
                    done('unknown modality: ' + job.data.modality);
                    break;
            }

            // run the job execution logic
            if ( job_exec_logic ) {

                var cb_remove = function() {
                    return job_removed;
                }

                job_exec_logic(job, cb_remove, done);
            }
        });
    });
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
