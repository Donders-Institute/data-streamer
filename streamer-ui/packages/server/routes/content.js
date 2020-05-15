const createError = require("http-errors");

// Middleware to verify Content-Type 'application/json'
var _hasJson = function (req, res, next) {
    if (!req.is('application/json')) {
        return next(createError(400, "Invalid Content-Type"));
    }

    next();
}

module.exports.hasJson = _hasJson;
