const mysql = require('mysql');
const path = require("path");

const config = require(path.join(__dirname + '/../config/streamer-ui-config.json'));
const PROJECT_DATABASE_HOST = config.projectDatabase.host;
const PROJECT_DATABASE_PORT = config.projectDatabase.port;
const PROJECT_DATABASE_USERNAME = config.projectDatabase.username;
const PROJECT_DATABASE_PASSWORD = config.projectDatabase.password;
const PROJECT_DATABASE_DATABASE_NAME = config.projectDatabase.databaseName;

var _getListProjects = async function (req, res) {

    var msg;

    // Check for basic auth header
    if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
        msg = 'Missing Authorization Header'
        return res.status(401).send(msg);
    }

    // Verify auth credentials
    const base64Credentials = req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    var username = credentials.split(':')[0];
    if (!req.body) {
        return res.status(400).send(`No attributes were uploaded: "req.body" is empty`);
    }
    if (req.body.username !== username) {
        msg = 'Basic auth username inconsistent with request body username';
        return res.status(401).send(msg);
    }

    // Create SQL statement
    const sql = `SELECT project FROM acls WHERE user="${username}";`

    var con = mysql.createConnection({
        host: PROJECT_DATABASE_HOST,
        port: PROJECT_DATABASE_PORT,
        user: PROJECT_DATABASE_USERNAME,
        password: PROJECT_DATABASE_PASSWORD,
        database: PROJECT_DATABASE_DATABASE_NAME
    });

    await con.connect(function (err) {
        if (err) {
            console.error(err);
            return res.status(500).json({ "error": err });
        }
    });

    con.query(sql, function (err, results) {
        if (err) {
            con.end();
            console.error(err);
            return res.status(500).json({ "error": err });
        } else {
            con.end();
            console.log(results);
            return res.status(200).json({ "data": results });
        }
    });
}

module.exports.getListProjects = _getListProjects;
