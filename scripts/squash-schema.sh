#!/bin/bash
set -euo pipefail

pg_dump "$PROD_DB_URL" --schema-only --no-owner --no-privileges > prod_schema.sql
pg_dump "$DEV_DB_URL"  --schema-only --no-owner --no-privileges > dev_schema.sql