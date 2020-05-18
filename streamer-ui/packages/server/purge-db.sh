#!/bin/bash

credentials=$STREAMER_UI_DB_USER:$STREAMER_UI_DB_PASSWORD
url=http://$STREAMER_UI_HOST:$STREAMER_UI_PORT

echo "Purge streamer ui db ..."
curl -X POST -u $credentials -i -H 'Content-Type: application/json' $url