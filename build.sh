#!/bin/bash

# build db and service containers
echo "building streamer db, service and ui containers ..."
set -a && source env.sh && set +a && docker-compose -f docker-compose.yml -f docker-compose.override.yml build --force-rm