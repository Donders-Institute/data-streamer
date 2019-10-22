#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DATABASE" <<-EOSQL
    CREATE TYPE session_event AS ENUM ('login', 'logout');
    CREATE TABLE IF NOT EXISTS session(
        id                      SERIAL PRIMARY KEY,
        username                TEXT NOT NULL,
        ip_address              TEXT NOT NULL,
        user_agent              TEXT NOT NULL,
        time                    TIMESTAMP NOT NULL,
        error                   TEXT,
        event_type              session_event);
    CREATE TABLE IF NOT EXISTS upload(
        id                      SERIAL PRIMARY KEY,
        username                TEXT NOT NULL,
        ip_address              TEXT NOT NULL,
        user_agent              TEXT NOT NULL,
        start_time              TIMESTAMP NOT NULL,
        end_time                TIMESTAMP,
        filesize_bytes          BIGINT,
        error                   TEXT);
    CREATE USER $GRAFANA_USER WITH PASSWORD '$GRAFANA_PASSWORD';
    GRANT USAGE ON SCHEMA public TO $GRAFANA_USER;
    GRANT SELECT ON public.session TO $GRAFANA_USER;
    GRANT SELECT ON public.upload TO $GRAFANA_USER;
EOSQL