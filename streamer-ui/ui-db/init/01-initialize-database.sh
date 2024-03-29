#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DATABASE" <<-EOSQL
    CREATE TABLE IF NOT EXISTS uploadsession(
        id                      SERIAL PRIMARY KEY,
        username                TEXT NOT NULL,
        ip_address              TEXT NOT NULL,
        user_agent              TEXT NOT NULL,
        project_number          TEXT NOT NULL,
        subject_label           TEXT NOT NULL,
        session_label           TEXT NOT NULL,
        data_type               TEXT NOT NULL,
        start_time              TIMESTAMP NOT NULL,
        end_time                TIMESTAMP);
    CREATE TABLE IF NOT EXISTS uploadfile(
        id                      SERIAL PRIMARY KEY,
        filename                TEXT NOT NULL,
        filesize_bytes          BIGINT NOT NULL,
        upload_session_id       INTEGER NOT NULL,
        FOREIGN KEY(upload_session_id) REFERENCES uploadSession (id));
    CREATE USER $GRAFANA_USER WITH PASSWORD '$GRAFANA_PASSWORD';
    GRANT USAGE ON SCHEMA public TO $GRAFANA_USER;
    GRANT SELECT ON public.uploadsession TO $GRAFANA_USER;
    GRANT SELECT ON public.uploadfile TO $GRAFANA_USER;
    CREATE TABLE IF NOT EXISTS "usersession" (
        "sid"                   VARCHAR NOT NULL COLLATE "default",
        "sess"                  JSON NOT NULL,
        "expire"                TIMESTAMP(6) NOT NULL
    ) WITH (OIDS=FALSE);
    ALTER TABLE "usersession" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;
    CREATE INDEX "IDX_session_expire" ON "usersession" ("expire");
EOSQL