var config = require('config');
var auth = require('basic-auth');
var utility = require('./utility');

var _basicAuthSimple = function(req, res, next) {

    var user = auth(req);

    try {
        if ( typeof user !== 'undefined' ) {
            // check against streamer's administrator accounts
            admins = config.get('Administrator');
            if ( admins[user.name] === user.pass ) {
                next();
            } else {
                res.statusCode = 401;
                res.setHeader('WWW-Authenticate', 'Basic realm="Streamer"');
                res.end('Unauthorized');
            }
        } else {
            res.statusCode = 401;
            res.setHeader('WWW-Authenticate', 'Basic realm="Streamer"');
            res.end('Unauthorized');
        }
    } catch(e) {
        utility.printErr('[AuthN]', e);
        res.statusCode = 500;
        res.end('Internal Server Error');
    }
}

module.exports.basicAuth = _basicAuthSimple;
