const multer = require("multer");
const fs = require("fs");
const createError = require("http-errors");

const utils = require('./utils');

// Storing file to disk configuration
const streamerUIBufferStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const projectNumber = req.body.projectNumber;
        const subjectLabel = req.body.subjectLabel;
        const sessionLabel = req.body.sessionLabel;
        const dataType = req.body.dataType;

        if (!projectNumber) {
            const err = new Error("projectNumber empty");
            cb(err, null);
        }
        if (!subjectLabel) {
            const err = new Error("subjectLabel empty");
            cb(err, null);
        }
        if (!sessionLabel) {
            const err = new Error("sessionLabel empty");
            cb(err, null);
        }
        if (!dataType) {
            const err = new Error("dataType empty");
            cb(err, null);
        }

        // Obtain the destination folder name
        const dirname = utils.getStreamerUIBufferDirname(
            req.app.locals.STREAMER_UI_BUFFER_DIR,
            projectNumber, subjectLabel, sessionLabel, dataType
        );
        if (!dirname) {
            const err = new Error("Error obtaining streamer buffer UI directory name");
            cb(err, null);
        }

        // Check if the destination folder exists. Must have been created earlier with upload session begin request.
        if (!fs.existsSync(dirname)) {
            const err = new Error("Destination folder in streamer buffer UI does not exist");
            cb(err, null);
        }

        cb(null, dirname);
    },
    filename: (req, file, cb) => {
        // Obtain the (base) filename from the request body
        const filename = req.body.filename;
        if (!filename) {
            const err = new Error("filename empty");
            cb(err, null);
        }

        cb(null, filename);
    }
});

// Handle multipart form data with single file with fieldname validatefile
var _processValidateFile = function(req, res, next) {
    // Do not store the file to disk
    const upload = multer().single('validatefile');

    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return next(createError(400, `Multer error: ${err.message}`));
        } else if (err) {
            return next(createError(400, `processValidateFile error: ${err.message}`));
        }

        next();
    });
}

// Handle multipart form data with single file with fieldname addfile
var _processAddFile = function(req, res, next) {
    // Store the file in the streamer buffer UI dir
    const upload = multer({
        storage: streamerUIBufferStorage
    }).single('addfile');

    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return next(createError(400, `Multer error: ${err.message}`));
        } else if (err) {
            return next(createError(400, `processAddFile error: ${err.message}`));
        }

        next();
    });
}

module.exports.processValidateFile = _processValidateFile;
module.exports.processAddFile = _processAddFile;
