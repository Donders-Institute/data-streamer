const createError = require("http-errors");
const express = require("express");
const session = require('express-session');
const pg = require('pg');
const pgSession = require('connect-pg-simple')(session);
const cookieParser = require("cookie-parser");
const cors = require("cors");
const logger = require("morgan");
const path = require("path");
require('log-timestamp');
require('dotenv').config();

const auth = require("./routes/auth");
const content = require("./routes/content");
const pdb = require("./routes/pdb");
const formData = require("./routes/formData");
const upload = require("./routes/upload");
const admin = require("./routes/admin");
const stager = require("./routes/stager");

var app = express();

// Streamer UI server configuration
app.locals.ENV = process.env.NODE_ENV;
app.locals.HOST = "0.0.0.0";
app.locals.PORT = 9000;

app.locals.STREAMER_URL_PREFIX = process.env.STREAMER_URL_PREFIX || "http://service:3001";
app.locals.STREAMER_UI_BUFFER_DIR = process.env.STREAMER_UI_BUFFER_DIR || __dirname + '/uploads';
app.locals.STREAMER_UI_PROJECT_DIR = "/project";

// Streamer UI database configuration
app.locals.STREAMER_UI_DB_HOST = process.env.STREAMER_UI_DB_HOST || "ui-db";
app.locals.STREAMER_UI_DB_PORT = process.env.STREAMER_UI_DB_PORT || 5432;
app.locals.STREAMER_UI_DB_USER = process.env.STREAMER_UI_DB_USER || "postgres";
app.locals.STREAMER_UI_DB_PASSWORD = process.env.STREAMER_UI_DB_PASSWORD || "postgres";
app.locals.STREAMER_UI_DB_NAME = process.env.STREAMER_UI_DB_NAME || "postgres";

// debug option
app.locals.STREAMER_UI_DEBUG = process.env.STREAMER_UI_DEBUG ? (process.env.STREAMER_UI_DEBUG === 'true') : false;

app.use(logger('[:date[iso]] :method :url'));

// CORS configuration 
let whitelist = [];
if (app.locals.ENV === "development") {
    whitelist = [
        `http://${app.locals.STREAMER_URL_PREFIX}`,
        `http://${app.locals.HOST}:${app.locals.PORT}`, // streamer ui server
        `http://localhost:${app.locals.PORT}`,
        `http://${app.locals.HOST}:3000`, // streamer ui client
        "http://localhost:3000"
    ];
}
else {
    whitelist = [
        `http://${app.locals.STREAMER_URL_PREFIX}`,
        `http://ui:${app.locals.PORT}`,
        `https://ui:${app.locals.PORT}`,
        `http://${app.locals.HOST}:${app.locals.PORT}`,
        `https://${app.locals.HOST}:${app.locals.PORT}`,
        "https://streamer-acc.dccn.nl",
        "https://uploader-acc.dccn.nl",
        "https://uploader.dccn.nl"
    ];
}
const corsOptions = {
    origin: whitelist,
    credentials: true
};
app.use(cors(corsOptions));

// session property
//  - rolling expiration upon access
//  - save newly initiated session right into the store
//  - delete session from store when unset
//  - cookie age: 4 hours (w/ rolling expiration)
//  - session data store: postgresql database
app.use(session({
    store: new pgSession({
        pool: new pg.Pool({
            host: app.locals.STREAMER_UI_DB_HOST,
            port: app.locals.STREAMER_UI_DB_PORT,
            user: app.locals.STREAMER_UI_DB_USER,
            password: app.locals.STREAMER_UI_DB_PASSWORD,
            database: app.locals.STREAMER_UI_DB_NAME,
            keepAlive: true,
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000
        }),
        tableName: 'usersession'
    }),
    secret: 'somesecret',
    resave: false,
    rolling: true,
    saveUninitialized: true,
    unset: 'destroy',
    name: 'streamer-ui.sid',
    cookie: {
        httpOnly: false,
        maxAge: 4 * 3600 * 1000  // 4 hours
    }
}));

app.use(express.json());
app.use(cookieParser());

if ( ! (app.locals.ENV === "development") ) {
    app.use(express.static(path.join(__dirname, 'frontend')));
}

// GET Serve frontend home page
app.get('/',
    auth.isAuthenticated,
    (_, res) => {
        res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
    });

// GET Serve login page
app.get('/login',
    (_, res) => {
        res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
    });

// POST Login for regular user
app.post('/api/login',
    auth.hasBasicAuthHeader,
    content.hasJson,
    auth.loginUser);

// POST Logout for regular user
app.post('/api/logout',
    content.hasJson,
    auth.logoutUser);

// GET Obtain list of projects for regular user
app.get('/api/projects',
    auth.isAuthenticated,
    pdb.getProjects);

// GET Obtain the destinating DAC namespace in the Repository through the Stager's API: /rdm/DAC/project/{projectId}.
app.get('/api/stager/dac/:projectId',
    auth.isAuthenticated,
    stager.getDac);

// POST Begin upload session for regular user, obtain an upload session id
app.post('/api/upload/begin',
    auth.isAuthenticated,
    content.hasJson,
    upload.verifyStructure,
    upload.begin);

// POST Validate file for upload session for regular user
app.post('/api/upload/validatefile',
    auth.isAuthenticated,
    formData.processValidateFile,
    upload.verifyUploadSessionId,
    upload.verifyStructure,
    upload.verifyFile,
    upload.validateFile);

// POST Add file to upload session for regular user
app.post('/api/upload/addfile',
    auth.isAuthenticated,
    formData.processAddFile,
    upload.verifyUploadSessionId,
    upload.verifyStructure,
    upload.verifyFile,
    upload.addFile);

// POST Finalize upload session for regular user
app.post('/api/upload/finalize',
    auth.isAuthenticated,
    content.hasJson,
    upload.verifyUploadSessionId,
    upload.finalize);

// POST Submit a streamer job for regular user
app.post('/api/upload/submit',
    auth.isAuthenticated,
    content.hasJson,
    upload.verifyUploadSessionId,
    upload.verifyStructure,
    upload.submit);

// POST Purge old data in the database tables for admin user
app.post('/api/purge',
    auth.hasBasicAuthHeader,
    auth.verifyAdminCredentials,
    content.hasJson,
    admin.purgeOld);

// POST Purge all data in the database tables for admin user
app.post('/api/purge/all',
    auth.hasBasicAuthHeader,
    auth.verifyAdminCredentials,
    content.hasJson,
    admin.purgeAll);

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

app.listen(app.locals.PORT, app.locals.HOST);
console.log(`Server is running in ${app.locals.ENV} mode.`);
console.log(`Running on http://${app.locals.HOST}:${app.locals.PORT}`);

module.exports = app;
