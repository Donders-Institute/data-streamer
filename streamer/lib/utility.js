const child_process = require('child_process');

// general error handler to send response to the client
var _responseOnError = function(c_type, c_data, resp) {
    resp.status(500);
    if (c_type === 'json') {
        resp.json(c_data);
    } else {
        resp.send(c_data);
    }
}

// general function to write log to console
var _composeLog = function(header, msg) {
    var log = '[' + (new Date()).toISOString() + ']';
    log += (header)?'[' + header + '] ':' ';
    log += msg;
    return log;
}

// general function to write log to console
var _printLog = function(header, log) {
    console.log(_composeLog(header, log));
}

// general function to write log to console
var _printErr = function(header, err) {
    console.error(_composeLog(header, err));
}

// general function to check freespace using the `df` command in 1K blocks.
// an error is thrown if the system call to `df` is failed. 
var _diskFree = function(path) {
    freespace = 0;
    stdout = child_process.execSync("df -k --output=avail " + path);
    stdout.toString().split("\n").forEach(function(line) {
        if ( line.match(/[0-9]+/) ) {
            freespace = parseInt(line);
        }
    });
    return freespace;
}

// parses the RDR iRODS collName to get the ou name in lower case.
//
// The RDR iRODS collName is structed as follows:
//
// `/{zone}/{o}/{ou}/{collection}`
//
// This function gets the value of {ou} assuming the input `collName`
// follows the structure.
var _getOuFromCollName = function(collName) {
    return path.basename(path.dirname(collName)).toLowerCase()
}

module.exports.responseOnError = _responseOnError;
module.exports.printLog = _printLog;
module.exports.printErr = _printErr;
module.exports.diskFree = _diskFree;
module.exports.getOuFromCollName = _getOuFromCollName;
