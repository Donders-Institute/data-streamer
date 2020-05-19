const path = require("path");
const fs = require('fs');
const fetch = require('node-fetch');

const STREAMER_UI_PROJECT_DIR = process.env.STREAMER_UI_PROJECT_DIR || __dirname + '/uploads';
const STREAMER_UI_BUFFER_DIR = process.env.STREAMER_UI_BUFFER_DIR || __dirname + '/uploads';
const STREAMER_URL_PREFIX = process.env.STREAMER_URL_PREFIX || "http://streamer:3001";

// Get the streamer UI buffer directory name
var _getStreamerUIBufferDirname = function (projectNumber, subjectLabel, sessionLabel, dataType) {
    let streamerUIBufferDirname;
    if (projectNumber && subjectLabel && sessionLabel && dataType) {
        var sub = 'sub-' + subjectLabel;
        var ses = 'ses-' + sessionLabel;
        streamerUIBufferDirname = path.join(STREAMER_UI_BUFFER_DIR, projectNumber, sub, ses, dataType);
    }
    return streamerUIBufferDirname;
}

// Get the project storage directory name
var _getProjectStorageDirname = function (projectNumber, subjectLabel, sessionLabel, dataType) {
    let projectStorageDirname;
    if (projectNumber && subjectLabel && sessionLabel && dataType) {
        var sub = 'sub-' + subjectLabel;
        var ses = 'ses-' + sessionLabel;
        projectStorageDirname = path.join(STREAMER_UI_PROJECT_DIR, projectNumber, 'raw', sub, ses, dataType);
    }
    return projectStorageDirname;
}

// Check if the file already exists
var _fileExists = function (filename, dirname) {
    const targetPath = path.join(dirname, filename);
    console.log("Check dirname:" + dirname);
    console.log("Check filename:" + filename);
    console.log("Check if targetPath exists:");
    console.log(targetPath);
    let fileExists = true;
    try {
        fs.accessSync(targetPath, fs.F_OK);
    } catch (err) {
        fileExists = false;
    }
    return fileExists;
}

// Get the streamer URL
var _getStreamerUrl = function (projectNumber, subjectLabel, sessionLabel, dataType) {
    let url;
    if (projectNumber && subjectLabel && sessionLabel && dataType) {
        url = `${STREAMER_URL_PREFIX}/user/${projectNumber}/${subjectLabel}/${sessionLabel}/${dataType}`;
    }
    return url;
}

// Fetch once with timeout in milliseconds
var _fetchOnce = async function (url, options, timeout) {
    return Promise.race([
        // Fetch route
        fetch(url, options).then((response) => {
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            return response;
        }).then((response) => {
            return response.json();
        }).catch((err) => {
            throw err;
        }),
        // Timer route
        new Promise((resolve, reject) =>
            setTimeout(() => reject(new Error('timeout')), timeout)
        ).catch((err) => {
            throw err;
        })
    ]);
}

// Retry fetch with number of retries and timeout in milliseconds
var _fetchRetry = async function (url, options, numRetries, timeout) {
    try {
        return await _fetchOnce(url, options, timeout);
    } catch (error) {
        if (numRetries === 1) throw error;
        const newNumRetries = numRetries - 1;
        return await _fetchRetry(url, options, newNumRetries, timeout);
    }
}

// Get basic auth string for "Authorization" key in headers
var _basicAuthString = function (username, password) {
    const credentials = `${username}:${password}`;
    const b64encoded = Buffer.from(credentials, 'binary').toString('base64');
    return `Basic ${b64encoded}`;
}

module.exports.getProjectStorageDirname = _getProjectStorageDirname;
module.exports.getStreamerUIBufferDirname = _getStreamerUIBufferDirname;
module.exports.fileExists = _fileExists;
module.exports.getStreamerUrl = _getStreamerUrl;

module.exports.fetchOnce = _fetchOnce;
module.exports.fetchRetry = _fetchRetry;
module.exports.basicAuthString = _basicAuthString;