var config = require('config');
var async = require('async');
var fs = require('fs');

var http = require('http');
var oc_url = require('url').parse(config.get('MRI.orthancEndpoint'));

var oc = require('orthanc-client');
var oc_cfg = {
    url: config.get('MRI.orthancEndpoint'),
    auth: {
        username: config.get('MRI.orthancUsername'),
        password: config.get('MRI.orthancPassword')
    }
};

var instances = [];

async.series([

function(cb) {
    global.gc();
    console.log(JSON.stringify(process.memoryUsage()));
    return cb(null, true);
},
function(cb) {
    //var sid = 'd0e7c087-52eab359-9efe0f60-aa14cfcd-f142f5a0';
    var sid = '87b39bd4-0f4e31de-0a791000-f41cf2bb-debd1204';
    (new oc(oc_cfg)).series.get(sid).then( function(data) {
        instances = data['Instances'];
        console.log("instances: " + JSON.stringify(instances));
        return cb(null, true);
    }).catch( function(err) {
        return cb(err,false);
    });
},
function(cb) {
    async.everyLimit(instances, 20, function(iid, _cbb) {
        (new oc(oc_cfg)).instances.get(iid).then( function(data) {
            if ( data['MainDicomTags'] ) {
                var fname = 'tmp/' + ('0000000' + data['MainDicomTags']['InstanceNumber']).slice(-5) +
                            '_' + data['MainDicomTags']['SOPInstanceUID'] + '.IMA';

                var f = fs.createWriteStream(fname);

                http.get({
                    hostname: oc_url.hostname,
                    port: oc_url.port,
                    path: '/instances/' + iid + '/file',
                    auth: "'" + config.get('MRI.orthancUsername') + "':'" + config.get('MRI.orthancPassword') + "'"
                }, function(resp) {

                    if ( resp.statusCode != 200 ) {
                        fs.unlink(fname);
                        throw new Error('cannot retrieve instance data: ' + iid + ' (' + resp.statusCode + ') ');
                    }

                    resp.pipe(f);
                    f.on('finish', function() {
                        f.close( function(err) {
                            if (err) {
                                console.error(err);
                                throw err;
                             }
                            return _cbb(null, true);
                        });
                    });
                }).on('error', function(err) {
                    fs.unlink(fname);
                    throw new Error('cannot write instance data: ' + fname);
                });

            } else {
                throw new Error('no DICOM tags for patient, series: ' + sid);
            }
        }).catch( function(err) {
            console.error(err);
            return _cbb(err,false);
        });
    }, function(err, result) {
        if (err) {
            return cb(err, false);
        } else {
            return cb(null, true);
        }
    });
}
], function(err,result) {
    console.log('result: ' + result);
});

setInterval( function() {
    // force garbage collection
    global.gc();
    console.log(JSON.stringify(process.memoryUsage()));
}, 1000 );
