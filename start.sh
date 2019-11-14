#!/bin/bash

if [ $# -gt 1 ]; then
    echo "starting streamer $@ ..."
    set -a && source env.sh && set +a && docker-compose -f docker-compose.yml -f docker-compose.test.yml up $@
else
    echo "starting streamer db, service and ui ..."
    set -a && source env.sh && set +a && docker-compose -f docker-compose.yml -f docker-compose.test.yml up
fi