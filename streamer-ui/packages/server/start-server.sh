#!/bin/bash

cd /opt/streamer-ui-server

env
ls -l /run/secrets

# Check and copy configuration files from secrets
if [ -f $STREAMER_SERVICE_CONFIG ]; then
    cp $STREAMER_SERVICE_CONFIG config/streamer-service-config.json
fi

if [ -f $STREAMER_UI_CONFIG ]; then
    cp $STREAMER_UI_CONFIG config/streamer-ui-config.json
fi

ls -l config

node server.js
