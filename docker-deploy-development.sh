
#!/bin/bash

# export variables defined in env-development.sh
set -a && source env-development.sh && set +a && docker stack up -c docker-compose.yml -c docker-compose.swarm.yml --prune --with-registry-auth --resolve-image always streamer4user