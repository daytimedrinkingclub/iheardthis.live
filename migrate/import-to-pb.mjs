// One-time migration: Supabase NDJSON dumps → PocketBase.
// Idempotent (each upsert checks "exists?" first). Never mutates Supabase —
// the only Supabase touch points are read-only:
//   - reading NDJSON files produced by ./supabase-export.sh
//   - reading avatar files from $SUPABASE_LOCAL_AVATAR_DIR
//   - HTTP GET on Google avatar URLs
//
// Usage:
//   cp .env.example .env && edit .env
//   ./supabase-export.sh
//   node import-to-pb.mjs

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, basename, extname } from 'node:path';
import { randomBytes } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
import PocketBase from 'pocketbase';

// ----- env -----

const env = (k, required = true) => {
  const v = process.env[k];
  if (required && !v) {
    console.error(`missing env: ${k}`);
    process.exit(1);
  }
  return v;
};

const PB_URL = env('PB_URL');
const PB_ADMIN_EMAIL = env('PB_ADMIN_EMAIL');
const PB_ADMIN_PASSWORD = env('PB_ADMIN_PASSWORD');
const SUPABASE_LOCAL_AVATAR_DIR = env('SUPABASE_LOCAL_AVATAR_DIR', false);
const SUPABASE_PUBLIC_HOST = env('SUPABASE_PUBLIC_HOST', false); // e.g. api.iheardthis.live
const OUT_DIR = new URL('./out/', import.meta.url).pathname;

// ----- helpers -----

const readNdjson = (file) => {
  const path = join(OUT_DIR, file);
  if (!existsSync(path)) {
    console.error(`missing dump: ${path} — run ./supabase-export.sh first`);
    process.exit(1);
  }
  return readFileSync(path, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line));
};

// PB record IDs must be 15-99 alphanumeric (no dashes). UUIDs become 32-char
// alphanumeric when dashes are stripped — fits and stays reversible.
const uuidToPbId = (uuid) => {
  if (!uuid) return null;
  return uuid.replaceAll('-', '');
};

const randomPassword = () => randomBytes(12).toString('base64url').slice(0, 16);

const tryGetOne = async (pb, collection, id) => {
  try {
    return await pb.collection(collection).getOne(id);
  } catch (err) {
    if (err?.status === 404) return null;
    throw err;
  }
};

const tryGetFirst = async (pb, collection, filter) => {
  try {
    return await pb.collection(collection).getFirstListItem(filter);
  } catch (err) {
    if (err?.status === 404) return null;
    throw err;
  }
};

// Find a local avatar file for a given UUID, e.g. avatars/<uuid>.png.
const findLocalAvatar = (uuid) => {
  if (!SUPABASE_LOCAL_AVATAR_DIR || !existsSync(SUPABASE_LOCAL_AVATAR_DIR)) {
    return null;
  }
  const matches = readdirSync(SUPABASE_LOCAL_AVATAR_DIR).filter(
    (f) => f.startsWith(uuid + '.') || basename(f, extname(f)) === uuid
  );
  return matches[0] ? join(SUPABASE_LOCAL_AVATAR_DIR, matches[0]) : null;
};

const fetchAvatar = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch ${url} → ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const contentType = res.headers.get('content-type') || 'image/jpeg';
  const ext = contentType.includes('png') ? 'png'
    : contentType.includes('webp') ? 'webp'
    : contentType.includes('gif') ? 'gif'
    : 'jpg';
  return { buf, ext, contentType };
};

// ----- main -----

const pb = new PocketBase(PB_URL);
pb.autoCancellation(false);

console.log('→ authenticating as PB admin');
await pb.admins.authWithPassword(PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD);

const usersDump = readNdjson('users.ndjson');
const profilesDump = readNdjson('profiles.ndjson');
const artistsDump = readNdjson('artists.ndjson');
const experiencesDump = readNdjson('experiences.ndjson');

const profileById = Object.fromEntries(profilesDump.map((p) => [p.id, p]));

console.log(
  `loaded ${usersDump.length} users, ${profilesDump.length} profiles, ` +
  `${artistsDump.length} artists, ${experiencesDump.length} experiences`
);

// ----- users -----

const credentials = []; // { email, username, temp_password }

console.log('\n→ migrating users');
for (const u of usersDump) {
  const pbId = uuidToPbId(u.id);
  const profile = profileById[u.id] || {};

  const existing = await tryGetOne(pb, 'users', pbId);
  if (existing) {
    console.log(`  skip (exists): ${u.email}`);
    continue;
  }

  const tempPassword = randomPassword();
  const payload = {
    id: pbId,
    email: u.email,
    password: tempPassword,
    passwordConfirm: tempPassword,
    emailVisibility: false,
    verified: true,
    username: profile.username || `user_${pbId.slice(0, 8)}`,
    name: profile.name || u.raw_user_meta_data?.name || '',
    country: profile.country || '',
    twitter_url: profile.twitter_url || '',
    spotify_url: profile.spotify_url || '',
    soundcloud_url: profile.soundcloud_url || '',
    youtube_url: profile.youtube_url || '',
  };

  try {
    await pb.collection('users').create(payload);
    credentials.push({
      email: u.email,
      username: payload.username,
      temp_password: tempPassword,
    });
    console.log(`  created: ${u.email}`);
  } catch (err) {
    const data = err?.response?.data;
    // Username collision: append suffix and retry once.
    if (data?.username?.code === 'validation_not_unique') {
      payload.username = `${payload.username}_${pbId.slice(0, 4)}`;
      await pb.collection('users').create(payload);
      credentials.push({
        email: u.email,
        username: payload.username,
        temp_password: tempPassword,
      });
      console.log(`  created (renamed): ${u.email} → @${payload.username}`);
    } else {
      console.error(`  FAILED: ${u.email}`, JSON.stringify(data || err.message));
      throw err;
    }
  }
}

// ----- avatars -----

console.log('\n→ uploading avatars');
for (const profile of profilesDump) {
  if (!profile.avatar_url) continue;

  const pbId = uuidToPbId(profile.id);
  const userRecord = await tryGetOne(pb, 'users', pbId);
  if (!userRecord) {
    console.log(`  skip (no user): ${profile.username}`);
    continue;
  }
  if (userRecord.avatar) {
    console.log(`  skip (has avatar): ${profile.username}`);
    continue;
  }

  let buf, ext, contentType;
  try {
    const localUrl = SUPABASE_PUBLIC_HOST
      ? new URL(profile.avatar_url)
      : null;
    const isSelfHosted =
      localUrl && SUPABASE_PUBLIC_HOST && localUrl.host === SUPABASE_PUBLIC_HOST;

    if (isSelfHosted) {
      const local = findLocalAvatar(profile.id);
      if (local) {
        buf = readFileSync(local);
        ext = extname(local).slice(1) || 'jpg';
        contentType =
          ext === 'png' ? 'image/png'
          : ext === 'webp' ? 'image/webp'
          : ext === 'gif' ? 'image/gif'
          : 'image/jpeg';
      } else {
        ({ buf, ext, contentType } = await fetchAvatar(profile.avatar_url));
      }
    } else {
      ({ buf, ext, contentType } = await fetchAvatar(profile.avatar_url));
    }
  } catch (err) {
    console.warn(`  WARN ${profile.username}: avatar fetch failed — ${err.message}`);
    continue;
  }

  const form = new FormData();
  form.append('avatar', new Blob([buf], { type: contentType }), `avatar.${ext}`);
  await pb.collection('users').update(pbId, form);
  console.log(`  uploaded: ${profile.username}`);
}

// ----- artists -----

console.log('\n→ migrating artists');
for (const a of artistsDump) {
  const existing = await tryGetOne(pb, 'artists', a.id);
  if (existing) continue;

  await pb.collection('artists').create({
    id: a.id,
    name: a.name,
    image_url: a.image_url || '',
    spotify_url: a.spotify_url,
    genres: a.genres || [],
    followers: a.followers ?? 0,
  });
}
console.log(`  done (${artistsDump.length} artists processed)`);

// ----- experiences -----

console.log('\n→ migrating experiences');
let expCreated = 0;
let expSkipped = 0;
for (const e of experiencesDump) {
  const userId = uuidToPbId(e.user_id);
  const artistId = e.artist_id;
  const attendedWith = (e.attended_with || []).map(uuidToPbId).filter(Boolean);

  // Unique on (user_id, artist_id) — skip if already there.
  const existing = await tryGetFirst(
    pb,
    'experiences',
    `user_id = "${userId}" && artist_id = "${artistId}"`
  );
  if (existing) {
    expSkipped++;
    continue;
  }

  try {
    await pb.collection('experiences').create({
      user_id: userId,
      artist_id: artistId,
      event_name: e.event_name || '',
      city: e.city || '',
      country: e.country || '',
      attended_with: attendedWith,
    });
    expCreated++;
  } catch (err) {
    console.error(
      `  FAILED experience ${e.id} (${userId} / ${artistId}):`,
      JSON.stringify(err?.response?.data || err.message)
    );
  }
}
console.log(`  created ${expCreated}, skipped ${expSkipped} (already present)`);

// ----- credentials CSV -----

if (credentials.length) {
  const csvPath = join(OUT_DIR, 'migrated_users.csv');
  const lines = ['email,username,temp_password'];
  for (const c of credentials) {
    const cell = (s) => `"${String(s).replaceAll('"', '""')}"`;
    lines.push([cell(c.email), cell(c.username), cell(c.temp_password)].join(','));
  }
  await writeFile(csvPath, lines.join('\n') + '\n', 'utf8');
  console.log(`\n→ wrote ${credentials.length} credentials to ${csvPath}`);
  console.log('  (use this to email reset links or distribute temp passwords)');
}

console.log('\n✓ migration complete');
