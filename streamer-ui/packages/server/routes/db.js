const { Client } = require('pg');

// Connect to streamer UI database 
async function connect(dbHost, dbPort, dbUsername, dbPassword, dbName) {
    console.log(dbHost, dbPort, dbUsername, dbPassword, dbName);
    const client = new Client({
        host: dbHost,
        port: dbPort,
        user: dbUsername,
        password: dbPassword,
        database: dbName
    })
    try {
        await client.connect();
    } catch (error) {
        throw "Could not connect to database";
    }
    return client;
}

// Start a new upload session: set all columns except end_time
var _insertUploadSession = async function(
    dbHost, 
    dbPort, 
    dbUsername, 
    dbPassword, 
    dbName,
    username,
    ipAddress,
    userAgent,
    projectNumber,
    subjectLabel,
    sessionLabel,
    dataType,
    startTime
) {
    let client;
    let uploadSessionId;

    console.log("insertUploadSession");
    console.log(
        dbHost, 
        dbPort, 
        dbUsername, 
        dbPassword, 
        dbName,
        username,
        ipAddress,
        userAgent,
        projectNumber,
        subjectLabel,
        sessionLabel,
        dataType,
        startTime);

    try {
        client = await connect(dbHost, dbPort, dbUsername, dbPassword, dbName);
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
        uploadSessionId,
        username,
        ipAddress,
        projectNumber,
        subjectLabel,
        sessionLabel,
        dataType,
        startTime
    }
    return insertUploadSessionResult;
}

// Add an upload file
var _insertUploadFile = async function(
    dbHost, 
    dbPort, 
    dbUsername, 
    dbPassword, 
    dbName,
    uploadSessionId, 
    filename, 
    filesizeBytes
) {
    let client;
    try {
        client = await connect(dbHost, dbPort, dbUsername, dbPassword, dbName);
    } catch (error) {
        throw "Could not connect to database";
    }

    let uploadFileId;
    try {
        const result = await client.query(`INSERT INTO uploadfile(filename, filesize_bytes, upload_session_id) VALUES($1, $2, $3) RETURNING id;`, [filename, filesizeBytes, uploadSessionId]);
        uploadFileId = result.rows[0].id;
    } catch (error) {
        console.error("Could not insert row to database table uploadfile");
        console.error(filename, filesizeBytes, uploadSessionId);
        throw "Could not insert row to database table uploadfile";
    }

    try {
        await client.end();
    } catch (error) {
        throw "Could not disconnect database";
    }

    const insertUploadFileResult = {
        uploadFileId
    };
    return insertUploadFileResult;
}

// End the upload session: set end_time
var _updateUploadSession = async function(
    dbHost, 
    dbPort, 
    dbUsername, 
    dbPassword, 
    dbName,
    uploadSessionId, 
    endTime
) {
    let client;
    try {
        client = await connect(dbHost, dbPort, dbUsername, dbPassword, dbName);
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
        uploadSessionId,
        endTime
    }
    return updateUploadSessionResult;
}

// Obtain the list of upload files
var _getUploadFileList = async function(
    dbHost, 
    dbPort, 
    dbUsername, 
    dbPassword, 
    dbName,
    uploadSessionId
) {
    let client;
    try {
        client = await connect(dbHost, dbPort, dbUsername, dbPassword, dbName);
    } catch (error) {
        throw "Could not connect to database";
    }

    let fileNames = [];
    let result;
    try {
        result = await client.query(`SELECT filename FROM uploadfile WHERE upload_session_id=($1);`, [uploadSessionId]);
    } catch (error) {
        throw "Could not get rows of database table uploadfile";
    }
    if (result) {
        const data = result.rows;
        if (data) {
            data.forEach(row => {
                fileNames.push(row.filename);
            });
        }
    }

    try {
        await client.end();
    } catch (error) {
        throw "Could not disconnect database";
    }

    const getUploadFileListResult = {
        uploadSessionId,
        fileNames
    }
    return getUploadFileListResult;
}

// Delete all rows in uploadsession table and 
var _purgeTables = async function(
    dbHost, 
    dbPort, 
    dbUsername, 
    dbPassword, 
    dbName
) {
    let client;
    try {
        client = await connect(dbHost, dbPort, dbUsername, dbPassword, dbName);
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

    const status = "purged";
    const purgeResult = {
        status
    }
    return purgeResult;
}

module.exports.insertUploadSession = _insertUploadSession;
module.exports.insertUploadFile = _insertUploadFile;
module.exports.updateUploadSession = _updateUploadSession;
module.exports.getUploadFileList = _getUploadFileList;
module.exports.purgeTables = _purgeTables;
