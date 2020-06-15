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
echo "# Configuration files"
echo "SERVICE_CONFIG=$SERVICE_CONFIG"
echo "MAILER_CONFIG=$MAILER_CONFIG"
echo "UI_CONFIG=$UI_CONFIG"
echo "UI_ADCONFIG=$UI_ADCONFIG"
echo "UI_LDAPSCERT=$UI_LDAPSCERT"
echo 
echo "# redis database for streamer jobs"
echo "REDIS_HOST=$REDIS_HOST"
echo "REDIS_PORT=$REDIS_PORT"
echo "STREAMER_SERVICE_PORT=$STREAMER_SERVICE_PORT"
echo 
echo "# configuration for streamer ui server"
echo "STREAMER_UI_HOST=$STREAMER_UI_HOST"
echo "STREAMER_UI_PORT=$STREAMER_UI_PORT"
echo "STREAMER_UI_PROJECT_DIR=$STREAMER_UI_PROJECT_DIR"
echo "STREAMER_UI_CRON_DIR=$STREAMER_UI_CRON_DIR"
echo "STREAMER_UI_BUFFER_DIR=$STREAMER_UI_BUFFER_DIR"
echo "STREAMER_URL_PREFIX=$STREAMER_URL_PREFIX"
echo "STREAMER_UI_DB_HOST=$STREAMER_UI_DB_HOST"
echo "STREAMER_UI_DB_PORT=$STREAMER_UI_DB_PORT"
echo "STREAMER_UI_DB_USER=$STREAMER_UI_DB_USER"
echo "STREAMER_UI_DB_PASSWORD=$STREAMER_UI_DB_PASSWORD"
echo "STREAMER_UI_DB_NAME=$STREAMER_UI_DB_NAME"
echo "STREAMER_UI_MOCK_AUTH=$STREAMER_UI_MOCK_AUTH"
echo "STREAMER_UI_MOCK_PROJECT_DATABASE=$STREAMER_UI_MOCK_PROJECT_DATABASE"
echo "STREAMER_UI_MOCK_SERVICE=$STREAMER_UI_MOCK_SERVICE"
echo 
echo "# configuration for streamer ui client"
echo "STREAMER_UI_INTERNAL_SERVER_API_URL=$STREAMER_UI_INTERNAL_SERVER_API_URL"
echo "STREAMER_UI_EXTERNAL_SERVER_API_URL=$STREAMER_UI_EXTERNAL_SERVER_API_URL"
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
