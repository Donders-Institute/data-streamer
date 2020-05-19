import { join } from "path";
import { existsSync } from "fs";
import { sync } from 'mkdirp';
import createError from "http-errors";

import { insertUploadSession, insertUploadFile, updateUploadSession, getUploadFileList } from './db';
import { getStreamerUIBufferDirname, getProjectStorageDirname, fileExists as _fileExists, getStreamerUrl, basicAuthString, fetchRetry } from './utils';

const config = require(join(__dirname + '/../config/streamer-ui-config.json'));
const SERVICE_ADMIN_USERNAME = config.serviceAdmin.username;
const SERVICE_ADMIN_PASSWORD = config.serviceAdmin.password;

// Middleware to verify upload structure 
// (can be in JSON or multipare/form-data after multer middleware)
export function verifyStructure(req, res, next) {
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
export function verifyUploadSessionId(req, res, next) {
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
export function verifyFile(req, res, next) {
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
export async function begin(req, res, next) {

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
    var dirname = getStreamerUIBufferDirname(projectNumber, subjectLabel, sessionLabel, dataType);
    if (!dirname) {
        return next(createError(500, "Error obtaining streamer buffer UI directory name"));
    }
    if (!existsSync(dirname)) {
        sync(dirname);
        console.log(`Successfully created streamer buffer UI directory "${dirname}"`);
    }

    // Add an upload session to the streamer UI database
    let insertUploadSessionResult;
    const startTime = new Date();
    try {
        insertUploadSessionResult = await insertUploadSession(
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

// Check if the project storage folder and the file to be uploaded exist already
// (After processed the multipare/form-data with the multer middleware)
export function validateFile(req, res, next) {

    // Obtain structure from form data
    const projectNumber = req.body.projectNumber;
    const subjectLabel = req.body.subjectLabel;
    const sessionLabel = req.body.sessionLabel;
    const dataType = req.body.dataType;

    // Obtain the project storage directory name
    const projectStorageDirname = getProjectStorageDirname(projectNumber, subjectLabel, sessionLabel, dataType);
    if (!projectStorageDirname) {
        return next(createError(500, "Error obtaining project storage directory name"));
    }

    // Obtain file attributes
    const filename = req.body.filename;
    const fileSizeBytes = req.body.fileSizeBytes;
    const fileSizeBytesInt = parseInt(fileSizeBytes, 0);

    // Check if file has zero size
    const fileIsEmpty = fileSizeBytesInt === 0;

    // Check if project storage folder and file exists already
    const fileExists = _fileExists(filename, projectStorageDirname);

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
export async function addFile(req, res, next) {

    // Obtain upload session id from form data
    const uploadSessionId = req.body.uploadSessionId;

    // Obtain file attributes
    const filename = req.body.filename;
    const fileSizeBytes = req.body.fileSizeBytes;

    // Add an upload file to the streamer UI database
    let insertUploadFileResult;
    try {
        insertUploadFileResult = await insertUploadFile(uploadSessionId, filename, fileSizeBytes);
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
export async function finalize(req, res, next) {

    // Obtain upload session id
    const uploadSessionId = req.body.uploadSessionId;

    // Update an upload session in the streamer UI database
    let updateUploadSessionResult;
    const endTime = new Date();
    try {
        updateUploadSessionResult = await updateUploadSession(uploadSessionId, endTime);
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
export async function submit(req, res, next) {

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
    const streamerUrl = getStreamerUrl(projectNumber, subjectLabel, sessionLabel, dataType);
    if (!streamerUrl) {
        return next(createError(500, "Error creating streamer URL"));
    }

    // Get the list of files to be uploaded
    let submitResult;
    try {
        submitResult = await getUploadFileList(uploadSessionId);
    } catch (err) {
        return next(createError(500, err.message));
    }

    // Make a POST call to streamer with basic authentication
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': basicAuthString(username, password)
    };
    const body = JSON.stringify({
        streamerUser: streamerUser,
        drUser: ''
    });
    const numRetries = 1;

    const timeout = 5000; // ms

    // Submit the streamer job in the background
    console.log("Submitting streamer job");
    fetchRetry(
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
    }
    ).catch((err) => {
        console.error(err);
        return next(createError(500, "Could not connect to streamer service"));
    })
}
