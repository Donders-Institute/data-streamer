const path = require("path");

const STREAMER_UI_BUFFER_DIR = process.env.STREAMER_UI_BUFFER_DIR || __dirname + '/uploads';
const STREAMER_URL_PREFIX = process.env.STREAMER_URL_PREFIX || "http://streamer:3001";

// Get the directory name
function _getDirName(projectNumber, subjectLabel, sessionLabel, dataType) {
    var dirname;
    if (projectNumber && subjectLabel && sessionLabel && dataType) {
        var sub = 'sub-' + subjectLabel;
        var ses = 'ses-' + sessionLabel;
        dirname = path.join(STREAMER_UI_BUFFER_DIR, projectNumber, sub, ses, dataType);
    }
    return dirname;
}

// Move the uploaded file from the temporary directory to the UI buffer
function _storeFile(file, dirname) {
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
function _getStreamerUrl(projectNumber, subjectLabel, sessionLabel, dataType) {
    var url;
    if (projectNumber && subjectLabel && sessionLabel && dataType) {
        url = `${STREAMER_URL_PREFIX}/user/${projectNumber}/${subjectLabel}/${sessionLabel}/${dataType}`;
    }
    return url;
}

module.exports.getDirName = _getDirName;
module.exports.storeFile = _storeFile;
module.exports.storeFile = _getStreamerUrl;
