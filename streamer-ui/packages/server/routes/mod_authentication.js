const ActiveDirectory = require('activedirectory');
const path = require('path');
const fs = require('fs');

const adconfig = require(path.join(__dirname + '/../config/streamer-ui-adconfig.json'));
const tlsOptions = {
    ca: [fs.readFileSync(path.join(__dirname + '/../config/streamer-ui-ldapscert.crt'))]
}
adconfig.tlsOptions = tlsOptions;

var _isAuthenticated = function (req, res, next) {
    if (req.session && typeof req.session.user !== 'undefined' && typeof req.session.authenticated !== 'undefined') {
        if (req.session.authenticated == true) {
            next();
        } else {
            res.redirect('/login');
        }
    } else {
        res.redirect('/login');
    }
}

// Authenticate user with Active Directory
var _authenticateUser = async function (req, res) {

    var msg = "";
    var username = "";
    var password = "";
    var ipAddress = "";
    var userAgent = "";

    // Check for basic auth header
    if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
        msg = "Missing Authorization Header"
        console.error(username, ipAddress, userAgent, msg);
        return res.status(401).json({ success: false, error: msg });
    }

    // Verify auth credentials
    const base64Credentials = req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    [username, password] = credentials.split(':');

    // Obtain the user agent
    userAgent = req.headers['user-agent'];

    if (typeof req.body.username !== 'undefined') {

        var ad = new ActiveDirectory(adconfig);

        // Check wether user exists. And if it exists get the username and use that to authenticate
        ad.findUser(username, function (err, user) {
            if (err) {
                msg = 'ERROR: ' + JSON.stringify(err);
                console.error(username, ipAddress, userAgent, msg);
                res.status(200).json({ success: false, error: "Something went wrong. Try again later." });
                return;
            }
            if (!user) {
                msg = "Username not found.";
                console.error(username, ipAddress, userAgent, msg);
                res.status(200).json({ success: false, error: msg });
                return;
            } else {
                ad.authenticate(user.userPrincipalName, password, function (err, auth) {
                    if (auth) {
                        // Authentication success
                        req.session.user = username;
                        req.session.authenticated = true;
                        msg = "You will soon be redirected to the index";
                        console.log(username, ipAddress, userAgent, '');
                        res.status(200).json({ success: true, data: msg });
                        return;
                    } else {
                        // Authentication failed
                        msg = "Wrong username or password";
                        console.error(username, ipAddress, userAgent, msg);
                        res.status(200).json({ success: false, error: msg });
                        return;
                    }
                });
            }
        });
    } else {
        msg = "No username provided";
        console.error(username, ipAddress, userAgent, msg);
        res.status(200).json({ success: false, error: msg });
    }
}

// Logout user by removing corresponding session data
var _logoutUser = async function (req, res) {
    var sess = req.session;
    var msg;
    var username = "";
    var ipAddress = "";
    var userAgent = "";

    // Check for basic auth header
    if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
        msg = "Missing Authorization Header"
        console.error(username, ipAddress, userAgent, msg);
        return res.status(401).json({ success: false, error: msg });
    }

    // Verify auth credentials
    const base64Credentials = req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    username = credentials.split(':')[0];

    // Obtain the user agent
    userAgent = req.headers['user-agent'];

    delete sess.user;
    delete sess.password;
    req.session.destroy();

    console.log(username, ipAddress, userAgent, '');
    res.redirect('/login');
}

module.exports.isAuthenticated = _isAuthenticated;
module.exports.authenticateUser = _authenticateUser;
module.exports.logoutUser = _logoutUser;
