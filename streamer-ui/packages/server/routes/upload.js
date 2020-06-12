const path = require("path");
const fs = require("fs");
const mkdirp = require('mkdirp');
const createError = require("http-errors");

const db = require('./db');
const utils = require('./utils');

const config = require(path.join(__dirname + '/../config/streamer-ui-config.json'));
const SERVICE_ADMIN_USERNAME = config.serviceAdmin.username;
const SERVICE_ADMIN_PASSWORD = config.serviceAdmin.password;

// Middleware to verify upload structure 
// (can be in JSON or multipare/form-data after multer middleware)
var _verifyStructure = function(req, res, next) {
    if (!req.body) {
        return next(createError(400, `No attributes were uploaded: "req.body" is empty`));
    }

    const projectNumber = req.body.projectNumber;
    const subjectLabel = req.body.subjectLabel;
    const sessionLabel = req.body.sessionLabel;
    const dataType = req.body.dataType;

    if (!projectNumber) {
        return next(createError(400, "projectNumber empty"));
    }
    if (!subjectLabel) {
        return next(createError(400, "subjectLabel empty"));
    }
    if (!sessionLabel) {
        return next(createError(400, "sessionLabel empty"));
    }
    if (!dataType) {
        return next(createError(400, "dataType empty"));
    }

    next();
}

// Middleware to verify upload session id (can be in JSON or form data)
var _verifyUploadSessionId = function(req, res, next) {
    if (!req.body) {
        return next(createError(400, `No attributes were validated: "req.body" is empty`));
    }

    const uploadSessionId = req.body.uploadSessionId;

    if (!uploadSessionId) {
        return next(createError(400, "uploadSessionId empty"));
    }

    next();
}

// Middleware to verify file contents in the multipare/form-data (after multer middleware)
var _verifyFile = function(req, res, next) {
    // Check presence of file
    if (!req.file) {
        return next(createError(400, `No file: "req.file" is empty`));
    }

    // Verify file attributes
    if (!req.body) {
        return next(createError(400, `No attributes were uploaded: "req.body" is empty`));
    }

    const filename = req.body.filename;
    const fileSizeBytes = req.body.fileSizeBytes;

    if (!filename) {
        return next(createError(400, "filename empty"));
    }
    if (!fileSizeBytes) {
        return next(createError(400, "fileSizeBytes empty"));
    }

    next();
}

// Begin upload session, obtain upload session id
// If the streamer UI buffer folder does not exist create it
var _begin = async function(req, res, next) {

    // Obtain the DCCN username
    const base64Credentials = req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const username = credentials.split(':')[0];

    // Obtain the user agent
    const userAgent = req.headers['user-agent'];

    // Set the IP address (to be removed)
    const ipAddress = "0.0.0.0";

    // Obtain structure
    const projectNumber = req.body.projectNumber;
    const subjectLabel = req.body.subjectLabel;
    const sessionLabel = req.body.sessionLabel;
    const dataType = req.body.dataType;

    // Create the streamer UI buffer directory if it does not exist
    const dirname = utils.getStreamerUIBufferDirname(projectNumber, subjectLabel, sessionLabel, dataType);
    if (!dirname) {
        return next(createError(500, "Error obtaining streamer buffer UI directory name"));
    }
    if (!fs.existsSync(dirname)) {
        mkdirp.sync(dirname);
        console.log(`Successfully created streamer buffer UI directory "${dirname}"`);
    }

    // Obtain streamer UI database configuration
    const STREAMER_UI_DB_HOST = req.app.locals.STREAMER_UI_DB_HOST;
    const STREAMER_UI_DB_PORT = req.app.locals.STREAMER_UI_DB_PORT;
    const STREAMER_UI_DB_USER = req.app.locals.STREAMER_UI_DB_USER;
    const STREAMER_UI_DB_PASSWORD = req.app.locals.STREAMER_UI_DB_PASSWORD;
    const STREAMER_UI_DB_NAME = req.app.locals.STREAMER_UI_DB_NAME;

    console.log(STREAMER_UI_DB_HOST,
        STREAMER_UI_DB_PORT,
        STREAMER_UI_DB_USER,
        STREAMER_UI_DB_PASSWORD,
        STREAMER_UI_DB_NAME,
        username,
        ipAddress,
        userAgent,
        projectNumber,
        subjectLabel,
        sessionLabel,
        dataType,
        startTime);

    // Add an upload session to the streamer UI database
    let insertUploadSessionResult;
    const startTime = new Date();
    try {
        insertUploadSessionResult = await db.insertUploadSession(
            STREAMER_UI_DB_HOST,
            STREAMER_UI_DB_PORT,
            STREAMER_UI_DB_USER,
            STREAMER_UI_DB_PASSWORD,
            STREAMER_UI_DB_NAME,
            username,
            ipAddress,
            userAgent,
            projectNumber,
            subjectLabel,
            sessionLabel,
            dataType,
            startTime);
    } catch (err) {
        console.log(err.message);
        return next(createError(500, err.message));
    }

    // Success, return the result
    console.log(username, userAgent, startTime);
    console.log(JSON.stringify(insertUploadSessionResult));
    res.status(200).json({
        data: insertUploadSessionResult,
        error: null
    });
}

// Check if the project storage folder and the file to be uploaded exist already
// (After processed the multipare/form-data with the multer middleware)
var _validateFile = function(req, res, next) {

    // Obtain structure from form data
    const projectNumber = req.body.projectNumber;
    const subjectLabel = req.body.subjectLabel;
    const sessionLabel = req.body.sessionLabel;
    const dataType = req.body.dataType;

    let isDevelopment = false;
    if (req.app && req.app.locals && req.app.locals.ENV === "development") {
        isDevelopment = true;
    }

    let projectStorageDirname = null;
    if (isDevelopment) {
        // In development mode, use the streamer UI buffer dir instead
        const streamerBufferUiDirname = utils.getStreamerUIBufferDirname(projectNumber, subjectLabel, sessionLabel, dataType);
        if (!streamerBufferUiDirname) {
            return next(createError(500, "Error obtaining streamer UI buffer directory name"));
        }
        if (!utils.streamerUIBufferDirExists()) {
            return next(createError(500, "Streamer UI buffer directory not found"));
        }
        projectStorageDirname = streamerBufferUiDirname;
    } else {
        // Obtain the project storage directory name
        projectStorageDirname = utils.getProjectStorageDirname(projectNumber, subjectLabel, sessionLabel, dataType);
        if (!projectStorageDirname) {
            return next(createError(500, "Error obtaining project storage directory name"));
        }
        if (!utils.projectDirExists()) {
            return next(createError(500, "Project storage directory not found"));
        }
    }

    // Obtain file attributes
    const filename = req.body.filename;
    const fileSizeBytes = req.body.fileSizeBytes;
    const fileSizeBytesInt = parseInt(fileSizeBytes, 0);

    // Check if file has zero size
    const fileIsEmpty = fileSizeBytesInt === 0;

    // Check if project storage folder and file exists already
    const fileExists = utils.fileExists(filename, projectStorageDirname);

    const validationResult = {
        filename,
        fileExists,
        fileIsEmpty
    };

    console.log(JSON.stringify(validationResult));
    res.status(200).json({
        data: validationResult,
        error: null
    });
}

// Add a file to the upload session
// (After having stored the file with the multer middleware)
var _addFile = async function(req, res, next) {

    // Obtain upload session id from form data
    const uploadSessionId = req.body.uploadSessionId;

    // Obtain file attributes
    const filename = req.body.filename;
    const fileSizeBytes = req.body.fileSizeBytes;

    // Obtain streamer UI database configuration
    const STREAMER_UI_DB_HOST = req.app.locals.STREAMER_UI_DB_HOST;
    const STREAMER_UI_DB_PORT = req.app.locals.STREAMER_UI_DB_PORT;
    const STREAMER_UI_DB_USER = req.app.locals.STREAMER_UI_DB_USER;
    const STREAMER_UI_DB_PASSWORD = req.app.locals.STREAMER_UI_DB_PASSWORD;
    const STREAMER_UI_DB_NAME = req.app.locals.STREAMER_UI_DB_NAME;

    // Add an upload file to the streamer UI database
    let insertUploadFileResult;
    try {
        insertUploadFileResult = await db.insertUploadFile(
            STREAMER_UI_DB_HOST,
            STREAMER_UI_DB_PORT,
            STREAMER_UI_DB_USER,
            STREAMER_UI_DB_PASSWORD,
            STREAMER_UI_DB_NAME,
            uploadSessionId, 
            filename, 
            fileSizeBytes);
    } catch (err) {
        return next(createError(500, err.message));
    }

    console.log(JSON.stringify(insertUploadFileResult));
    res.status(200).json({
        data: insertUploadFileResult,
        error: null
    });
}

// Finalize the upload session
var _finalize = async function(req, res, next) {

    // Obtain upload session id
    const uploadSessionId = req.body.uploadSessionId;

    // Obtain streamer UI database configuration
    const STREAMER_UI_DB_HOST = req.app.locals.STREAMER_UI_DB_HOST;
    const STREAMER_UI_DB_PORT = req.app.locals.STREAMER_UI_DB_PORT;
    const STREAMER_UI_DB_USER = req.app.locals.STREAMER_UI_DB_USER;
    const STREAMER_UI_DB_PASSWORD = req.app.locals.STREAMER_UI_DB_PASSWORD;
    const STREAMER_UI_DB_NAME = req.app.locals.STREAMER_UI_DB_NAME;

    // Update an upload session in the streamer UI database
    let updateUploadSessionResult;
    const endTime = new Date();
    try {
        updateUploadSessionResult = await db.updateUploadSession(
            STREAMER_UI_DB_HOST,
            STREAMER_UI_DB_PORT,
            STREAMER_UI_DB_USER,
            STREAMER_UI_DB_PASSWORD,
            STREAMER_UI_DB_NAME,
            uploadSessionId, 
            endTime);
    } catch (err) {
        return next(createError(500, err.message));
    }

    // Return the result
    console.log(JSON.stringify(updateUploadSessionResult));
    res.status(200).json({
        data: updateUploadSessionResult,
        error: null
    });
}

// Submit a streamer job
var _submit = async function(req, res, next) {
    // Obtain user credentials
    const base64Credentials = req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    let [username, password] = credentials.split(':');
    const streamerUser = username; // DCCN username

    // Check if we need to override the service admin credentials
    if (SERVICE_ADMIN_USERNAME && SERVICE_ADMIN_USERNAME !== "" &&
        SERVICE_ADMIN_PASSWORD && SERVICE_ADMIN_PASSWORD !== "") {
        username = SERVICE_ADMIN_USERNAME;
        password = SERVICE_ADMIN_PASSWORD;
    }

    // Verify username
    if (!streamerUser) {
        return next(createError(401, "streamerUser is empty"));
    }

    // Verify service admin username and password
    if (!username) {
        return next(createError(401, "service admin username is empty"));
    }
    if (!password) {
        return next(createError(401, "service admin password is empty"));
    }

    // Obtain upload session id
    const uploadSessionId = req.body.uploadSessionId;

    // Obtain structure
    const projectNumber = req.body.projectNumber;
    const subjectLabel = req.body.subjectLabel;
    const sessionLabel = req.body.sessionLabel;
    const dataType = req.body.dataType;

    // Construct the streamer URL for a new streamer job POST message
    const streamerUrl = utils.getStreamerUrl(projectNumber, subjectLabel, sessionLabel, dataType);
    if (!streamerUrl) {
        return next(createError(500, "Error creating streamer URL"));
    }

    // Obtain streamer UI database configuration
    const STREAMER_UI_DB_HOST = req.app.locals.STREAMER_UI_DB_HOST;
    const STREAMER_UI_DB_PORT = req.app.locals.STREAMER_UI_DB_PORT;
    const STREAMER_UI_DB_USER = req.app.locals.STREAMER_UI_DB_USER;
    const STREAMER_UI_DB_PASSWORD = req.app.locals.STREAMER_UI_DB_PASSWORD;
    const STREAMER_UI_DB_NAME = req.app.locals.STREAMER_UI_DB_NAME;

    // Get the list of files to be uploaded
    let submitResult;
    try {
        submitResult = await db.getUploadFileList(
            STREAMER_UI_DB_HOST,
            STREAMER_UI_DB_PORT,
            STREAMER_UI_DB_USER,
            STREAMER_UI_DB_PASSWORD,
            STREAMER_UI_DB_NAME,
            uploadSessionId);
    } catch (err) {
        console.log(err.message);
        return next(createError(500, err.message));
    }

    // Make a POST call to streamer with basic authentication
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': utils.basicAuthString(username, password)
    };
    const body = JSON.stringify({
        streamerUser: streamerUser,
        drUser: ''
    });
    const numRetries = 1;

    // 30 seconds
    const timeout = 30000; // ms

    // Submit the streamer job in the background
    console.log("Submitting streamer job");
    console.log(streamerUrl);
    console.log(JSON.stringify(headers));
    console.log(body);
    utils.fetchRetry(
        streamerUrl,
        {
            method: 'POST',
            credentials: 'include',
            headers,
            body
        },
        numRetries,
        timeout
    ).then(() => {
        console.log("Successfully submitted streamer job");
        console.log(JSON.stringify(submitResult));
        return res.status(200).json({
            data: submitResult,
            error: null
        });
    }).catch((err) => {
        console.log(err.message);
        return next(createError(500, "Could not connect to streamer service"));
    })
}

module.exports.verifyStructure = _verifyStructure;
module.exports.verifyUploadSessionId = _verifyUploadSessionId;
module.exports.verifyFile = _verifyFile;

module.exports.begin = _begin;
module.exports.validateFile = _validateFile;
module.exports.addFile = _addFile;
module.exports.finalize = _finalize;
module.exports.submit = _submit;
