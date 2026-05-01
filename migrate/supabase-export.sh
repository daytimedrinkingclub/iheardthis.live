#!/usr/bin/env bash
#
# Dump the four tables we care about from the running self-hosted Supabase
# Postgres into newline-delimited JSON files. READ-ONLY by design — every
# query runs inside a transaction with `SET TRANSACTION READ ONLY` so even
# a typo cannot mutate Supabase.
#
# Output: ./out/users.ndjson, profiles.ndjson, artists.ndjson, experiences.ndjson
#
# Usage:
#   cp .env.example .env && edit .env
#   ./supabase-export.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [[ -f .env ]]; then
  set -a; . ./.env; set +a
fi

: "${SUPABASE_DB_CONTAINER:?SUPABASE_DB_CONTAINER not set (e.g. iheardthislive-supabase-vd0g7y-supabase-db)}"
: "${POSTGRES_USER:?POSTGRES_USER not set}"
: "${POSTGRES_PASSWORD:?POSTGRES_PASSWORD not set}"
: "${POSTGRES_DB:?POSTGRES_DB not set}"

OUT="$SCRIPT_DIR/out"
mkdir -p "$OUT"

run_query() {
  local label="$1"
  local sql="$2"
  echo "→ exporting $label"
  # SET TRANSACTION READ ONLY guarantees the connection cannot mutate anything,
  # even if the query were modified to include an UPDATE/DELETE/INSERT.
  docker exec -i \
    -e PGPASSWORD="$POSTGRES_PASSWORD" \
    "$SUPABASE_DB_CONTAINER" \
    psql -X -A -t -q -U "$POSTGRES_USER" -d "$POSTGRES_DB" <<SQL > "$OUT/${label}.ndjson"
BEGIN;
SET TRANSACTION READ ONLY;
$sql
COMMIT;
SQL
  local count
  count=$(grep -c . "$OUT/${label}.ndjson" || true)
  echo "  wrote $count rows → $OUT/${label}.ndjson"
}

run_query "users" "
  SELECT json_build_object(
    'id', id,
    'email', email,
    'created_at', created_at,
    'raw_user_meta_data', raw_user_meta_data,
    'has_password', encrypted_password IS NOT NULL AND encrypted_password <> ''
  )
  FROM auth.users
  ORDER BY created_at;
"

run_query "profiles" "
  SELECT row_to_json(p)
  FROM public.profiles p
  ORDER BY created_at;
"

run_query "artists" "
  SELECT row_to_json(a)
  FROM public.artists a
  ORDER BY created_at;
"

run_query "experiences" "
  SELECT row_to_json(e)
  FROM public.user_artist_experiences e
  ORDER BY created_at;
"

echo
echo "Export complete. Files in $OUT/"
ls -la "$OUT/"
