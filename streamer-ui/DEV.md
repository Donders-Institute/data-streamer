# Developer instructions

Create `.env` file in `packages/server`:
```
NODE_ENV=development

# volume in which the streamer ui database initialisation script is presented
STREAMER_UI_DB_INIT_VOL=./streamer-ui/ui-db/init

# volume for streamer ui database
STREAMER_UI_DB_DATA_VOL=./testdata/ui-db/data

# configuration for streamer ui
STREAMER_UI_HOST=0.0.0.0
STREAMER_UI_PORT=9000
STREAMER_UI_PROJECT_DIR=/project
STREAMER_UI_CRON_DIR=/cron-ui
STREAMER_UI_BUFFER_DIR=./testdata/project/3055000.01/raw
STREAMER_URL_PREFIX=http://service:3001
STREAMER_UI_DB_HOST=localhost
STREAMER_UI_DB_PORT=5432
STREAMER_UI_DB_USER=postgres
STREAMER_UI_DB_PASSWORD=postgres
STREAMER_UI_DB_NAME=postgres
STREAMER_UI_MOCK_AUTH=true
STREAMER_UI_MOCK_PROJECT_DATABASE=true
STREAMER_UI_MOCK_SERVICE=true

# configuration for streamer ui client
STREAMER_UI_INTERNAL_SERVER_API_URL=/api
STREAMER_UI_EXTERNAL_SERVER_API_URL=http://localhost:9000/api

# configuration for streamer ui database
STREAMER_UI_DB_EXTERNAL_PORT=9001
POSTGRES_HOST=0.0.0.0
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DATABASE=postgres
GRAFANA_USER=grafanareader
GRAFANA_PASSWORD=grafanareaderpassword
```

Create `.env` file in `packages/client`:
```
NODE_ENV=development

# Streamer UI client configuration
REACT_APP_MOCK_AUTH=false
REACT_APP_MOCK_PROJECT_DATABASE=true
REACT_APP_STREAMER_UI_INTERNAL_SERVER_API_URL=/api
REACT_APP_STREAMER_UI_EXTERNAL_SERVER_API_URL=http://localhost:9000/api
```

Build the stack
```
docker-compose build
```

Start the streamer UI database
```
./start.ui-db.sh
```

Start the streamer UI server
```
cd streamer-ui/packages/server
yarn start
```

Start the streamer UI client
```
cd streamer-ui/packages/client
yarn start
```
