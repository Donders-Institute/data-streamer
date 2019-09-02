const createError = require("http-errors");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const fs = require("fs");

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

HOST = process.env.HOST || "localhost";
PORT = process.env.PORT || 9000;

// given the req.files.files, derive the number of uploaded files
function get_num_files(files) {
  if (files[0]) {
    return files.length;
  } else {
    return 1;
  }
}

app.post("/upload", function(req, res) {
  // Check for structure
  if (!req.body) {
    return res.status(400).send(`No attributes were uploaded: "req.body" is empty`);
  }
  projectNumber = req.body.projectNumber;
  subjectLabel = req.body.subjectLabel;
  sessionLabel = req.body.projectNumber;
  dataType = req.body.dataType;

  // Check for uploaded files
  if (!req.files) {
    return res.status(400).send(`No files were uploaded: "req.files" is empty`);
  }
  if (!req.files.files) {
    return res
      .status(400)
      .send(`No files were uploaded: "req.files.files" is empty`);
  }
  num_files = get_num_files(req.files.files);
  if (num_files === 0) {
    return res
      .status(400)
      .send(`No files were uploaded: file list is empty in request`);
  } else if (num_files === 1) {
    // Move one file
    file = req.files.files;

    // fs.copyFile("source.txt", "destination.txt", err => {
    //   if (err) throw err;
    //   console.log("source.txt was copied to destination.txt");
    // });

    res.status(200).send(`File was succesfully uploaded: "${file.name}"`);
  } else {
    // Move multiple files 1-by-1
    var fileList = [];
    for (var i = 0; i < num_files; i++) {
      file = req.files.files[i];
      fileList.push('"' + file.name + '"');

      // fs.copyFile("source.txt", "destination.txt", err => {
      //   if (err) throw err;
      //   console.log("source.txt was copied to destination.txt");
      // });
    }

    fileListString = "[" + fileList.join(", ") + "]";
    res.status(200).send(`Files were succesfully uploaded: ${fileListString}`);
  }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
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
