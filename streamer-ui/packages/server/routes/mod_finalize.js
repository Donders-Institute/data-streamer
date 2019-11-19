const db = require('./db');

var _finalize = async function (req, res) {

    var msg = "";
    var endTime = new Date();
    var updateUploadSessionResult;

    // Check for basic auth header
    if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
        msg = 'Missing Authorization Header'
        console.log(msg);
        return res.status(401).json({ "error": msg });
    }

    // Verify auth credentials
    const base64Credentials = req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const dccnUsername = credentials.split(':')[0];

    // Check for structure
    if (!req.body) {
        msg = `No attributes were uploaded: "req.body" is empty`
        return res.status(400).json({ "error": msg });
    }

    var uploadSessionId = req.body.uploadSessionId;
    if (!uploadSessionId) {
        msg = `uploadSessionId is empty`;
        console.log(msg);
        return res.status(400).json({ "error": msg });
    }

    // Update a row in the ui database
    try {
        updateUploadSessionResult = await db.updateUploadSession(uploadSessionId, endTime);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ "error": error });
    }

    // Return the result
    console.log(dccnUsername);
    console.log(JSON.stringify(updateUploadSessionResult));
    return res.status(200).json({ "data": updateUploadSessionResult });
}

module.exports.finalize = _finalize;
