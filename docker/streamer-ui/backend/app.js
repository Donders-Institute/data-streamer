const createError = require("http-errors");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const fs = require("fs");
const mkdirp = require('mkdirp');
const request = require('request');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());

const HOST = process.env.HOST || "localhost";
const PORT = process.env.PORT || 9000;
const STREAMER_BUFFER_DIR = process.env.STREAMER_BUFFER_DIR || __dirname + '/uploads';
const STREAMER_HOST =  process.env.STREAMER_HOST || "localhost";
const STREAMER_PORT =  process.env.STREAMER_PORT || 3001;

// Given the req.files.files, derive the number of uploaded files
function get_num_files(files) {
  if (files[0]) {
    return files.length;
  } else {
    return 1;
  }
}

// Store the file
function store_file(dirname, file) {
  var err;
  target_path = path.join(dirname, file.name);
  file.mv(target_path, function(err) {
    if (err) return err;
  });
  return err;
}

// Get the directory name
function get_dirname(projectNumber, subjectLabel, sessionLabel, dataType) {
  var err;
  var dirname;
  if (projectNumber && subjectLabel && sessionLabel && dataType) {
      var subject = 'sub-' + subjectLabel;
      var session = 'ses-' + sessionLabel;
      dirname = path.join(STREAMER_BUFFER_DIR, 'project', projectNumber, subject, session, dataType);
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
    url = `http://${STREAMER_HOST}:${STREAMER_PORT}/user/${dataType}/${projectNumber}/${subject}/${session}`;
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
  num_files = get_num_files(req.files.files);

  if (num_files === 0) {
    var msg = `No files were uploaded: file list is empty in request`;
    console.error(msg);
    return res.status(400).send(msg);

  } else if (num_files === 1) {
    // Move one file
    file = req.files.files;
    var err = store_file(dirname, file);
    if (err) {
      console.error(err);
      return res.status(500).send(err);
    } 
    var msg = `File was succesfully uploaded: "${file.name}"`;
    console.log(msg);
    res.status(200).send(msg);

  } else {
    // Move multiple files 1-by-1
    var fileList = [];
    for (var i = 0; i < num_files; i++) {
      file = req.files.files[i];
      fileList.push('"' + file.name + '"');
      var err = store_file(dirname, file);
      if (err) {
        console.error(err);
        return res.status(500).send(err);
      }
    }
    fileListString = "[" + fileList.join(", ") + "]";
    var msg = `Files were succesfully uploaded: ${fileListString}`;
    console.log(msg);
    res.status(200).send(msg);
  }

  // Send a POST request to the streamer
  var [err, streamerURL] = get_streamer_url(projectNumber, subjectLabel, sessionLabel, dataType);
  if (err) {
    console.error(err);
    return res.status(500).send(err);
  }
  if (!streamerURL) {
    var msg = 'Error creating streamer URL';
    console.error(msg);
    return res.status(500).send(msg);
  }
  request.post(streamerURL, {json: {}}, (err, res, body) => {
    console.log(streamerURL);
    if (err) {
        console.error(err);
    }
    console.log('statusCode:', res && res.statusCode)
    console.log('body:', body); 
  })

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

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);

module.exports = app;
