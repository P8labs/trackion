#!/bin/bash
set -euo pipefail

# --- Settings (update these) --- #
# - Where should the schema be written
SCHEMA_OUT=$PWD/cmd/migrations/schema.sql
# - Where is the migration directory
MIGRATIONS_IN=$PWD/cmd/migrations
# - Which postgres docker image to use
POSTGRES_IMAGE=postgres:15-alpine
# --- End of Settings --- #

# Start Postgres Server
docker run -d --name goose-postgres -p 15432:5432 --rm -e POSTGRES_PASSWORD=secret ${POSTGRES_IMAGE}
sleep 5 # TODO: better way to wait for db ready

export PGDATABASE=postgres
export PGHOST=127.0.0.1
export PGPORT=15432
export PGUSER=postgres
export PGPASSWORD=secret

export GOOSE_DRIVER=postgres
export GOOSE_DBSTRING="host=${PGHOST} port=${PGPORT} user=${PGUSER} dbname=${PGDATABASE} password=${PGPASSWORD} sslmode=disable"
goose status
goose -dir ${MIGRATIONS_IN} up
goose status
pg_dump --schema-only \
  --no-comments \
  --quote-all-identifiers \
  -T public.goose_db_version \
  -T public.goose_db_version_id_seq | sed \
    -e '/^--.*/d' \
    -e '/^SET /d' \
    -e '/^[[:space:]]*$/d' \
    -e '/^SELECT pg_catalog./d' \
    -e '/^ALTER TABLE .* OWNER TO "postgres";/d' \
    -e 's/"public"\.//' \
      > ${SCHEMA_OUT}
docker kill goose-postgres