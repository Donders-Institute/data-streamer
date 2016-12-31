# Streamer for lab dataflow

This package implements a data streamer service allowing user/service on a scanner
console to trigger an automatic dataflow to the project storage and RDM collections.

It is firstly implemented for the MRI and MEG labs at DCCN.

## Introduction

The service consists of two components, the redis database and the streamer server.
The two components are dockerised, and orchestrated with the docker-compose.

The streamer server is implemented as a NodeJS web application based on the express framework.

## Build and run the service

- prepare the `config` directory, and copy the example from `docker/streamer/config/default.conf`
- in the directory of `docker`, run `docker-compose build --force-rm`
- run the script `docker/redis/docker_host_config.sh` to adjust host's kernel parameter, for the performance of the redis database.
- start up the service by `docker-compose run -d`

## Submit streamer job (an example of MEG)

The following cURL command shows how to trigger a dataflow concerning data in the directory
`/ctfmeg/odin/data/meg/ACQ_Data/20161121/` on the MEG console.

```
$ curl -X POST -u admin http://{streamer_hostname}:3001/meg/20161121
```

Note that the prefix `/ctfmeg/odin/data/meg/ACQ_Data/` is skipped as it is already provided in
the configuration file as the value `MEG.consoleDataDirRoot`.

## Submit streamer job (an example of MRI)

The streamer job for MRI is provided in the basis of a DICOM series. Normally, it is called by the Orthanc PACS server when a series is considered as "stable" (i.e. the series is considered as stable if the Orthanc server doesn't receive any update on it for one hour).

The following curl command activates the data flow on a DICOM series identified by the Orthanc server as `1f3df579-b58352b8-923b6bd9-e44aefa4-21581e31`.

```
$ curl -X POST -u admin http://{streamer_hostname}:3001/mri/series/1f3df579-b58352b8-923b6bd9-e44aefa4-21581e31
```

## Extending the service for other modality

The modality plugin is located in the `docker/streamer/lib` directory, and it should be named as `modality<MODALITY_TYPE>.js`.  The `<MODALITY_TYPE>` should also be reflected in the configuration file `docker/streamer/config/default.json`.

The modality plugin is required to export two functions and one JSON object.

The JSON object should be exported as `restPaths`.  It defines the RESTful interface for creating a new streamer job.

```javascript
var restPaths = {
    'postJob': '/:date/:ds?'
};
module.exports.restPaths = restPaths;
```

The two required functions are:

- `createStreamerJob`: function to convert RESTful request into streamer job
- `execStreamerJob`: function to process the streamer job

An example for a modality of type `TEST` is given as `modalityTEST.js`.

To make use of the modality plugin, one should define it in a streamer's configuration file (`docker/streamer/config/default.json`) under the `Modalities` sector.  Define a unique modality name as a `key` in the `Modailities` sector, and the corresponding `value` containing at-least an attribute called `type` referring to the plugin.  When the streamer is started, it will create a new REST interface prefixed with the modality name for creating a streamer job to be processed by the specific plugin.

The following example creates a new modality called `myTest`, using the `modalityTEST.js` as the plugin:

```javascript
{
    ...
    "Modalities": {
        "myTest": {
            "type": "TEST"
        }
    }
}
```

and the following REST interface for creating new job to be processed by the `modalityTEST.js` plugin:

- `http://<streamer_host>:<streamer_port>/myTest/:date/:ds?`

where the part `/:date/:ds?` is defined by the JSON object `restPaths` exported by the plugin.
