const config = require('config');

var Client = require('ssh2').Client;

/* Authenticate user against a FTP server */
var _authenticateUser = function (req, res) {

    var cfg = {
        host: config.get('projectStorage.host'),
        port: config.get('projectStorage.port'),
        username: req.body.username,
        password: req.body.password
    };

    var c = new Client();

    var handleError = function (err) {
        c.end();
        console.error(err);
        res.status(404);
        res.json({});
    };

    try {
        c.on('ready', function () {
            c.end();
            // Set session data
            var sess = req.session;
            if (typeof sess.user === "undefined" ||
                typeof sess.user === "undefined") {
                sess.user = { projectStorage: req.body.username };
                sess.pass = { projectStorage: req.body.password };
            } else {
                sess.user.projectStorage = req.body.username;
                sess.pass.projectStorage = req.body.password;
            }
            res.status(200);
            res.json({});
        }).on('error', function (err) {
            handleError(err);
        }).connect(cfg);
    } catch (err) {
        handleError(err);
    }
}

/* logout user by removing corresponding session data */
var _logoutUser = function (req, res) {
    var sess = req.session;
    delete sess.user.projectStorage;
    delete sess.pass.projectStorage;
    res.json({ 'logout': true });
}

module.exports.authenticateUser = _authenticateUser;
module.exports.logoutUser = _logoutUser;
