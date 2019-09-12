#!/bin/bash

if [ $# -eq 0 ]; then
    echo "starting streamer db and service ..."
    docker-compose -f docker-compose.yml -f docker-compose.test.yml up service db
else
    echo "starting streamer db, service and ui ..."
    docker-compose -f docker-compose.yml -f docker-compose.test.yml up
fi
