#!/bin/bash

[ $# -lt 1 ] && echo "missing Docker stack name" >&2 && exit 1

# export variables defined in env.sh
set -a && source env.sh && set +a

docker stack up -c docker-compose.yml -c docker-compose.stager.yml -c docker-compose.swarm.yml --prune --with-registry-auth --resolve-image always "$1"