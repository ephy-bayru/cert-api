#!/bin/bash
set -e

echo "Starting database initialization..."
echo "POSTGRES_USER: $POSTGRES_USER"
echo "DB_USERNAME: $DB_USERNAME"
echo "DB_PASSWORD: $DB_PASSWORD"
echo "DB_NAME: $DB_NAME"

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<- EOSQL
    CREATE USER $DB_USERNAME WITH PASSWORD '$DB_PASSWORD';
    CREATE DATABASE $DB_NAME OWNER $DB_USERNAME;
EOSQL

echo "Database initialization finished."