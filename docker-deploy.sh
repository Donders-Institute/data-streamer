#!/bin/bash

# export variables defined in env.sh
set -a && source env.sh && set +a

# add secrets, file and secret name will be identical
for f in `ls $STREAMER_SECRETS_DIR`; do
    docker secret ls -f name=$f --format "{{.Name}}" | grep $f >/dev/null 2>&1
    if [ $? -eq 0 ]; then
        # secret with the same name exists, remove it
        docker secret rm $f
    fi
    # create new secret
    docker secret create $f secrets/$f
done

docker stack up -c docker-compose.yml -c docker-compose.swarm.yml --with-registry-auth streamer4user