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
var _verifyStructure = function (req, res, next) {
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
var _verifyUploadSessionId = function (req, res, next) {
    if (!req.body) {
        return next(createError(400, `No attributes were validated: "req.body" is empty`));
    }

    const uploadSessionId = req.body.uploadSessionId;

    if (!uploadSessionId) {
        return next(createError(400, "uploadSessionId empty"));
    }

    next();
}

// Begin upload session, obtain upload session id
// If the streamer UI buffer folder does not exist create it
var _begin = async function (req, res, next) {

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
    var dirName = utils.getStreamerUIBufferDirName(projectNumber, subjectLabel, sessionLabel, dataType);
    if (!dirName) {
        return next(createError(500, "Error obtaining streamer buffer UI directory name"));
    }
    if (!fs.existsSync(dirName)) {
        mkdirp.sync(dirName);
        console.log(`Successfully created streamer buffer UI directory "${dirName}"`);
    }

    // Add an upload session to the streamer UI database
    let insertUploadSessionResult;
    const startTime = new Date();
    try {
        insertUploadSessionResult = await db.insertUploadSession(
            username,
            ipAddress,
            userAgent,
            projectNumber,
            subjectLabel,
            sessionLabel,
            dataType,
            startTime);
    } catch (err) {
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

// Check if the file to be uploaded and the destination project storage folder do not exist already
// After multipare/form-data after multer middleware
var _validateFile = function (req, res, next) {

    // Obtain structure from form data
    const projectNumber = req.body.projectNumber;
    const subjectLabel = req.body.subjectLabel;
    const sessionLabel = req.body.sessionLabel;
    const dataType = req.body.dataType;

    // Obtain the project storage directory name
    const projectStorageDirName = utils.getProjectStorageDirName(projectNumber, subjectLabel, sessionLabel, dataType);
    if (!projectStorageDirName) {
        return next(createError(500, "Error obtaining project storage directory name"));
    }

    // Obtain file
    const file = req.file;
    const filename = file.name;
    console.log(filename);

    // Check if file has zero size
    const fileIsEmpty = file.size === 0;

    // Check if project storage folder and file exists already
    const fileExists = utils.fileExists(filename, projectStorageDirName);

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
// After multipare/form-data after multer middleware
var _addFile = async function (req, res, next) {

    // Obtain upload session id from form data
    const uploadSessionId = req.body.uploadSessionId;

    // Obtain structure from form data
    const projectNumber = req.body.projectNumber;
    const subjectLabel = req.body.subjectLabel;
    const sessionLabel = req.body.sessionLabel;
    const dataType = req.body.dataType;

    // Obtain the streamer UI buffer directory name
    const dirName = utils.getStreamerUIBufferDirName(projectNumber, subjectLabel, sessionLabel, dataType);
    if (!dirName) {
        return next(createError(500, "Error obtaining streamer buffer UI directory name"));
    }

    // Obtain file
    const file = req.file;
    const filename = file.name;
    const filesizeBytes = file.size;
    console.log(filename);

    // Store the file in the streamer UI buffer
    const err = await utils.storeFile(file, dirName);
    if (err) {
        console.log(JSON.stringify(err));
        return next(createError(500, `Error storing file ${filename} in project storage directory ${dirName}`));
    }

    // Add an upload file to the streamer UI database
    let insertUploadFileResult;
    try {
        insertUploadFileResult = await db.insertUploadFile(uploadSessionId, filename, filesizeBytes);
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
var _finalize = async function (req, res, next) {

    // Obtain upload session id
    const uploadSessionId = req.body.uploadSessionId;

    // Update an upload session in the streamer UI database
    let updateUploadSessionResult;
    const endTime = new Date();
    try {
        updateUploadSessionResult = await db.updateUploadSession(uploadSessionId, endTime);
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
var _submit = async function (req, res, next) {

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

    // Get the list of files to be uploaded
    let submitResult;
    try {
        submitResult = await db.getUploadFileList(uploadSessionId);
    } catch (err) {
        return next(createError(500, err.message));
    }

    // Make a POST call to streamer with basic authentication
    const headers = new Headers({
        'Content-Type': 'application/json',
        'Authorization': utils.basicAuthString({ username, password })
    });
    const body = JSON.stringify({
        streamerUser: streamerUser,
        drUser: ''
    });
    const numRetries = 1;
    const timeout = 2000; // ms

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
    )
        .then(() => {
            console.log("Successfully submitted streamer job");
            console.log(JSON.stringify(submitResult));
            return res.status(200).json({
                data: submitResult,
                error: null
            });
        })
        .catch((err) => {
            console.error(err);
            return next(createError(500, "Could not connect to streamer service"));
        });
}

module.exports.verifyUploadSessionId = _verifyUploadSessionId;
module.exports.verifyStructure = _verifyStructure;

module.exports.begin = _begin;
module.exports.validateFile = _validateFile;
module.exports.addFile = _addFile;
module.exports.finalize = _finalize;
module.exports.submit = _submit
