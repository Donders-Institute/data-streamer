const createError = require("http-errors");
const express = require("express");
const session = require('express-session');
const bodyParser = require("body-parser");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const fileUpload = require("express-fileupload");

const routes = require('./routes/index');
const modAuthentication = require('./routes/mod_authentication');
const modListProjects = require('./routes/mod_listProjects');
const modUpload = require('./routes/mod_upload');
const modPurge = require('./routes/mod_purge');

var app = express();

app.set('view engine', 'jade');
app.set('views', path.join(__dirname, 'views'));

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'frontend')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());

const STREAMER_UI_HOST = process.env.STREAMER_UI_HOST || "localhost";
const STREAMER_UI_PORT = process.env.STREAMER_UI_PORT || 9000;

/* session property
   - rolling expiration upon access
   - save newly initiated session right into the store
   - delete session from story when unset
   - cookie age: 4 hours (w/ rolling expiration)
   - session data store: memory on the server
*/
app.use(session({
    secret: 'somesecret',
    resave: true,
    rolling: true,
    saveUninitialized: true,
    unset: 'destroy',
    name: 'streamer-ui.sid',
    cookie: {
        httpOnly: false,
        maxAge: 4 * 3600 * 1000
    }
}));

// Serve static frontend files
app.use('/', routes);

// POST Login for regular user
app.post('/login',
    modAuthentication.hasBasicAuthHeader,
    modAuthentication.loginUser);

// POST Logout for regular user
app.post('/logout',
    modAuthentication.hasBasicAuthHeader,
    modAuthentication.verifyUser,
    modAuthentication.logoutUser);

// GET Obtain list of projects for regular user
app.get('/projects',
    modAuthentication.isAuthenticated,
    modAuthentication.hasBasicAuthHeader,
    modAuthentication.verifyUser,
    modListProjects.getListProjects);

// POST Begin upload session for regular user, obtain an upload session id
app.post('/upload/begin',
    modAuthentication.isAuthenticated,
    modAuthentication.hasBasicAuthHeader,
    modAuthentication.verifyUser,
    modUpload.verifyStructure,
    modUpload.begin);

// POST Validate file for upload session for regular user
app.post('/upload/validatefile',
    modAuthentication.isAuthenticated,
    modAuthentication.hasBasicAuthHeader,
    modAuthentication.verifyUser,
    modUpload.verifyUploadSessionId,
    modUpload.verifyStructure,
    modUpload.verifyFileContents,
    modUpload.validateFile);

// POST Add file to upload session for regular user
app.post('/upload/addfile',
    modAuthentication.isAuthenticated,
    modAuthentication.hasBasicAuthHeader,
    modAuthentication.verifyUser,
    modUpload.verifyUploadSessionId,
    modUpload.verifyStructure,
    modUpload.verifyFileContents,
    modUpload.addFile);

// POST Finalize upload session for regular user
app.post('/upload/finalize',
    modAuthentication.isAuthenticated,
    modAuthentication.hasBasicAuthHeader,
    modAuthentication.verifyUser,
    modUpload.verifyUploadSessionId,
    modUpload.finalize);

// POST Submit a streamer job for regular user
app.post('/upload/submit',
    modAuthentication.isAuthenticated,
    modAuthentication.hasBasicAuthHeader,
    modAuthentication.verifyUser,
    modUpload.verifyUploadSessionId,
    modUpload.verifyStructure,
    modUpload.submit);

// POST Purge database tables for admin user
app.get('/clean',
    modAuthentication.hasBasicAuthHeader,
    modAuthentication.verifyAdminCredentials,
    modPurge.purge);

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// Error handlers

// Development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// Production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.listen(STREAMER_UI_PORT, STREAMER_UI_HOST);
console.log(`Running on http://${STREAMER_UI_HOST}:${STREAMER_UI_PORT}`);

module.exports = app;
