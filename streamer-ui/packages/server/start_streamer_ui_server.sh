#!/bin/bash

cd /opt/streamer-ui-server

env
# ls -l /run/secrets

# Check and copy configuration files from secrets
if [ -f $STREAMER_UI_CONFIG ]; then
    cp $STREAMER_UI_CONFIG config/streamer-ui-config.json
fi

if [ -f $STREAMER_UI_ADCONFIG ]; then
    cp $STREAMER_UI_ADCONFIG config/streamer-ui-adconfig.json
fi

if [ -f $STREAMER_UI_LDAPSCERT ]; then
    cp $STREAMER_UI_LDAPSCERT config/streamer-ui-ldapscert.crt
fi

ls -l config

node streamer_ui_server.js
