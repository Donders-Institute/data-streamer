#!/bin/bash

# export variables defined in env.sh
set -a && source env.sh && set +a

docker stack up -c docker-compose.yml -c docker-compose.stager.yml -c docker-compose.swarm.yml --with-registry-auth lab-data-streamer