#!/bin/bash

echo "starting streamer ui ..."
set -a && source env.sh && set +a && docker-compose -f docker-compose.ui.yml -f docker-compose.ui.test.yml up