#!/bin/bash

echo "stopping streamer ui ..."
set -a && source env.sh && set +a && docker-compose -f docker-compose.yml -f docker-compose.override.yml down