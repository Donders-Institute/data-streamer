#!/bin/bash

cd /opt/streamer

# check and copy configuration files from secrets
if [ -f $STREAMER_SERVICE_CONFIG ]; then
    cp $STREAMER_SERVICE_CONFIG config/default.json
fi

if [ -f $STREAMER_MAILER_CONFIG ]; then
    cp $STREAMER_MAILER_CONFIG config/mailer.json
fi

/opt/nodejs/bin/node --expose-gc --max-old-space-size=2048 streamer.js
