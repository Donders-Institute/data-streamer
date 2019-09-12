#!/bin/bash

if [ $# -gt 1 ]; then
    echo "starting streamer $@ ..."
    docker-compose -f docker-compose.yml -f docker-compose.test.yml up $@
else
    echo "starting streamer db, service and ui ..."
    docker-compose -f docker-compose.yml -f docker-compose.test.yml up
fi