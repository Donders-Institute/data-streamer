const path = require("path");
const fs = require("fs");
const mkdirp = require('mkdirp');

const db = require('./db');
const utils = require('./utils');

const config = require(path.join(__dirname + '/../config/streamer-ui-config.json'));
const SERVICE_ADMIN_USERNAME = config.serviceAdmin.username;
const SERVICE_ADMIN_PASSWORD = config.serviceAdmin.password;

// Verify upload structure
async function _verifyStructure(req, res, next) {
    let msg = "";

    if (!req.body) {
        msg = `No attributes were uploaded: "req.body" is empty`
        console.error(msg);
        return res.status(400).json({ data: null, error: msg });
    }

    let projectNumber = req.body.projectNumber;
    let subjectLabel = req.body.subjectLabel;
    let sessionLabel = req.body.sessionLabel;
    let dataType = req.body.dataType;

    if (!projectNumber) {
        msg = 'projectNumber empty';
        console.error(msg);
        return res.status(400).json({ data: null, error: msg });
    }
    if (!subjectLabel) {
        msg = 'subjectLabel empty';
        console.error(msg);
        return res.status(400).json({ data: null, error: msg });
    }
    if (!sessionLabel) {
        msg = 'sessionLabel empty';
        console.error(msg);
        return res.status(400).json({ data: null, error: msg });
    }
    if (!dataType) {
        msg = 'dataType empty';
        console.error(msg);
        return res.status(400).json({ data: null, error: msg });
    }

    next();
}

// Verify upload session id
async function _verifyUploadSessionId(req, res, next) {
    let msg = "";

    if (!req.body) {
        msg = `No attributes were validated: "req.body" is empty`
        return res.status(400).json({ data: null, error: msg });
    }

    let uploadSessionId = req.body.uploadSessionId;
    if (!uploadSessionId) {
        msg = 'uploadSessionId empty';
        return res.status(400).json({ data: null, error: msg });
    }

    next();
}

// Verify file contents in the form data
async function _verifyFileContents(req, res, next) {
    let msg = "";

    // Check for files to be uploaded
    if (!req.files) {
        msg = `No files: "req.files" is empty in request`;
        console.log(msg);
        return res.status(400).json({ data: null, error: msg });
    }
    if (!req.files.files) {
        msg = `No files: "req.files.files" is empty in request`;
        console.log(msg);
        return res.status(400).json({ data: null, error: msg });
    }

    // Given the req.files.files, derive the number of files to be uploaded
    const numFiles = utils.getNumFiles(req.files.files);
    if (numFiles === 0) {
        msg = "No files: file list is empty in request";
        console.error(msg);
        return res.status(400).json({ data: null, error: msg });
    }

    // Allow single file only
    if (numFiles > 1) {
        msg = "Only single file upload is supported";
        console.error(msg);
        return res.status(400).json({ data: null, error: msg });
    }

    next();
}

// Begin upload session, obtain upload session id
async function _begin(req, res) {

    let msg = "";
    const startTime = new Date();
    let insertUploadSessionResult;

    // Obtain the DCCN username
    const base64Credentials = req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const username = credentials.split(':')[0];

    // Obtain the user agent
    const userAgent = req.headers['user-agent'];

    // Obtain the IP address"
    const ipAddress = req.ip | "";
    console.log(`ipAddres: ${ipAddress}`);

    // Obtain structure
    const projectNumber = req.body.projectNumber;
    const subjectLabel = req.body.subjectLabel;
    const sessionLabel = req.body.sessionLabel;
    const dataType = req.body.dataType;

    // Create the target directory if it does not exist
    var dirname = utils.getDirName(projectNumber, subjectLabel, sessionLabel, dataType);
    if (!dirname) {
        msg = 'Error obtaining directory name';
        console.error(msg);
        return res.status(500).json({ data: null, error: msg });
    }
    if (!fs.existsSync(dirname)) {
        mkdirp.sync(dirname);
        console.log(`Successfully created directory "${dirname}"`);
    }

    // Add a row to the ui database
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
        console.error(err);
        return res.status(500).json({ data: null, error: err });
    }

    // Success, return the result
    console.log(username, ipAddress, userAgent, startTime);
    console.log(JSON.stringify(insertUploadSessionResult));
    return res.status(200).json({ data: insertUploadSessionResult, error: null });
}

// Check if the file to be uploaded and the destination folder do not exist already
async function _validateFile(req, res) {
    let msg = "";

    // Obtain structure
    const projectNumber = req.body.projectNumber;
    const subjectLabel = req.body.subjectLabel;
    const sessionLabel = req.body.sessionLabel;
    const dataType = req.body.dataType;

    // Obtain the target project storage directory
    const projectStorageDirname = utils.getDirName(projectNumber, subjectLabel, sessionLabel, dataType);
    if (!projectStorageDirname) {
        msg = "Error obtaining project storage directory name";
        console.error(msg);
        return res.status(500).json({ data: null, error: msg });
    }

    // Given the req.files.files, derive the number of uploaded files to be validated
    const numFiles = utils.getNumFiles(req.files.files);

    // Collection of file objects from the uploaded form data
    let files = [];
    if (numFiles === 1) {
        files.push(req.files.files);
    } else {
        files = req.files.files;
    }

    // Allow single file validation only
    const file = files[0];
    const filename = file.name;

    // Validate file
    const fileExists = utils.fileExists(filename, projectStorageDirname);
    const validationResult = { filename, fileExists };

    console.log(JSON.stringify(validationResult));
    return res.status(200).json({ data: validationResult, error: null });
}

// Add a file to the upload session
async function _addFile(req, res) {
    let msg = "";

    // Obtain upload session id
    const uploadSessionId = req.body.uploadSessionId;

    // Obtain structure
    const projectNumber = req.body.projectNumber;
    const subjectLabel = req.body.subjectLabel;
    const sessionLabel = req.body.sessionLabel;
    const dataType = req.body.dataType;

    // Obtain the target directory
    const dirname = utils.getDirName(projectNumber, subjectLabel, sessionLabel, dataType);
    if (!dirname) {
        msg = 'Error obtaining directory name';
        console.error(msg);
        return res.status(500).json({ data: null, error: msg });
    }

    // Given the req.files.files, derive the number of uploaded files
    const numFiles = utils.getNumFiles(req.files.files);

    // Collection of file objects from the uploaded form data
    let files = [];
    if (numFiles === 1) {
        files.push(req.files.files);
    } else {
        files = req.files.files;
    }

    // Allow single file upload only
    const file = files[0];
    const filename = file.name;
    const filesizeBytes = file.size;

    // Store the file in the buffer
    const err = utils.storeFile(file, dirname);
    if (err) {
        console.error(err);
        msg = `Error storing file ${filename} in ${dirname}`;
        return res.status(500).json({ data: null, error: msg });
    }

    // Add a row to the ui database
    let insertUploadFileResult;
    try {
        insertUploadFileResult = await db.insertUploadFile(uploadSessionId, filename, filesizeBytes);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ data: null, error: err });
    }

    console.log(JSON.stringify(insertUploadFileResult));
    return res.status(200).json({ data: insertUploadFileResult, error: null });
}

// Finalize the upload session
async function _finalize(req, res) {

    let msg = "";
    let endTime = new Date();
    let updateUploadSessionResult;

    // Obtain upload session id
    let uploadSessionId = req.body.uploadSessionId;
    if (!uploadSessionId) {
        msg = `uploadSessionId is empty`;
        console.error(msg);
        return res.status(400).json({ data: null, error: msg });
    }

    // Update a row in the ui database
    try {
        updateUploadSessionResult = await db.updateUploadSession(uploadSessionId, endTime);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ data: null, error: err });
    }

    // Return the result
    console.log(JSON.stringify(updateUploadSessionResult));
    return res.status(200).json({ data: updateUploadSessionResult, error: null });
}

// Submit a streamer job
async function _submit(req, res) {
    let msg = "";

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
        msg = 'streamerUser empty';
        return res.status(500).json({ data: null, error: msg });
    }

    // Verify service admin username and password
    if (!username) {
        msg = 'service admin username empty';
        return res.status(500).json({ data: null, error: msg });
    }
    if (!password) {
        msg = 'service admin password emnpty';
        return res.status(500).json({ data: null, error: msg });
    }

    // Obtain upload session id
    let uploadSessionId = req.body.uploadSessionId;

    // Obtain structure
    let projectNumber = req.body.projectNumber;
    let subjectLabel = req.body.subjectLabel;
    let sessionLabel = req.body.sessionLabel;
    let dataType = req.body.dataType;

    // Construct the streamer URL for a new streamer job POST message
    var streamerUrl = utils.getStreamerUrl(projectNumber, subjectLabel, sessionLabel, dataType);
    if (!streamerUrl) {
        msg = 'Error creating streamer URL';
        return res.status(500).json({ data: null, error: msg });
    }

    // Get the list of files to be uploaded
    let submitResult;
    try {
        submitResult = await db.getUploadFileList(uploadSessionId);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ data: null, error: err });
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
            return res.status(200).json({ data: submitResult, error: null });
        })
        .catch((err) => {
            console.error(err);
            msg = "could not connect to streamer service";
            console.error(msg);
            return res.status(500).json({ data: null, error: msg });
        });
}

module.exports.verifyStructure = _verifyStructure;
module.exports.verifyUploadSessionId = _verifyUploadSessionId;
module.exports.verifyFileContents = _verifyFileContents;

module.exports.begin = _begin;
module.exports.validateFile = _validateFile;
module.exports.addFile = _addFile;
module.exports.finalize = _finalize;
module.exports.submit = _submit
