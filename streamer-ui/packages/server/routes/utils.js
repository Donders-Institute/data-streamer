const path = require("path");
const fs = require('fs');
const fetch = require('node-fetch');

const PROJECT_VOL = process.env.PROJECT_VOL || __dirname + '/uploads';
const STREAMER_UI_BUFFER_DIR = process.env.STREAMER_UI_BUFFER_DIR || __dirname + '/uploads';
const STREAMER_URL_PREFIX = process.env.STREAMER_URL_PREFIX || "http://streamer:3001";

// Get the streamer UI buffer directory name
var _getStreamerUIBufferDirName = function (projectNumber, subjectLabel, sessionLabel, dataType) {
    let streamerUIBufferDirName;
    if (projectNumber && subjectLabel && sessionLabel && dataType) {
        var sub = 'sub-' + subjectLabel;
        var ses = 'ses-' + sessionLabel;
        streamerUIBufferDirName = path.join(STREAMER_UI_BUFFER_DIR, projectNumber, sub, ses, dataType);
    }
    return streamerUIBufferDirName;
}

// Get the project storage directory name
var _getProjectStorageDirName = function (projectNumber, subjectLabel, sessionLabel, dataType) {
    let projectStorageDirName;
    if (projectNumber && subjectLabel && sessionLabel && dataType) {
        var sub = 'sub-' + subjectLabel;
        var ses = 'ses-' + sessionLabel;
        projectStorageDirName = path.join(PROJECT_VOL, projectNumber, 'raw', sub, ses, dataType);
    }
    return projectStorageDirName;
}

// Derive the number of files
var _getNumFiles = function (files) {
    if (files[0]) {
        return files.length;
    } else {
        return 1;
    }
}

// Check if the file already exists
var _fileExists = function (filename, dirname) {
    var targetPath = path.join(dirname, filename);
    var fileExists = true;
    try {
        fs.accessSync(targetPath, fs.F_OK);
    } catch (err) {
        fileExists = false;
    }
    return fileExists;
}

// Move the uploaded file from the temporary directory to the UI buffer
var _storeFile = async function (file, dirname) {
    var targetPath = path.join(dirname, file.name);
    file.mv(targetPath, function (err) {
        if (err) {
            return err;
        } else {
            return null;
        }
    });
}

// Get the streamer URL
var _getStreamerUrl = function (projectNumber, subjectLabel, sessionLabel, dataType) {
    var url;
    if (projectNumber && subjectLabel && sessionLabel && dataType) {
        url = `${STREAMER_URL_PREFIX}/user/${projectNumber}/${subjectLabel}/${sessionLabel}/${dataType}`;
    }
    return url;
}

// Fetch once with timeout in milliseconds
var _fetchOnce = async function ({ url, options, timeout }) {
    return Promise.race([
        fetch(url, options).then(response => {
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            return response.json();
        }),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), timeout)
        )
    ]);
}

// Retry fetch with number of retries and timeout in milliseconds
var _fetchRetry = async function ({ url, options, numRetries, timeout }) {
    try {
        return await _fetchOnce({ url, options, timeout });
    } catch (error) {
        if (numRetries === 1) throw error;
        return await _fetchRetry({ url, options, numRetries: numRetries - 1, timeout });
    }
}

// Get basic auth string for "Authorization" key in headers
var _basicAuthString = function ({ username, password }) {
    const b64encoded = btoa(`${username}:${password}`);
    return `Basic ${b64encoded}`;
}

module.exports.getProjectStorageDirName = _getProjectStorageDirName;
module.exports.getStreamerUIBufferDirName = _getStreamerUIBufferDirName;
module.exports.getNumFiles = _getNumFiles;
module.exports.fileExists = _fileExists;
module.exports.storeFile = _storeFile;
module.exports.getStreamerUrl = _getStreamerUrl;

module.exports.fetchOnce = _fetchOnce;
module.exports.fetchRetry = _fetchRetry;
module.exports.basicAuthString = _basicAuthString;