# version
DOCKER_IMAGE_TAG=latest

# docker registry endpoint
DOCKER_REGISTRY=dccn

# volume for home directory
HOME_VOL=./testdata/home

# volume for project directory
PROJECT_VOL=./testdata/project

# volume for project directory on CephFS
PROJECT_CEPHFS_VOL=./testdata/project_cephfs

# volume for streamer job
STREAMER_DB_DATA_VOL=./testdata/streamer/db

# volume for streamer log
STREAMER_SERVICE_LOG_VOL=./testdata/streamer/log
 
# volume in which the streamer crontab is presented
STREAMER_SERVICE_CRON_VOL=./testdata/streamer/cron

# volume in which the streamer ui database initialisation script is presented
STREAMER_UI_DB_INIT_VOL=./streamer-ui/ui-db/init

# volume for streamer ui database
STREAMER_UI_DB_DATA_VOL=./testdata/ui-db/data

# volume in which the streamer ui crontab is presented
STREAMER_UI_CRON_VOL=./testdata/ui/cron

# volume for streamer ui log
STREAMER_UI_LOG_VOL=./testdata/ui/log

# Configuration files
STREAMER_SERVICE_CONFIG=./streamer/config/streamer-service-config.json
STREAMER_MAILER_CONFIG=./streamer/config/streamer-mailer-config.json
STREAMER_UI_CONFIG=./streamer/config/streamer-ui-config.json

# redis database for streamer jobs
REDIS_HOST=db
REDIS_PORT=6379
STREAMER_SERVICE_PORT=3001

# configuration for streamer ui server
STREAMER_UI_AUTH_SERVER=https://authserver
STREAMER_UI_AUTH_CLIENT_ID=clientid
STREAMER_UI_AUTH_CLIENT_SECRET=clientsecret
STREAMER_UI_PDB_VERSION=2
STREAMER_UI_EXTERNAL_PORT=9000
STREAMER_UI_BUFFER_DIR=./testdata/project/3055000.01/raw
STREAMER_URL_PREFIX=http://streamer:3001
STREAMER_UI_DB_HOST=ui-db
STREAMER_UI_DB_PORT=5432
STREAMER_UI_DB_USER=postgres
STREAMER_UI_DB_PASSWORD=postgres
STREAMER_UI_DB_NAME=postgres

# configuration for streamer ui database
STREAMER_UI_DB_EXTERNAL_PORT=9001
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=$STREAMER_UI_DB_USER
POSTGRES_PASSWORD=$STREAMER_UI_DB_PASSWORD
POSTGRES_DATABASE=$STREAMER_UI_DB_NAME
GRAFANA_USER=grafanareader
GRAFANA_PASSWORD=grafanareaderpassword

# configuration for stager
STAGER_DOCKER_IMAGE_TAG=latest
STAGER_DB_DATA_VOL=./testdata/stager/db
STAGER_API_CONFIG=./streamer/config/stager-api-server.yml
STAGER_WORKER_CONFIG=./streamer/config/stager-worker.yml
STAGER_IRODS_ICAT_CERT=./streamer/config/icat.pem