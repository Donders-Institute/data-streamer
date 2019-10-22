const path = require("path");
const fs = require("fs");
const mkdirp = require('mkdirp');
const request = require('request');
const async = require('async');
const db = require('./db');

const config = require(path.join(__dirname + '/../config/streamer-ui-config.json'));
const SERVICE_ADMIN_USERNAME = config.serviceAdmin.username;
const SERVICE_ADMIN_PASSWORD = config.serviceAdmin.password;

const STREAMER_UI_BUFFER_DIR = process.env.STREAMER_UI_BUFFER_DIR || __dirname + '/uploads';
const STREAMER_URL_PREFIX = process.env.STREAMER_URL_PREFIX || "http://streamer:3001";

// Given the req.files.files, derive the number of uploaded files
function get_num_files(files) {
    if (files[0]) {
        return files.length;
    } else {
        return 1;
    }
}

// Get the directory name
function get_dirname(projectNumber, subjectLabel, sessionLabel, dataType) {
    var err;
    var dirname;
    if (projectNumber && subjectLabel && sessionLabel && dataType) {
        var sub = 'sub-' + subjectLabel;
        var ses = 'ses-' + sessionLabel;
        dirname = path.join(STREAMER_UI_BUFFER_DIR, projectNumber, sub, ses, dataType);
    }
    return [err, dirname];
}

// Get the streamer URL
function get_streamer_url(projectNumber, subjectLabel, sessionLabel, dataType) {
    var err;
    var url;
    if (projectNumber && subjectLabel && sessionLabel && dataType) {
        url = `${STREAMER_URL_PREFIX}/user/${projectNumber}/${subjectLabel}/${sessionLabel}/${dataType}`;
    }
    return [err, url];
}

var _upload = function (req, res) {

    var msg = "";
    var username = "";
    var password = "";
    var ip_address = "";
    var user_agent = "";
    var start_time = new Date();
    var end_time;
    var filesize_bytes = 0;

    // Check for basic auth header
    if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
        msg = 'Missing Authorization Header'
        console.log(msg);
        db.insert_upload_event(username, ip_address, user_agent, start_time, end_time, filesize_bytes, msg).catch(console.log(msg));
        return res.status(401).send(msg);
    }

    // Verify auth credentials
    const base64Credentials = req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    [username, password] = credentials.split(':');
    const streamerUser = username;

    // Check if we need to user service admin credentials
    if (SERVICE_ADMIN_USERNAME && SERVICE_ADMIN_USERNAME !== "" &&
        SERVICE_ADMIN_PASSWORD && SERVICE_ADMIN_PASSWORD !== "") {
        username = SERVICE_ADMIN_USERNAME;
        password = SERVICE_ADMIN_PASSWORD;
    }

    // Obtain the user agent
    user_agent = req.headers['user-agent'];

    // Check for structure
    if (!req.body) {
        msg = `No attributes were uploaded: "req.body" is empty`
        db.insert_upload_event(username, ip_address, user_agent, start_time, end_time, filesize_bytes, msg).catch(console.log(msg));
        return res.status(400).send(msg);
    }
    var projectNumber = req.body.projectNumber;
    var subjectLabel = req.body.subjectLabel;
    var sessionLabel = req.body.sessionLabel;
    var dataType = req.body.dataType;
    ip_address = req.body.ipAddress;

    // Check for uploaded files
    if (!req.files) {
        msg = `No files were uploaded: "req.files" is empty`;
        console.log(msg);
        db.insert_upload_event(username, ip_address, user_agent, start_time, end_time, filesize_bytes, msg).catch(console.log(msg));
        return res.status(400).send(msg);
    }
    if (!req.files.files) {
        msg = `No files were uploaded: "req.files.files" is empty`;
        console.log(msg);
        db.insert_upload_event(username, ip_address, user_agent, start_time, end_time, msg);
        return res.status(400).send(msg);
    }

    // Create the target directory if it does not exist
    var [err, dirname] = get_dirname(projectNumber, subjectLabel, sessionLabel, dataType);
    if (err) {
        console.error(err);
        db.insert_upload_event(username, ip_address, user_agent, start_time, end_time, filesize_bytes, msg).catch(console.log(msg));
        return res.status(500).send(err);
    }
    if (!dirname) {
        msg = 'Error creating directory';
        console.error(msg);
        db.insert_upload_event(username, ip_address, user_agent, start_time, end_time, filesize_bytes, msg).catch(console.log(msg));
        return res.status(500).send(msg);
    }
    if (!fs.existsSync(dirname)) {
        mkdirp.sync(dirname);
        msg = (`Successfully created directory "${dirname}"`);
        console.log(msg);
    }

    // Store the file(s)
    var num_files = get_num_files(req.files.files);

    if (num_files === 0) {
        msg = `No files were uploaded: file list is empty in request`;
        console.error(msg);
        db.insert_upload_event(username, ip_address, user_agent, start_time, end_time, filesize_bytes, msg).catch(console.log(msg));
        return res.status(400).send(msg);
    }

    // Function for moving uploaded file from temporary directory to the UI buffer
    function store_file(file, cb) {
        var target_path = path.join(dirname, file.name);
        filesize_bytes += file.size;
        file.mv(target_path, function (err) {
            if (err) {
                return cb(err, null);
            } else {
                return cb(null, file.name);
            }
        });
    }

    // Collection of file objects from the uploaded FORM data
    var files = [];
    if (num_files === 1) {
        files.push(req.files.files);
    } else {
        files = req.files.files;
    }

    async.waterfall([
        function (cb) {
            async.mapLimit(files, 4, store_file, function (err, results) {
                if (err) {
                    return cb(err, null);
                } else {
                    return cb(null, results);
                }
            });
        },
        function (results, cb) {
            // Construct Streamer URL for POST a new streamer job.
            var [err, streamerURL] = get_streamer_url(projectNumber, subjectLabel, sessionLabel, dataType);
            if (err) {
                return cb(err, null);
            }
            if (!streamerURL) {
                return cb(Error('Error creating streamer URL'), null);
            }

            // Make POST call to streamer with basic authentication with username/password
            if (!username) {
                return cb(Error('Username empty'), null);
            }
            if (!password) {
                return cb(Error('Password empty'), null);
            }
            if (!streamerUser) {
                return cb(Error('streamerUser empty'), null);
            }
            request.post(
                {
                    'url': streamerURL,
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
                    console.log(streamerURL);
                    if (err) {
                        return cb(err, null);
                    } else {
                        // Check status code from response, and throw error back to callback 
                        // if the status code is not 200
                        if (res.statusCode != 200) {
                            return cb(Error(`Wrong response status code ${res.statusCode}`), null);
                        }
                        console.log('statusCode:', res && res.statusCode)
                        console.log('body:', body);
                        return cb(null, results);
                    }
                });
        }],
        function (err, results) {
            if (err) {
                console.error(err);
                db.insert_upload_event(username, ip_address, user_agent, start_time, end_time, 0, err).catch(console.log(err));
                return res.status(500).json({ "error": err });
            } else {
                msg = `File(s) were succesfully uploaded: ${results}`;
                console.log(msg);
                end_time = new Date();
                db.insert_upload_event(username, ip_address, user_agent, start_time, end_time, filesize_bytes, '').catch(console.log(msg));
                return res.status(200).json({ "message": msg });
            }
        }
    );
}

module.exports.upload = _upload;
