const ActiveDirectory = require('activedirectory');
const createError = require("http-errors");
const path = require('path');
const fs = require('fs');

const adconfig = require(path.join(__dirname + '/../config/streamer-ui-adconfig.json'));
const tlsOptions = {
    ca: [fs.readFileSync(path.join(__dirname + '/../config/streamer-ui-ldapscert.crt'))]
}
adconfig.tlsOptions = tlsOptions;

// Admin user credentials
const STREAMER_UI_DB_USER = process.env.STREAMER_UI_DB_USER || "user";
const STREAMER_UI_DB_PASSWORD = process.env.STREAMER_UI_DB_PASSWORD || "password";

// Middleware to verify session authentication status
var _isAuthenticated = function (req, res, next) {
    if (req.session && typeof req.session.user !== 'undefined' && typeof req.session.authenticated !== 'undefined') {
        if (req.session.authenticated == true) {
            return next();
        }
    }

    res.redirect('/login');
}

// Middleware to check for basic auth header
var _hasBasicAuthHeader = function (req, res, next) {
    if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
        return next(createError(401, "Missing Authorization Header"));
    }

    next();
}

// Middleware to verify regular user
var _verifyUser = function (req, res, next) {
    const base64Credentials = req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const username = credentials.split(':')[0];

    console.log("verifyUser");
    console.log(JSON.stringify(req.body));

    if (req.session.user !== username) {
        return next(createError(401, "Invalid user credentials"));
    }

    next();
}

// Middleware to verify admin credentials
var _verifyAdminCredentials = function (req, res, next) {
    const base64Credentials = req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');

    if (username !== STREAMER_UI_DB_USER || password !== STREAMER_UI_DB_PASSWORD) {
        return next(createError(401, "Invalid admin user credentials"));
    }

    next();
}

// Login user: Authenticate user with Active Directory
var _authenticateUserWithActiveDirectory = function (req, res, next) {
    let msg = "";
    let username = "";
    let password = "";
    let ipAddress = "";
    let userAgent = "";

    // Obtain auth credentials
    const base64Credentials = req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    [username, password] = credentials.split(':');

    // Obtain the user agent
    userAgent = req.headers['user-agent'];

    // Check whether the user exists. If so, obtain the userPrincipalName and use that to authenticate.
    const ad = new ActiveDirectory(adconfig);
    ad.findUser(username, function (err, user) {
        if (err) {
            console.log(username, ipAddress, userAgent);
            console.log(JSON.stringify(err.message));
            return next(createError(401, "Something went wrong. Try again later"));
        }

        if (!user) {
            msg = "Username not found";
            console.log(username, ipAddress, userAgent, msg);
            return next(createError(401, msg));
        }

        ad.authenticate(user.userPrincipalName, password, function (err, auth) {
            if (!auth) {
                // Authentication failed
                console.error(username, ipAddress, userAgent);
                return next(createError(401, "Wrong username or password"));
            }
            // Authentication successful
            req.session.user = username;
            req.session.authenticated = true;
            console.log(username, ipAddress, userAgent);
            return res.status(200).json({
                data: "Login successful. You will soon be redirected to the index",
                error: null
            });
        });
    });
}

// Logout user by removing corresponding session data
var _logoutUser = function (req, res) {
    let sess = req.session;

    delete sess.user;
    delete sess.password;
    req.session.destroy();

    res.redirect('/login');
}

module.exports.isAuthenticated = _isAuthenticated;
module.exports.hasBasicAuthHeader = _hasBasicAuthHeader;
module.exports.verifyUser = _verifyUser;
module.exports.verifyAdminCredentials = _verifyAdminCredentials;

module.exports.loginUser = _authenticateUserWithActiveDirectory;
module.exports.logoutUser = _logoutUser;
