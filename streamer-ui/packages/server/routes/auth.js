const createError = require("http-errors");

/**
 * Middleware to verify session authentication status
 *
 * When using the OIDC, we expect a valid `req.user` in
 * an authenticated session.
 * 
 */
const _isAuthenticated = function(req, res, next) {
    if (req.user && req.user.validUntil > (Date.now()/1000)) {
        return next();
    }
    res.status(401).json({
        data: null,
        error: new Error("Unauthorized")
    });
}

// Middleware to verify admin credentials via authorization header
var _verifyAdminCredentials = function(req, _, next) {
    try {
        const adminUsername = req.app.locals.STREAMER_UI_DB_USER;
        const adminPassword = req.app.locals.STREAMER_UI_DB_PASSWORD;
    
        if ( ! req.headers.authorization ) throw new Error("no admin user credentials");
    
        const base64Credentials = req.headers.authorization.split(' ')[1];
        const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
        idx = credentials.indexOf(':');
        const username = credentials.substring(0,idx);
        const password = credentials.substring(idx+1, credentials.length);
    
        if (username !== adminUsername || password !== adminPassword) {
            throw new Error("Invalid admin user credentials");
        }
        next();
    } catch(err) {
        next(createError(401, err));
    }
}

module.exports.isAuthenticated = _isAuthenticated;
module.exports.verifyAdminCredentials = _verifyAdminCredentials;
