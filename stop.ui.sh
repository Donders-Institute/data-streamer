#!/bin/bash

echo "stopping streamer ui ..."
docker-compose -f docker-compose.ui.yml -f docker-compose.ui.test.yml down
