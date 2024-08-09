#!/bin/bash

echo "# version"
echo "DOCKER_IMAGE_TAG=$DOCKER_IMAGE_TAG"
echo 
echo "# docker registry endpoint"
echo "DOCKER_REGISTRY=$DOCKER_REGISTRY"
echo 
echo "# volume for home directory"
echo "HOME_VOL=$HOME_VOL"
echo
echo "# volume for project directory"
echo "PROJECT_VOL=$PROJECT_VOL"
echo
echo "# volume for project directory on CephFS"
echo "PROJECT_CEPHFS_VOL=$PROJECT_CEPHFS_VOL"
echo 
echo "# volume for streamer job"
echo "STREAMER_DB_DATA_VOL=$STREAMER_DB_DATA_VOL"
echo 
echo "# volume for streamer log"
echo "STREAMER_SERVICE_LOG_VOL=$STREAMER_SERVICE_LOG_VOL"
echo 
echo "# volume in which the streamer crontab is presented"
echo "STREAMER_SERVICE_CRON_VOL=$STREAMER_SERVICE_CRON_VOL"
echo 
echo "# volume in which the streamer ui statistics database initialisation script is presented"
echo "STREAMER_UI_DB_INIT_VOL=$STREAMER_UI_DB_INIT_VOL"
echo 
echo "# volume for streamer ui statistics database"
echo "STREAMER_UI_DB_DATA_VOL=$STREAMER_UI_DB_DATA_VOL"
echo 
echo "# volume in which the streamer ui crontab is presented"
echo "STREAMER_UI_CRON_VOL=$STREAMER_UI_CRON_VOL"
echo
echo "# volume for streamer ui log"
echo "STREAMER_UI_LOG_VOL=$STREAMER_UI_LOG_VOL"
echo
echo "# Configuration files"
echo "STREAMER_SECRETS_DIR=$STREAMER_SECRETS_DIR"
echo "STREAMER_SERVICE_CONFIG=$STREAMER_SERVICE_CONFIG"
echo "STREAMER_MAILER_CONFIG=$STREAMER_MAILER_CONFIG"
echo "STREAMER_UI_CONFIG=$STREAMER_UI_CONFIG"
echo 
echo "# redis database for streamer jobs"
echo "REDIS_HOST=$REDIS_HOST"
echo "REDIS_PORT=$REDIS_PORT"
echo "STREAMER_SERVICE_PORT=$STREAMER_SERVICE_PORT"
echo 
echo "# configuration for streamer ui server"
echo "STREAMER_UI_AUTH_SERVER=$STREAMER_UI_AUTH_SERVER"
echo "STREAMER_UI_AUTH_CLIENT_ID=$STREAMER_UI_AUTH_CLIENT_ID"
echo "STREAMER_UI_AUTH_CLIENT_SECRET=$STREAMER_UI_AUTH_CLIENT_SECRET"
echo "STREAMER_UI_PDB_VERSION=$STREAMER_UI_PDB_VERSION"
echo "STREAMER_UI_EXTERNAL_PORT=$STREAMER_UI_EXTERNAL_PORT"
echo "STREAMER_UI_BUFFER_DIR=$STREAMER_UI_BUFFER_DIR"
echo "STREAMER_URL_PREFIX=$STREAMER_URL_PREFIX"
echo "STREAMER_UI_DB_HOST=$STREAMER_UI_DB_HOST"
echo "STREAMER_UI_DB_PORT=$STREAMER_UI_DB_PORT"
echo "STREAMER_UI_DB_USER=$STREAMER_UI_DB_USER"
echo "STREAMER_UI_DB_PASSWORD=$STREAMER_UI_DB_PASSWORD"
echo "STREAMER_UI_DB_NAME=$STREAMER_UI_DB_NAME"
echo "STREAMER_UI_DEBUG=$STREAMER_UI_DEBUG"
echo
echo "# configuration for streamer ui statistics database"
echo "STREAMER_UI_DB_EXTERNAL_PORT=$STREAMER_UI_DB_EXTERNAL_PORT"
echo "POSTGRES_HOST=$POSTGRES_HOST"
echo "POSTGRES_PORT=$POSTGRES_PORT"
echo "POSTGRES_USER=$POSTGRES_USER"
echo "POSTGRES_PASSWORD=$POSTGRES_PASSWORD"
echo "POSTGRES_DATABASE=$POSTGRES_DATABASE"
echo "GRAFANA_USER=$GRAFANA_USER"
echo "GRAFANA_PASSWORD=$GRAFANA_PASSWORD"
echo
echo "# configuration for stager"
echo "STAGER_DOCKER_IMAGE_TAG=$STAGER_DOCKER_IMAGE_TAG"
echo "STAGER_DB_DATA_VOL=$STAGER_DB_DATA_VOL"
echo "STAGER_API_CONFIG=$STAGER_API_CONFIG"
echo "STAGER_WORKER_CONFIG=$STAGER_WORKER_CONFIG"
echo "STAGER_IRODS_ICAT_CERT=$STAGER_IRODS_ICAT_CERT"
