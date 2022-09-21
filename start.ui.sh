#!/bin/bash

echo "starting streamer ui db ..."
set -a && source env.sh && set +a && docker-compose -f docker-compose.yml -f docker-compose.override.yml up ui-db ui