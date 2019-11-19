const path = require("path");
const request = require('request');
const db = require('./db');
const utils = require('./utils');

const config = require(path.join(__dirname + '/../config/streamer-ui-config.json'));
const SERVICE_ADMIN_USERNAME = config.serviceAdmin.username;
const SERVICE_ADMIN_PASSWORD = config.serviceAdmin.password;

var _submit = async function (req, res) {

    var msg = "";
    var username = "";
    var password = "";
    var submitResult;

    // Check for basic auth header
    if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
        msg = 'Missing Authorization Header'
        console.log(msg);
        return res.status(401).json({ "error": msg });
    }

    // Verify auth credentials
    const base64Credentials = req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    [username, password] = credentials.split(':');
    const streamerUser = username; // DCCN username

    // Check if we need to user service admin credentials
    if (SERVICE_ADMIN_USERNAME && SERVICE_ADMIN_USERNAME !== "" &&
        SERVICE_ADMIN_PASSWORD && SERVICE_ADMIN_PASSWORD !== "") {
        username = SERVICE_ADMIN_USERNAME;
        password = SERVICE_ADMIN_PASSWORD;
    }

    if (!username) {
        msg = 'Username empty';
        return res.status(500).json({ "error": msg });
    }
    if (!password) {
        msg = 'Password emnpty';
        return res.status(500).json({ "error": msg });
    }
    if (!streamerUser) {
        msg = 'streamerUser empty';
        return res.status(500).json({ "error": msg });
    }

    // Check for structure
    if (!req.body) {
        msg = `No attributes were uploaded: "req.body" is empty`
        return res.status(400).json({ "error": msg });
    }
    var uploadSessionId = req.body.uploadSessionId;
    var projectNumber = req.body.projectNumber;
    var subjectLabel = req.body.subjectLabel;
    var sessionLabel = req.body.sessionLabel;
    var dataType = req.body.dataType;

    if (!uploadSessionId) {
        msg = 'uploadSessionId empty';
        return res.status(500).json({ "error": msg });
    }
    if (!projectNumber) {
        msg = 'projectNumber empty';
        return res.status(500).json({ "error": msg });
    }
    if (!subjectLabel) {
        msg = 'subjectLabel empty';
        return res.status(500).json({ "error": msg });
    }
    if (!sessionLabel) {
        msg = 'sessionLabel empty';
        return res.status(500).json({ "error": msg });
    }
    if (!dataType) {
        msg = 'dataType empty';
        return res.status(500).json({ "error": msg });
    }

    // Construct Streamer URL for POST a new streamer job.
    var streamerUrl = utils.getStreamerUrl(projectNumber, subjectLabel, sessionLabel, dataType);
    if (!streamerUrl) {
        msg = 'Error creating streamer URL';
        return res.status(500).json({ "error": msg });
    }

    // Get the list of files to be uploaded
    try {
        submitResult = await db.getUploadFileList(uploadSessionId);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ "error": error });
    }

    // Make POST call to streamer with basic authentication with username/password
    request.post(
        {
            'url': streamerUrl,
            'auth': {
                'user': username,
                'pass': password
            },
            'json': true,
            'body': {
                streamerUser: streamerUser,
                drUser: ''
            }
        },
        (err, res, body) => {
            console.log(streamerUrl);
            if (err) {
                msg = "could not connect to streamer service";
                console.log(msg);
                return res.status(500).json({ "error": msg });
            } else {
                // Check status code from response 
                // and return error if the status code is not 200
                if (res.statusCode != 200) {
                    msg = `Wrong response status code ${res.statusCode}`;
                    return res.status(500).json({ "error": msg });
                }
                console.log('statusCode:', res && res.statusCode)
                console.log('body:', body);
                console.log(JSON.stringify(submitResult));
                return res.status(200).json({ "data": submitResult });
            }
        }
    );
}

module.exports.submit = _submit;
