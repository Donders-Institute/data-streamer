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
var _authenticateUser = function (req, res) {

    // Check for basic auth header
    if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
        return res.status(401).json({ success: false, error: "Missing Authorization Header." });
    }

    // Verify auth credentials
    const base64Credentials = req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    var [username, password] = credentials.split(':');

    if (typeof req.body.username !== 'undefined') {

        var ad = new ActiveDirectory(adconfig);

        // Check wether user exists. And if it exists get the userPrincipalName and use that to authenticate
        ad.findUser(username, function (err, user) {
            if (err) {
                console.log('ERROR: ' + JSON.stringify(err));
                res.status(200).json({ success: false, error: "Something went wrong. Try again later." });
                return;
            }
            if (!user) {
                res.status(200).json({ success: false, error: "Username not found." });
            } else {
                ad.authenticate(user.userPrincipalName, password, function (err, auth) {
                    if (auth) {
                        // Authentication success
                        req.session.user = username;
                        req.session.authenticated = true;
                        res.status(200).json({ success: true, data: "You will soon be redirected to the index." });
                        return;
                    } else {
                        // Authentication failed
                        res.status(200).json({ success: false, error: "Wrong username or password." });
                        return;
                    }
                });
            }
        });
    } else {
        res.status(200).json({ success: false, error: "No username provided." });
    }
}

// Logout user by removing corresponding session data
var _logoutUser = function (req, res) {
    var sess = req.session;
    delete sess.user;
    delete sess.password;
    req.session.destroy();
    res.redirect('/login');
}

module.exports.isAuthenticated = _isAuthenticated;
module.exports.authenticateUser = _authenticateUser;
module.exports.logoutUser = _logoutUser;
