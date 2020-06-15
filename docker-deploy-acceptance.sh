#!/bin/bash

# export variables defined in env.sh
set -a && source env.sh && set +a

# list secrets, secrets will be set via Jenkinsfile in acceptance
for f in "ls $STREAMER_SECRETS_DIR"; do
    echo $f
done

docker stack up -c docker-compose.yml -c docker-compose.swarm.yml --prune --with-registry-auth --resolve-image always streamer4user