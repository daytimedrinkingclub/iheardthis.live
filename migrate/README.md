# Supabase → PocketBase one-time data migration

Tooling to copy users, profiles, artists, experiences, and avatars from the
existing self-hosted Supabase into the new PocketBase instance.

## Read-only on Supabase

This tooling **never writes to Supabase.** Two safeguards:

1. The export script (`supabase-export.sh`) wraps every query in
   `BEGIN; SET TRANSACTION READ ONLY; ... COMMIT;` — Postgres rejects any
   write inside such a transaction at the protocol level.
2. The import script (`import-to-pb.mjs`) only ever reads from local NDJSON
   files and (optionally) the local avatar directory or HTTP. It only
   writes to PocketBase.

Supabase stays untouched and continues serving traffic during the migration.

## Prerequisites

Before running:

1. PocketBase has a public HTTPS URL and the schema from `../pb_schema.json`
   has been imported via the admin UI.
2. The PB admin password has been rotated (the one shared in chat must not
   stay live).
3. The Supabase Postgres container is still running (`docker ps | grep
   supabase-db`).

## Run

```bash
cd migrate
cp .env.example .env
# edit .env — fill in POSTGRES_PASSWORD, PB_URL, PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD

# Step 1: dump Supabase to NDJSON (read-only)
./supabase-export.sh

# Step 2: import into PocketBase (idempotent — safe to re-run)
node import-to-pb.mjs
```

Outputs land in `migrate/out/`:

- `users.ndjson`, `profiles.ndjson`, `artists.ndjson`, `experiences.ndjson` —
  the dumps.
- `migrated_users.csv` — `email, username, temp_password` for each user. Use
  this to email reset links or distribute temporary passwords. Most users
  signed up with Google; once Google OAuth is configured in PB, they can
  sign in via Google and PB will auto-link the OAuth identity to the
  migrated record by email — they never need to use the temp password.

## ID strategy

- **Users**: Supabase UUIDs become PB IDs by stripping dashes
  (`5b5fc8e9-3a4b-4c5d-...` → `5b5fc8e93a4b4c5d...`). Reversible, no mapping
  file needed. PB requires 15–99 alphanumeric IDs; UUIDs without dashes are
  exactly 32 chars.
- **Artists**: Spotify IDs are kept as-is (already alphanumeric, 22 chars).
- **Experiences**: PB-generated IDs. The unique key is `(user_id, artist_id)`.
- **`attended_with[]`**: same dash-strip rule applied per UUID.

## What's not preserved

- **Original `created_at` timestamps** — PB sets `created` on insert. If
  preservation matters, we'd write directly to PB's SQLite, which is not
  worth the complexity for a one-time small migration.
- **Bcrypt password hashes** — PB doesn't accept pre-hashed passwords via
  its public API. Each user gets a fresh random temp password (see CSV).

## Idempotency

Both scripts are safe to re-run:

- The export simply overwrites the NDJSON files.
- The import skips any record that already exists in PB (by ID for users
  and artists, by `(user_id, artist_id)` for experiences, by presence of
  `avatar` field for avatar uploads).

## Verify

After running:

```bash
# Counts (should match Supabase: 45 / 171 / 195)
curl -s "$PB_URL/api/collections/users/records?perPage=1" \
  -H "Authorization: $ADMIN_TOKEN" | jq .totalItems
curl -s "$PB_URL/api/collections/artists/records?perPage=1" \
  -H "Authorization: $ADMIN_TOKEN" | jq .totalItems
curl -s "$PB_URL/api/collections/experiences/records?perPage=1" \
  -H "Authorization: $ADMIN_TOKEN" | jq .totalItems
```

Then: open `https://<frontend>/<some-username>` and confirm the wall
matches what's on the live Supabase-backed site.

## Cleanup

Once you've cut traffic over to PocketBase and confirmed everything works,
delete the local dumps:

```bash
rm -rf out/
```

The Supabase stack itself can stay running until you're confident, then be
torn down via Dokploy. That frees the ~3 GB of RAM noted in PR #5.
