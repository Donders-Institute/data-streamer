#!/bin/bash

echo "starting streamer ui ..."
docker-compose -f docker-compose.ui.yml -f docker-compose.ui.test.yml up
