const { Client } = require('pg');

const STREAMER_UI_DB_HOST = process.env.STREAMER_UI_DB_HOST || "ui-db";
const STREAMER_UI_DB_PORT = process.env.STREAMER_UI_DB_PORT || 5432;
const STREAMER_UI_DB_USER = process.env.STREAMER_UI_DB_USER || "postgres";
const STREAMER_UI_DB_PASSWORD = process.env.STREAMER_UI_DB_PASSWORD || "postgres";
const STREAMER_UI_DB_NAME = process.env.STREAMER_UI_DB_NAME || "postgres";

async function connect() {
    const client = new Client({
        user: STREAMER_UI_DB_USER,
        host: STREAMER_UI_DB_HOST,
        database: STREAMER_UI_DB_NAME,
        password: STREAMER_UI_DB_PASSWORD,
        port: STREAMER_UI_DB_PORT,
    })
    try {
        await client.connect();
    } catch (error) {
        throw "Could not connect to database";
    }
    return client;
}

// Start a new upload session: set all columns except end_time
async function _insertUploadSession(username, ipAddress, userAgent, projectNumber, subjectLabel, sessionLabel, dataType, startTime) {
    var client;
    var uploadSessionId;
    try {
        client = await connect()
    } catch (error) {
        throw "Could not connect to database";
    }
    try {
        const result = await client.query(`INSERT INTO uploadsession(username, ip_address, user_agent, project_number, subject_label, session_label, data_type, start_time) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id;`, [username, ipAddress, userAgent, projectNumber, subjectLabel, sessionLabel, dataType, startTime]);
        uploadSessionId = result.rows[0].id;
    } catch (error) {
        throw "Could not insert row to database table uploadsession";
    }
    try {
        await client.end();
    } catch (error) {
        throw "Could not disconnect database";
    }

    const insertUploadSessionResult = {
        "uploadSessionId": uploadSessionId,
        "username": username,
        "ipAddress": ipAddress,
        "projectNumber": projectNumber,
        "subjectLabel": subjectLabel,
        "sessionLabel": sessionLabel,
        "dataType": dataType,
        "startTime": startTime
    }
    return insertUploadSessionResult;
}

// Add an upload file
async function _insertUploadFile(uploadSessionId, filename, filesizeBytes) {
    var client;
    var uploadFileId;

    try {
        client = await connect()
    } catch (error) {
        throw "Could not connect to database";
    }

    try {
        const result = await client.query(`INSERT INTO uploadfile(filename, filesize_bytes, upload_session_id) VALUES($1, $2, $3) RETURNING id;`, [filename, filesizeBytes, uploadSessionId]);
        uploadFileId = result.rows[0].id;
    } catch (error) {
        throw "Could not insert row to database table uploadfile";
    }

    try {
        await client.end();
    } catch (error) {
        throw "Could not disconnect database";
    }

    const insertUploadFileResult = {
        "uploadFileId": uploadFileId,
    }
    return insertUploadFileResult;
}

// End the upload session: set end_time
async function _updateUploadSession(uploadSessionId, endTime) {
    var client;

    try {
        client = await connect()
    } catch (error) {
        throw "Could not connect to database";
    }

    try {
        const result = await client.query(`UPDATE uploadsession SET end_time=($1) WHERE id=($2);`, [endTime, uploadSessionId]);
        if (result.rowCount === 0) {
            throw `uploadSessionId ${uploadSessionId} not found`;
        }
    } catch (error) {
        throw `Could not update row in database table uploadsession: ${error}`;
    }

    try {
        await client.end();
    } catch (error) {
        throw "Could not disconnect database";
    }

    const updateUploadSessionResult = {
        "uploadSessionId": uploadSessionId,
        "endTime": endTime
    }
    return updateUploadSessionResult;
}

// Obtain the list of upload files
async function _getUploadFileList(uploadSessionId) {
    var client;
    var files = [];
    var result;

    try {
        client = await connect()
    } catch (error) {
        throw "Could not connect to database";
    }

    try {
        result = await client.query(`SELECT filename FROM uploadfile WHERE upload_session_id=($1);`, [uploadSessionId]);
    } catch (error) {
        throw "Could not get rows of database table uploadfile";
    }
    if (result) {
        const data = result.rows;
        if (data) {
            data.forEach(row => {
                files.push(row.filename);
            });
        }
    }

    try {
        await client.end();
    } catch (error) {
        throw "Could not disconnect database";
    }

    const getUploadFileListResult = {
        "uploadSessionId": uploadSessionId,
        "files": files
    }
    return getUploadFileListResult;
}


// Delete all rows in uploadsession table and 
async function _cleanTables() {
    var client;
    try {
        client = await connect()
    } catch (error) {
        throw "Could not connect to database";
    }
    try {
        await client.query(`TRUNCATE TABLE uploadsession, uploadfile`);
    } catch (error) {
        throw "Could not truncate tables uploadsession and/or uploadfile";
    }
    try {
        await client.end();
    } catch (error) {
        throw "Could not disconnect database";
    }

    const cleanTablesResult = {
        "status": "cleaned"
    }
    return cleanTablesResult;
}

module.exports.insertUploadSession = _insertUploadSession;
module.exports.insertUploadFile = _insertUploadFile;
module.exports.updateUploadSession = _updateUploadSession;
module.exports.getUploadFileList = _getUploadFileList;
module.exports.cleanTables = _cleanTables;
