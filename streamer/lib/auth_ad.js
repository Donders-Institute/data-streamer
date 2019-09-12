var config = require('config');
var auth = require('basic-auth');
var ActiveDirectory = require('activedirectory');
var utility = require('./utility');

var _basicAuthAD = function(req, res, next) {

    // simple authentication aganist ActiveDirectory
    var ad = new ActiveDirectory(config.get('ActiveDirectory'));
    var user = auth(req);

    try {
        if ( typeof user !== 'undefined' ) {
            ad.authenticate(user.name, user.pass, function(err, authenticated) {
                if (err) {
                    utility.printErr('AuthN', err);
                }

                if (authenticated) {
                    next();
                } else {
                    // check against streamer's administrator accounts
                    admins = config.get('Administrator');
                    if ( admins[user.name] === user.pass ) {
                        next();
                    } else {
                        res.statusCode = 401;
                        res.setHeader('WWW-Authenticate', 'Basic realm="Streamer"');
                        res.end('Unauthorized');
                    }
                }
            });
        } else {
            res.statusCode = 401;
            res.setHeader('WWW-Authenticate', 'Basic realm="Streamer"');
            res.end('Unauthorized');
        }
    } catch(e) {
        utility.printErr('AuthN', e);
        res.statusCode = 500;
        res.end('Internal Server Error');
    }
}

module.exports.basicAuthAD = _basicAuthAD;
