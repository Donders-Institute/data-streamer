const fs = require("fs");
const mkdirp = require('mkdirp');
const db = require('./db');
const utils = require('./utils');

var _begin = async function (req, res) {

    var msg = "";
    var dccnUsername = "";
    var ipAddress = "";
    var userAgent = "";
    var startTime = new Date();
    var insertUploadSessionResult;

    // Check for basic auth header
    if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
        msg = 'Missing Authorization Header'
        console.log(msg);
        return res.status(401).json({ "error": msg });
    }

    // Verify auth credentials
    const base64Credentials = req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    dccnUsername = credentials.split(':')[0];

    // Obtain the user agent
    userAgent = req.headers['user-agent'];

    // Check for structure
    if (!req.body) {
        msg = `No attributes were uploaded: "req.body" is empty`
        return res.status(400).json({ "error": msg });
    }
    var projectNumber = req.body.projectNumber;
    var subjectLabel = req.body.subjectLabel;
    var sessionLabel = req.body.sessionLabel;
    var dataType = req.body.dataType;
    ipAddress = req.body.ipAddress;

    // Create the target directory if it does not exist
    var dirname = utils.getDirName(projectNumber, subjectLabel, sessionLabel, dataType);
    if (!dirname) {
        msg = 'Error obtaining directory name';
        console.error(msg);
        console.log(dccnUsername, ipAddress, userAgent, startTime, msg);
        return res.status(500).json({ "error": msg });
    }
    if (!fs.existsSync(dirname)) {
        mkdirp.sync(dirname);
        msg = (`Successfully created directory "${dirname}"`);
        console.log(dccnUsername, ipAddress, userAgent, startTime, msg);
        console.log(msg);
    }

    // Add a row to the ui database
    try {
        insertUploadSessionResult = await db.insertUploadSession(dccnUsername, ipAddress, userAgent, projectNumber, subjectLabel, sessionLabel, dataType, startTime);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ "error": error });
    }

    // Return the result
    return res.status(200).json({ "data": insertUploadSessionResult });
}

module.exports.begin = _begin;
