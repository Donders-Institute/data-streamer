var config = require('config');
var posix = require('posix');
var child_process = require('child_process')
var path = require('path');
var fs = require('fs')
var os = require('os')
var ncp = require('ncp')
var RestClient = require('node-rest-client').Client;

var cmd = './bin/find-update-ds.sh'

var cmd_args = [config.get('sourceDirForRaw'), config.get('timeWindowInMinute')]
var cmd_opts = {
    maxBuffer: 10*1024*1024
}

// list dataset directories in which there are files being update
// TODO: here we assume the project number is presented either
//       3010000.01 or 301000001 on name of the dataset
var prj_regex = new RegExp("^.*(30[0-9]{5}\.{0,1}[0-9]{2}).*$");

var prj_ds = {'unknown': []};

var child = child_process.execFile(cmd, cmd_args, cmd_opts, function(err, stdout, stderr) {

    if (err) {
        //TODO: handle the error properly
        throw err;
    }

    stdout.split(os.EOL).forEach( function(l) {
        if ( l ) {
            var m = prj_regex.exec(l.replace(config.get('sourceDirForRaw') + '/', ''));
            if (m) {
                var prj = (m[1].indexOf('.') == 7) ? m[1]:[m[1].slice(0, 7), '.', m[1].slice(7)].join('')
                if ( ! prj_ds[prj] ) { prj_ds[prj] = []; }
                prj_ds[prj].push(l);
            } else {
                prj_ds['unknown'].push(l);
            }
        }
    });

    //console.log(prj_ds);

    var rget_args = { headers: { 'Accept': 'application/json' } };

    Object.keys(prj_ds).forEach( function(p) {

        // get the catch-all RDM collection 
        var c_stager = new RestClient({ user: config.get('stager.username'),
                                        password: config.get('stager.password') });

        // stage ds to catchall RDM collection
        c_stager.get(config.get('stager.url') + '/rdm/DAC/project/_CATCHALL.MEG', rget_args, function(data, resp) {

            var rpost_args = {
                headers: { 'Accept': 'application/json',
                           'Content-Type': 'application/json' },
                data: []
            };

            prj_ds[p].forEach( function(ds) {
                var pp = (p == 'unknown') ? '':p + '/';
                var dst = 'irods:' + data.collName + '/raw/' + pp + ds.replace(config.get('sourceDirForRaw') + '/', '');
                //console.log('staging ds ' + ds + ' to collection ' + dst);

                // add job data to post_args
                rpost_args.data.push({
                    'type': 'rdm',
                    'data': { 'clientIF': 'irods',
                              'stagerUser': 'root',
                              'rdmUser': 'irods',
                              'title': '[' + (new Date()).toISOString() + '] ' + path.basename(ds),
                              'timeout': 3600,
                              'timeout_noprogress': 600,
                              'srcURL': ds,
                              'dstURL': dst },
                    'options': { 'attempts': 5,
                                 'backoff': { 'delay' : 60000,
                                              'type'  : 'fixed' } }
                });
            });

            // post new jobs to stager
            console.log(JSON.stringify(rpost_args));

            if ( rpost_args.data.length > 0 ) {
                c_stager.post(config.get('stager.url') + '/job', rpost_args, function(data, resp) {
                    data.forEach( function(d) {
                        console.log(JSON.stringify(d));
                    });
                }).on('error', function(err) {
                    prj_ds[p].forEach(function(ds) {
                        console.error('ERROR: ' + ds);
                    });
                });
            }
        }).on('error', function(err) {
            prj_ds[p].forEach(function(ds) {
                console.error('ERROR: ' + ds);
            });
        });
         
        if ( p != 'unknown' ) {
            // copy ds to corresponding project
            prj_ds[p].forEach( function(ds) {
                var dst = '/project/' + p + '/raw/' + ds.replace(config.get('sourceDirForRaw') + '/', '');
                console.log('copy ' + ds + ' to ' + dst);
             
                /*
                // number of concurrent copy
                ncp.limit = 8;
             
                var opts = {
                    clobber: false,
                    stopOnErr: false
                }
             
                ncp( ds, dst, function(err) {
                    if (err) {
                        // TODO: log the error (should be an array of failed copying actions)
                        console.error(err);
                    } else {
                       // data successfully copied over to the location
                    }
                });
                */
            });

            // TODO: stage ds to corresponding RDM collection
            prj_ds[p].forEach( function(ds) {

            });
        }
    });
});
