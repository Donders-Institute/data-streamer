const createError = require("http-errors");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const fileUpload = require("express-fileupload");
const fs = require("fs");
const mkdirp = require('mkdirp');
const request = require('request');
const async = require('async');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'frontend')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());

const STREAMER_UI_HOST = process.env.STREAMER_UI_HOST || "localhost";
const STREAMER_UI_PORT = process.env.STREAMER_UI_PORT333 || 9000;
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
      var subject = 'sub-' + subjectLabel;
      var session = 'ses-' + sessionLabel;
      dirname = path.join(STREAMER_UI_BUFFER_DIR, projectNumber, subject, session, dataType);
  }
  return [err, dirname];
}

// Get the streamer URL
function get_streamer_url(projectNumber, subjectLabel, sessionLabel, dataType) {
  var err;
  var url;
  if (projectNumber && subjectLabel && sessionLabel && dataType) {
    var subject = 'sub-' + subjectLabel;
    var session = 'ses-' + sessionLabel;  
    url = `${STREAMER_URL_PREFIX}/user/${projectNumber}/${subject}/${session}/${dataType}`;
  }
  return [err, url];
}

// Handle POST request
app.post("/upload", function(req, res) {

  // Check for structure
  if (!req.body) {
    return res.status(400).send(`No attributes were uploaded: "req.body" is empty`);
  }
  projectNumber = req.body.projectNumber;
  subjectLabel = req.body.subjectLabel;
  sessionLabel = req.body.sessionLabel;
  dataType = req.body.dataType;

  // Check for uploaded files
  if (!req.files) {
    var msg = `No files were uploaded: "req.files" is empty`;
    console.log(msg);
    return res.status(400).send(msg);
  }
  if (!req.files.files) {
    var msg = `No files were uploaded: "req.files.files" is empty`;
    console.log(msg);
    return res.status(400).send(msg);
  }

  // Create the target directory if it does not exist
  var [err, dirname] = get_dirname(projectNumber, subjectLabel, sessionLabel, dataType);
  if (err) {
    console.error(err);
    return res.status(500).send(err);
  }
  if (!dirname) {
    var msg = 'Error creating directory';
    console.error(msg);
    return res.status(500).send(msg);
  }
  if (!fs.existsSync(dirname)) {
    mkdirp.sync(dirname);
    console.log(`Successfully created directory "${dirname}"`);
  }
  
  // Store the file(s)
  var num_files = get_num_files(req.files.files);
  var fileListString = "[]";

  if (num_files === 0) {
    var msg = `No files were uploaded: file list is empty in request`;
    console.error(msg);
    return res.status(400).send(msg);

  }
  
  // function of moving uploaded file from temporary directory to the UI buffer.
  function store_file(file, cb) {
    target_path = path.join(dirname, file.name);
    file.mv(target_path, function(err) {
      if (err) {
        return cb(err, null);
      } else {
        return cb(null, file.name);
      }
    });
  };

  // collection file objects from the uploaded FORM data.
  var files = [];
  if (num_files === 1) {
    files.push(req.files.files);
  } else {
    files = req.files.files;
  }

  async.waterfall([
    function(cb) {
      async.mapLimit(files, 4, store_file, function(err, results) {
        if (err) {
          return cb(err, null);
        } else {
          return cb(null, results);
        }
      });
    },
    function(results, cb) {
      // construct Streamer URL for POST a new streamer job.
      var [err, streamerURL] = get_streamer_url(projectNumber, subjectLabel, sessionLabel, dataType);
      if (err) {
        return cb(err, null);
      }
      if (!streamerURL) {
        return cb(Error('Error creating streamer URL'), null);
      }

      // make POST call to streamer.
      // TODO: send request with basic authentication with username/password
      //       provided via configuration or env variable (w/ Docker secret)
      request.post(streamerURL, {json: {}}, (err, res, body) => {
        console.log(streamerURL);
        if (err) {
          return cb(err, null);
        } else {
          // TODO: check status code from response, and throw error back to callback if
          //       the status code is not 200.
          console.log('statusCode:', res && res.statusCode)
          console.log('body:', body); 
          return cb(null, results);
        }
      });
    }],
    function(err, results) {
      if (err) {
        console.error(err);
        return res.status(500).send(err);
      } else {
        var msg = `File(s) were succesfully uploaded: ${results}`;
        console.log(msg);
        return res.status(200).send(msg);
      }
    }
  );
});

// Handles any requests that don't match the ones above
app.get('*', (req, res) =>{
  res.sendFile(path.join(__dirname + './frontend/index.html'));
});

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

app.listen(STREAMER_UI_PORT, STREAMER_UI_HOST);
console.log(`Running on http://${STREAMER_UI_HOST}:${STREAMER_UI_PORT}`);

module.exports = app;
