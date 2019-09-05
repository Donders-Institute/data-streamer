#!/bin/bash

# build db and service containers
echo "building streamer db and service ..."
docker-compose -f docker-compose.yml build --force-rm

# build ui container
echo "building streamer ui ..."
docker-compose -f docker-compose.ui.yml build --force-rm
