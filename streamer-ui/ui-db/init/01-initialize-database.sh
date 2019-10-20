#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DATABASE" <<-EOSQL
    CREATE TABLE IF NOT EXISTS ui_db(
        id                      SERIAL PRIMARY KEY,
        username                TEXT NOT NULL,
        ip_address              TEXT NOT NULL,
        start_time              TIMESTAMP NOT NULL,
        end_time                TIMESTAMP NOT NULL,
        max_filesize_bytes      INTEGER NOT NULL,
        num_files               INTEGER NOT NULL,
        total_upload_size_bytes INTEGER NOT NULL,
        user_agent              TEXT NOT NULL,
        error                   TEXT);
    CREATE USER grafanareader WITH PASSWORD 'password';
    GRANT USAGE ON SCHEMA public TO grafanareader;
    GRANT SELECT ON public.ui_db TO grafanareader;
EOSQL