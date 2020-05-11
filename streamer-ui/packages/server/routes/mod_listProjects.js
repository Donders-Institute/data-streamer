const mysql = require('mysql');
const path = require("path");

const config = require(path.join(__dirname + '/../config/streamer-ui-config.json'));
const PROJECT_DATABASE_HOST = config.projectDatabase.host;
const PROJECT_DATABASE_PORT = config.projectDatabase.port;
const PROJECT_DATABASE_USERNAME = config.projectDatabase.username;
const PROJECT_DATABASE_PASSWORD = config.projectDatabase.password;
const PROJECT_DATABASE_DATABASE_NAME = config.projectDatabase.databaseName;

async function _getListProjects(req, res) {
    // Obtain username
    const base64Credentials = req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    var username = credentials.split(':')[0];

    // Create SQL statement
    const sql = `SELECT project FROM acls WHERE user="${username}" AND projectRole IN ('contributor', 'manager');`

    var con = mysql.createConnection({
        host: PROJECT_DATABASE_HOST,
        port: PROJECT_DATABASE_PORT,
        user: PROJECT_DATABASE_USERNAME,
        password: PROJECT_DATABASE_PASSWORD,
        database: PROJECT_DATABASE_DATABASE_NAME
    });

    con.connect(function (err) {
        if (err) {
            console.error(err);
            return res.status(500).json({
                data: null,
                error: err
            });
        }
        con.query(sql, function (err, results) {
            if (err) {
                con.end();
                console.error(err);
                return res.status(500).json({
                    data: null,
                    error: err
                });
            } else {
                con.end();
                // Success
                console.log(JSON.stringify(results));
                return res.status(200).json({
                    data: results,
                    error: null
                });
            }
        });
    });
}

module.exports.getListProjects = _getListProjects;
