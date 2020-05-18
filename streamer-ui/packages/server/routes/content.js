const createError = require("http-errors");

// Middleware to verify Content-Type 'application/json'
var _hasJson = function (req, res, next) {
    if (!req.is('application/json')) {
        return next(createError(400, "Invalid Content-Type"));
    }

    next();
}

// Middleware to verify file contents in the multipare/form-data (after multer middleware)
var _hasFile = function (req, res, next) {
    if (!req.file) {
        return next(createError(400, `No file: "req.file" is empty`));
    }

    next();
}

module.exports.hasJson = _hasJson;
module.exports.hasFile = _hasFile;
