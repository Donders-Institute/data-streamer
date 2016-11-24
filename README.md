# Streamer for MEG dataflow

This package implements a data streamer service allowing user/service on a scanner
console to trigger an automatic dataflow to the project storage and RDM collections.

It is firstly implemented for the MEG lab at DCCN.

## Introduction

The service consists of two components, the redis database and the streamer server.
The two components are dockerised, and orchestrated with the docker-compose.

The streamer server is implemented as a NodeJS web application based on the express framework.

## Build and run the service

- prepare the `config` directory, and copy the example from `docker/streamer/config/default.conf`
- in the directory of `docker`, run `docker-compose build --force-rm`
- start up the service by `docker-compose run -d`

## Submit streamer job

The following cURL command shows how to trigger a dataflow concerning data in the directory
`/ctfmeg/odin/data/meg/ACQ_Data/20161121/` on the MEG console.

```
$ curl -X POST -u admin http://{streamer_hostname}:3001/meg/20161121
```

Note that the prefix `/ctfmeg/odin/data/meg/ACQ_Data/` is skipped as it is already provided in
the configuration file as the value `MEG.consoleDataDirRoot`.

## Extending the service for other modality

The modality plugin is located in the `docker/streamer/lib` directory.
For each modality plugin, two functions need to be exported. They are:

- `createStreamerJob`: function to convert RESTful request into streamer job
- `execStreamerJob`: function to process the streamer job

A code example for a TEST modality is given by `modalityTEST.js`.

Furthermore, the plugin needs to be included and used in the main program `docker/streamer/streamer.js`.
For example,

```
var m_test = require('./lib/modalityTEST');
...
app.post('/test/:date/:ds?', m_test.createStreamerJob(queue));
```
