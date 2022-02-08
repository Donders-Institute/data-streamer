const createError = require("http-errors");
const path = require("path");
const { basicAuthString, fetchOnce } = require("./utils");
const fetch = require("node-fetch");

// location of the streamer-service-config.json file.
const fconfig = path.join(__dirname, '../config/streamer-service-config.json');

// Obtain the DAC namespace via the stager interface with the provided projectId
var _getDac = async function(req, res, next) {

    var projectId = req.params.projectId;

    if (!projectId) {
        return next(createError(400, `"projectId" is empty`));
    }

    // load the up-to-date configuration
    var config = require(fconfig);
    delete require.cache[require.resolve(fconfig)];

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': basicAuthString(config.DataStager.username, config.DataStager.password),
    };

    fetchOnce(
        config.DataStager.url + "/rdm/DAC/project/" + projectId,
        {
            method: 'GET',
            credentials: 'include',
            headers,
        },
        1000 * 30,  // timeout after 30 seconds
    ).then((response) => {
        console.debug("DAC of project ", projectId, ": ", response.collName);
        if ( response.collName ) {
            res.json({
                data: response,
                error: null,
            });
        } else {
            throw new Error("invalid stager response data: ", response);
        }
    }).catch((reason) => {
        console.error("cannot get DAC of project ", projectId, ": ", reason);
        next(createError(404));
    });
}

module.exports.getDac = _getDac