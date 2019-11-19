#!/bin/bash

echo "building streamer ui container ..."
set -a && source env.sh && set +a && docker-compose -f docker-compose.ui.yml build --force-rm