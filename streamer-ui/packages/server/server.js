const express = require("express");
const session = require("express-session");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const createError = require("http-errors");
const multer = require("multer");

const auth = require('./routes/auth');
const content = require('./routes/content');
const pdb = require('./routes/pdb');
const upload = require('./routes/upload');
const admin = require('./routes/admin');

// Handle multipart form data
const formData = multer();

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'frontend')));

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

// GET Serve frontend home page
app.get('/',
    auth.isAuthenticated,
    (req, res) => {
        res.sendFile(path.join(__dirname + '/./frontend/index.html'));
    });

// GET Serve login page
app.get('/login',
    (req, res) => {
        // Comment out for testing
        // req.session.user = 'testuser';
        // req.session.authenticated = true;
        res.sendFile(path.join(__dirname + '/./frontend/index.html'));
    });

// POST Login for regular user
app.post('/login',
    auth.hasBasicAuthHeader,
    content.hasJson,
    auth.loginUser);

// POST Logout for regular user
app.post('/logout',
    auth.hasBasicAuthHeader,
    auth.verifyUser,
    content.hasJson,
    auth.logoutUser);

// GET Obtain list of projects for regular user
app.get('/projects',
    auth.isAuthenticated,
    auth.hasBasicAuthHeader,
    auth.verifyUser,
    pdb.getProjects);

// POST Begin upload session for regular user, obtain an upload session id
app.post('/upload/begin',
    auth.isAuthenticated,
    auth.hasBasicAuthHeader,
    auth.verifyUser,
    content.hasJson,
    upload.verifyStructure,
    upload.begin);

// POST Validate file for upload session for regular user
app.post('/upload/validatefile',
    auth.isAuthenticated,
    auth.hasBasicAuthHeader,
    auth.verifyUser,
    formData.single('validatefile'), // multipart form data contains single file
    content.hasFile,
    upload.verifyUploadSessionId,
    upload.verifyStructure,
    upload.validateFile);

// POST Add file to upload session for regular user
app.post('/upload/addfile',
    auth.isAuthenticated,
    auth.hasBasicAuthHeader,
    auth.verifyUser,
    formData.single('addfile'), // multipart form data contains single file
    content.hasFile,
    upload.verifyUploadSessionId,
    upload.verifyStructure,
    upload.addFile);

// POST Finalize upload session for regular user
app.post('/upload/finalize',
    auth.isAuthenticated,
    auth.hasBasicAuthHeader,
    auth.verifyUser,
    content.hasJson,
    upload.verifyUploadSessionId,
    upload.finalize);

// POST Submit a streamer job for regular user
app.post('/upload/submit',
    auth.isAuthenticated,
    auth.hasBasicAuthHeader,
    auth.verifyUser,
    content.hasJson,
    upload.verifyUploadSessionId,
    upload.verifyStructure,
    upload.submit);

// POST Purge database tables for admin user
app.post('/clean',
    auth.hasBasicAuthHeader,
    auth.verifyAdminCredentials,
    content.hasJson,
    admin.purge);

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// Error handler
// No stacktraces leaked to user
app.use(function (err, req, res, next) {
    console.log(err.message);
    res.status(err.status || 500).json({
        data: null,
        error: err.message
    });
});

app.listen(STREAMER_UI_PORT, STREAMER_UI_HOST);
console.log(`Running on http://${STREAMER_UI_HOST}:${STREAMER_UI_PORT}`);

module.exports = app;
