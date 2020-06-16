const createError = require("http-errors");

// Middleware to verify Content-Type 'application/json' in header
var _hasJson = function(req, res, next) {
    const contentType = req.get('Content-Type');
    if (!contentType.startsWith('application/json')) {
        return next(createError(400, "Invalid Content-Type"));
    }

    next();
}

module.exports.hasJson = _hasJson;
