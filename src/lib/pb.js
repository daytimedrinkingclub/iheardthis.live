import PocketBase from 'pocketbase';

const pbUrl = import.meta.env.VITE_PB_URL || 'http://127.0.0.1:8090';

export const pb = new PocketBase(pbUrl);
pb.autoCancellation(false);

export function fileUrl(record, field) {
  if (!record || !record[field]) return null;
  return pb.files.getUrl(record, record[field]);
}

export function normalizeUser(record) {
  if (!record) return null;
  return {
    ...record,
    avatar_url: fileUrl(record, 'avatar'),
  };
}

export function normalizeArtist(record) {
  if (!record) return null;
  return record;
}

export function normalizeExperience(record) {
  if (!record) return null;
  const artist = record.expand?.artist_id
    ? normalizeArtist(record.expand.artist_id)
    : null;
  return {
    ...record,
    artist,
  };
}
