const ActiveDirectory = require('activedirectory');
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

// Verify session authentication status
async function _isAuthenticated(req, res, next) {
    if (req.session && typeof req.session.user !== 'undefined' && typeof req.session.authenticated !== 'undefined') {
        if (req.session.authenticated == true) {
            next();
        }
    }
    res.redirect('/login');
}

// Check for basic auth header
async function _hasBasicAuthHeader(req, res, next) {
    if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
        const msg = 'Missing Authorization Header';
        console.error(msg);
        return res.status(401).json({ data: null, error: msg });
    }
    next();
}

// Verify regular user
async function _verifyUser(req, res, next) {
    const base64Credentials = req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const username = credentials.split(':')[0];

    if (req.session.user !== username) {
        const msg = 'Invalid user credentials';
        console.error(msg);
        return res.status(401).json({ data: null, error: msg });
    }
    next();
}

// Verify admin credentials
async function _verifyAdminCredentials(req, res, next) {
    const base64Credentials = req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');

    if (username !== STREAMER_UI_DB_USER || password !== STREAMER_UI_DB_PASSWORD) {
        const msg = 'Invalid admin user credentials';
        console.error(msg);
        return res.status(401).json({ data: null, error: msg });
    }
    next();
}

// Login user: Authenticate user with Active Directory
async function _authenticateUserWithActiveDirectory(req, res) {
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
            const consoleMsg = 'ERROR: ' + JSON.stringify(err);
            console.error(username, ipAddress, userAgent, consoleMsg);
            msg = "Something went wrong. Try again later.";
            console.error(msg);
            return res.status(401).json({ data: null, error: msg });
        }
        if (!user) {
            msg = "Username not found.";
            console.error(username, ipAddress, userAgent, msg);
            return res.status(401).json({ data: null, error: msg });
        }

        ad.authenticate(user.userPrincipalName, password, function (err, auth) {
            if (!auth) {
                // Authentication failed
                msg = "Wrong username or password";
                console.error(username, ipAddress, userAgent, msg);
                return res.status(401).json({ data: null, error: msg });
            }
            // Authentication successful
            req.session.user = username;
            req.session.authenticated = true;
            console.log(username, ipAddress, userAgent, "");
            return res.status(200).json({
                data: "Login successful. You will soon be redirected to the index",
                error: null
            });
        });
    });
}

// Logout user by removing corresponding session data
async function _logoutUser(req, res) {
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
