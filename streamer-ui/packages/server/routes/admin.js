const createError = require("http-errors");

const db = require('./db');

// Purge the database tables (admin user only)
var _purge = async function purge(req, res, next) {

    // Obtain streamer UI database configuration
    const STREAMER_UI_DB_HOST = req.app.locals.STREAMER_UI_DB_HOST;
    const STREAMER_UI_DB_PORT = req.app.locals.STREAMER_UI_DB_PORT;
    const STREAMER_UI_DB_USER = req.app.locals.STREAMER_UI_DB_USER;
    const STREAMER_UI_DB_PASSWORD = req.app.locals.STREAMER_UI_DB_PASSWORD;
    const STREAMER_UI_DB_NAME = req.app.locals.STREAMER_UI_DB_NAME;

    // Purge all database tables
    let purgeResult;
    try {
        purgeResult = await db.purgeTables(
            STREAMER_UI_DB_HOST,
            STREAMER_UI_DB_PORT,
            STREAMER_UI_DB_USER,
            STREAMER_UI_DB_PASSWORD,
            STREAMER_UI_DB_NAME);
    } catch (err) {
        return next(createError(500, err.message));
    }

    console.log(JSON.stringify(purgeResult));
    res.status(200).json({
        data: purgeResult,
        error: null
    });
}

module.exports.purge = _purge;
