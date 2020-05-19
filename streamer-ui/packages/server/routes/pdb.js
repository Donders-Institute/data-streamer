import { createConnection } from "mysql";
import { join } from "path";
import createError from "http-errors";

const config = require(join(__dirname + '/../config/streamer-ui-config.json'));
const PROJECT_DATABASE_HOST = config.projectDatabase.host;
const PROJECT_DATABASE_PORT = config.projectDatabase.port;
const PROJECT_DATABASE_USERNAME = config.projectDatabase.username;
const PROJECT_DATABASE_PASSWORD = config.projectDatabase.password;
const PROJECT_DATABASE_DATABASE_NAME = config.projectDatabase.databaseName;

// Obtain list of user projects from Project Database
export function getProjects(req, res, next) {
    // Obtain username
    const base64Credentials = req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    var username = credentials.split(':')[0];

    // Create SQL statement
    const sql = `SELECT project FROM acls WHERE user="${username}" AND projectRole IN ('contributor', 'manager');`

    var con = createConnection({
        host: PROJECT_DATABASE_HOST,
        port: PROJECT_DATABASE_PORT,
        user: PROJECT_DATABASE_USERNAME,
        password: PROJECT_DATABASE_PASSWORD,
        database: PROJECT_DATABASE_DATABASE_NAME
    });

    con.connect(function (err) {
        if (err) {
            return next(createError(500, err.message));
        }
        con.query(sql, function (err, results) {
            if (err) {
                con.end();
                return next(createError(500, err.messsage));
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
