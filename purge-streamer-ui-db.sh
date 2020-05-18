#!/bin/bash

if [ -z "$1" ]; then
    echo "No URL supplied"
    exit 1
fi

echo "Purge streamer ui db ..."
set -a && source env.sh && set +a && curl -X POST -u $STREAMER_UI_DB_USER:$STREAMER_UI_DB_PASSWORD -i -H 'Content-Type: application/json' $1/purge
