#!/bin/bash

if [ -z "$1" ]; then
    echo "No URL supplied"
    exit 1
fi

echo "cleaning streamer ui db ..."
set -a && source env.sh && set +a && curl -u $STREAMER_UI_DB_USER:$STREAMER_UI_DB_PASSWORD -i -H 'Accept:application/json' $1/clean