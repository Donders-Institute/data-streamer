const multer = require("multer");
const createError = require("http-errors");

// Handle multipart form data with single file with fieldname validatefile
var _processValidateFile = function (req, res, next) {
    const upload = multer().single('validatefile');

    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return next(createError(400, `Multer error: ${err.message}`));
        } else if (err) {
            return next(createError(400, "Unknown error"));
        }

        next();
    });
}

// Handle multipart form data with single file with fieldname addfile
var _processAddFile = function (req, res, next) {
    const upload = multer().single('addfile');

    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return next(createError(400, `Multer error: ${err.message}`));
        } else if (err) {
            return next(createError(400, "Unknown error"));
        }

        next();
    });
}

module.exports.processValidateFile = _processValidateFile;
module.exports.processAddFile = _processAddFile;

