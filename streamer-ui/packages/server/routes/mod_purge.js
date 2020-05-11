const db = require('./db');

// Purge the database tables (admin user only)
async function _purge(req, res) {
    let cleanTablesResult;

    try {
        cleanTablesResult = await db.cleanTables();
    } catch (err) {
        console.error(err);
        return res.status(500).json({ data: null, error: err });
    }

    console.log(JSON.stringify(cleanTablesResult));
    return res.status(200).json({ data: cleanTablesResult, error: null });
}

module.exports.purge = _purge;
