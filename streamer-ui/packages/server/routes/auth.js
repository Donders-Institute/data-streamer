import { ActiveDirectory } from "activedirectory";
import createError from "http-errors";
import { join } from "path";
import { readFileSync } from "fs";

let adconfig = require(join(__dirname + '/../config/streamer-ui-adconfig.json'));
const tlsOptions = {
    ca: [readFileSync(join(__dirname + '/../config/streamer-ui-ldapscert.crt'))]
}
adconfig.tlsOptions = tlsOptions;

// Admin user credentials
const STREAMER_UI_DB_USER = process.env.STREAMER_UI_DB_USER || "user";
const STREAMER_UI_DB_PASSWORD = process.env.STREAMER_UI_DB_PASSWORD || "password";

// Middleware to verify session authentication status
export function isAuthenticated(req, res, next) {
    if (req.session && typeof req.session.user !== 'undefined' && typeof req.session.authenticated !== 'undefined') {
        if (req.session.authenticated == true) {
            return next();
        }
    }

    res.redirect('/login');
}

// Middleware to check for basic auth header
export function hasBasicAuthHeader(req, res, next) {
    if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
        return next(createError(401, "Missing Authorization Header"));
    }

    next();
}

// Middleware to verify regular user
export function verifyUser(req, res, next) {
    const base64Credentials = req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const username = credentials.split(':')[0];

    if (req.session.user !== username) {
        return next(createError(401, "Invalid user credentials"));
    }

    next();
}

// Middleware to verify admin credentials
export function verifyAdminCredentials(req, res, next) {
    const base64Credentials = req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');

    if (username !== STREAMER_UI_DB_USER || password !== STREAMER_UI_DB_PASSWORD) {
        return next(createError(401, "Invalid admin user credentials"));
    }

    next();
}

// Login user: Authenticate user with Active Directory
export function loginUser(req, res, next) {
    let msg = "";
    let username = "";
    let password = "";
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
            console.log(username, userAgent);
            console.log(JSON.stringify(err.message));
            return next(createError(401, "Something went wrong. Try again later"));
        }

        if (!user) {
            msg = "Username not found";
            console.log(username, userAgent, msg);
            return next(createError(401, msg));
        }

        ad.authenticate(user.userPrincipalName, password, function (err, auth) {
            if (!auth) {
                // Authentication failed
                console.error(username, userAgent);
                return next(createError(401, "Wrong username or password"));
            }
            // Authentication successful
            req.session.user = username;
            req.session.authenticated = true;
            console.log(username, userAgent);
            return res.status(200).json({
                data: "Login successful. You will soon be redirected to the index",
                error: null
            });
        });
    });
}

// Logout user by removing corresponding session data
export function logoutUser(req, res) {
    let sess = req.session;

    delete sess.user;
    delete sess.password;
    req.session.destroy();

    res.redirect('/login');
}
