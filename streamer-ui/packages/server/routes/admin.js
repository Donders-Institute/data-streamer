const db = require('./db');
const createError = require("http-errors");

// Purge the database tables (admin user only)
var _purge = async function (req, res, next) {
    let cleanTablesResult;
    try {
        cleanTablesResult = await db.cleanTables();
    } catch (err) {
        return next(createError(500, err.message));
    }

    console.log(JSON.stringify(cleanTablesResult));
    res.status(200).json({
        data: cleanTablesResult,
        error: null
    });
}

module.exports.purge = _purge;
