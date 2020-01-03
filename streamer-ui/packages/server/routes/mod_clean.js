const db = require('./db');

const STREAMER_UI_DB_USER = process.env.STREAMER_UI_DB_USER || "user";
const STREAMER_UI_DB_PASSWORD = process.env.STREAMER_UI_DB_PASSWORD || "password";

var _clean = async function (req, res) {

    var msg = "";
    var username = "";
    var password = "";
    var cleanTablesResult;

    // Check for basic auth header
    if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
        msg = 'Missing Authorization Header'
        console.log(msg);
        return res.status(401).json({ "error": msg });
    }

    // Verify auth credentials
    const base64Credentials = req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    [username, password] = credentials.split(':');

    if (username === STREAMER_UI_DB_USER && password === STREAMER_UI_DB_PASSWORD) {
        // Clean all tables in the database
        try {
            cleanTablesResult = await db.cleanTables();
        } catch (error) {
            console.error(error);
            return res.status(500).json({ "error": error });
        }
        console.log(JSON.stringify(cleanTablesResult));
        return res.status(200).json({ "data": cleanTablesResult });
    } else {
        msg = "Invalid username or password.";
        console.log(msg);
        res.status(401).json({ "error": msg });
        return;
    }
}

module.exports.clean = _clean;
