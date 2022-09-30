# Developer Guide

1. [Local Development](#1-local-development)
2. [Implementation Details](#2-implementation-details)

## 1. Local Development

### 1.1 Configuration

Create `.env` file in `packages/server`:
```
NODE_ENV=development

# volume in which the streamer ui database initialisation script is presented
STREAMER_UI_DB_INIT_VOL=./streamer-ui/ui-db/init

# volume for streamer ui database
STREAMER_UI_DB_DATA_VOL=./testdata/ui-db/data

# volume in which the streamer ui crontab is presented
STREAMER_UI_CRON_VOL=./testdata/ui/cron

# volume for streamer ui log
STREAMER_UI_LOG_VOL=./testdata/ui/log

# configuration for streamer ui
STREAMER_UI_AUTH_SERVER=https://authserver
STREAMER_UI_AUTH_CLIENT_ID=id
STREAMER_UI_AUTH_CLIENT_SECRET=secret
STREAMER_UI_PDB_VERSION=1
STREAMER_UI_EXTERNAL_PORT=9000
STREAMER_UI_BUFFER_DIR=./testdata/project/3055000.01/raw
STREAMER_URL_PREFIX=http://service:3001
STREAMER_UI_DB_HOST=localhost
STREAMER_UI_DB_PORT=5432
STREAMER_UI_DB_USER=postgres
STREAMER_UI_DB_PASSWORD=postgres
STREAMER_UI_DB_NAME=postgres

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
```

### 1.2 Building and Running the Stack

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

## 2. Implementation Details

### 2.1 Code Organization

The `client` code is structured into the following folders:

* `app` (the root level component, e.g. `AppLoggedIn`)
* `scenes` (presentational parts, web pages, e.g. `Uploader`, `Help`)
* `components` (reusable, logical parts, e.g. `Header`)
* `services` (infrastructure parts, e,g `inputValidation`)
* `types` (reusable constructs, e.g. `UserProfile`)

In turn, each scene can have its own `components`, `services`, and `types`.

### 2.2 Signing In and Signing Out

The user sign-in and sign-out workflow is using the OpenID Connect protocol, initiated by the service component (i.e. backend) of the streamer-ui.

### 2.3 Uploading

The following upload stages exist:
```
NotUploading (initial state)
Selecting (user changes form input fields and file selection)
Initiating (start with upload session; request an upload session id)
Validating (validate files to be uploaded; check if they already exist in project storage folder)
Confirming (ask the user for confirmation if destination folder and file(s) already exist)
Uploading (copy files to streamer UI buffer directory)
Finalizing (wrap up upload session)
Submitting (submitting streamer job)
Success (done)
```
The enum `UploadStatus` is used for this purpose. React hooks are used to update the `uploadState` when appropriate.
In addition, `errorState` is used to capture any exception that might occur. An error modal is shown to the user in case an exception occurs. 

After the user has selected files, he/she selects the appropriate project, sets the subject label and session label, and selects the data type. If the data type is not in the list of allowed data types, the user can select "other" and set this value.

When satisfied, the upload button can be pressed and an upload session is inititated. The upload modal is shown with the upload progress. After the initiating stage, each file that is to be uploaded is validated. Might any of the files already exist in the destination folder, then the user is prompted with a confirmation modal. If the user approves and presses the OK button, the actual upload is started. The files are transferred to the streamer UI buffer directory. When this operation was succesful, the upload session is finalized.

A submit request is sent to the `service` which queues a streamer job. After some delay, an e-mail will be sent to the user with the result.
