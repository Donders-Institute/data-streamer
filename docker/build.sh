#!/bin/bash

# build db and service containers
echo "building streamer db, service and ui containers ..."
docker-compose -f docker-compose.yml build --force-rm
