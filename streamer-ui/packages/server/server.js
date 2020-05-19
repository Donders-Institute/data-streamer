const express = require("express");
import session from "express-session";
import { join } from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import createError from "http-errors";

import {
    isAuthenticated,
    hasBasicAuthHeader,
    verifyUser,
    verifyAdminCredentials,
    loginUser,
    logoutUser
} from "./routes/auth";

import { hasJson } from "./routes/content";
import { getProjects } from "./routes/pdb";
import { purge } from "./routes/admin";

import {
    processValidateFile,
    processAddFile
} from "./routes/formData";

import {
    verifyStructure,
    verifyUploadSessionId,
    verifyFile,
    begin,
    validateFile,
    addFile,
    finalize,
    submit
} from "./routes/upload";

let app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(join(__dirname, 'frontend')));

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
    isAuthenticated,
    (req, res) => {
        res.sendFile(join(__dirname + '/./frontend/index.html'));
    });

// GET Serve login page
app.get('/login',
    (req, res) => {
        // Comment out for testing
        // req.session.user = 'testuser';
        // req.session.authenticated = true;
        res.sendFile(join(__dirname + '/./frontend/index.html'));
    });

// POST Login for regular user
app.post('/login',
    hasBasicAuthHeader,
    hasJson,
    loginUser);

// POST Logout for regular user
app.post('/logout',
    hasBasicAuthHeader,
    verifyUser,
    hasJson,
    logoutUser);

// GET Obtain list of projects for regular user
app.get('/projects',
    isAuthenticated,
    hasBasicAuthHeader,
    verifyUser,
    getProjects);

// POST Begin upload session for regular user, obtain an upload session id
app.post('/upload/begin',
    isAuthenticated,
    hasBasicAuthHeader,
    verifyUser,
    hasJson,
    verifyStructure,
    begin);

// POST Validate file for upload session for regular user
app.post('/upload/validatefile',
    isAuthenticated,
    hasBasicAuthHeader,
    verifyUser,
    processValidateFile,
    verifyUploadSessionId,
    verifyStructure,
    verifyFile,
    validateFile);

// POST Add file to upload session for regular user
app.post('/upload/addfile',
    isAuthenticated,
    hasBasicAuthHeader,
    verifyUser,
    processAddFile,
    verifyUploadSessionId,
    verifyStructure,
    verifyFile,
    addFile);

// POST Finalize upload session for regular user
app.post('/upload/finalize',
    isAuthenticated,
    hasBasicAuthHeader,
    verifyUser,
    hasJson,
    verifyUploadSessionId,
    finalize);

// POST Submit a streamer job for regular user
app.post('/upload/submit',
    isAuthenticated,
    hasBasicAuthHeader,
    verifyUser,
    hasJson,
    verifyUploadSessionId,
    verifyStructure,
    submit);

// POST Purge database tables for admin user
app.post('/purge',
    hasBasicAuthHeader,
    verifyAdminCredentials,
    hasJson,
    purge);

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
