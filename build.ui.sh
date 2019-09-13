#!/bin/bash

echo "building streamer ui container ..."
docker-compose -f docker-compose.ui.yml build --force-rm
