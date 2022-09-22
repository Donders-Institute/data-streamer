#!/bin/bash

credentials=$STREAMER_UI_DB_USER:$STREAMER_UI_DB_PASSWORD
url=http://localhost:9000

echo "Purge streamer ui db ..."
echo $url/api/purge
curl -X POST -u $credentials -i -H 'Content-Type: application/json' $url/api/purge