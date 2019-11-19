#!/bin/bash

echo "stopping streamer ui ..."
set -a && source env.sh && set +a && docker-compose -f docker-compose.ui.yml -f docker-compose.ui.test.yml down