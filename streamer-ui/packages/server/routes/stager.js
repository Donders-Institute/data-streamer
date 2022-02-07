const https = require("https");
const { basicAuthString, fetchOnce } = require("./utils");

// Obtain the DAC namespace via the stager interface with the provided projectId
var _getDac = function(req, res, next) {

    var projectId = req.params.projectId;

    if (!projectId) {
        return next(createError(400, `"projectId" is empty`));
    }

    // load the up-to-date configuration
    var config = require(path.join(__dirname + '/../config/streamer-service-config.json'));
    delete require.cache[require.resolve(__dirname + '../config/streamer-service-config.json')];

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
        1000 * 30,   // timeout for 30 seconds
    ).then((result) => {
        console.debug("DAC of project ", projectId, ": ", result);
        var data = JSON.parse(result);
        if ( data.collName ) {
            return res.status(200).json({
                collName: data.collName,
            });
        } else {
            console.error("cannot get DAC of project ", projectId, ": invalid data ", data);
            next(createError(404));
        }
    }).catch((reason) => {
        console.error("cannot get DAC of project ", projectId, ": ", reason);
        next(createError(404));
    });
}

module.exports.getDac = _getDac