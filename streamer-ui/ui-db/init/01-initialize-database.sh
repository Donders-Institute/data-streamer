#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DATABASE" <<-EOSQL
    CREATE TABLE IF NOT EXISTS session(
        id                      SERIAL PRIMARY KEY,
        username                TEXT NOT NULL,
        ip_address              TEXT NOT NULL,
        user_agent              TEXT NOT NULL,
        start_time              TIMESTAMP NOT NULL,
        end_time                TIMESTAMP,
        error                   TEXT);
    CREATE TABLE IF NOT EXISTS upload(
        id                      SERIAL PRIMARY KEY,
        start_time              TIMESTAMP NOT NULL,
        end_time                TIMESTAMP,
        filesize_bytes          BIGINT,
        error                   TEXT,
        session_id              INTEGER NOT NULL,
        FOREIGN KEY(session_id) REFERENCES session (id));
    CREATE USER $GRAFANA_USER WITH PASSWORD '$GRAFANA_PASSWORD';
    GRANT USAGE ON SCHEMA public TO $GRAFANA_USER;
    GRANT SELECT ON public.session TO $GRAFANA_USER;
    GRANT SELECT ON public.upload TO $GRAFANA_USER;
EOSQL