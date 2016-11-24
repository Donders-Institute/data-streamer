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
    console.log(_composeLog(header, err));
}

module.exports.responseOnError = _responseOnError;
module.exports.printLog = _printLog;
module.exports.printErr = _printErr;
