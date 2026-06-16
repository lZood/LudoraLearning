// Crea (o actualiza) el bucket público 'lesson-audio' en Supabase Storage.
import pg from 'pg';
import { readFileSync } from 'node:fs';
const url = readFileSync('.env.local', 'utf8').split(/\r?\n/).find((l) => l.startsWith('SUPABASE_DB_URL=')).slice('SUPABASE_DB_URL='.length);
const c = new pg.Client({ connectionString: url, ssl: false });
c.on('error', () => {});
await c.connect();
await c.query(`insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values ('lesson-audio','lesson-audio', true, 5242880, array['audio/mpeg','audio/mp3','application/json'])
  on conflict (id) do update set public=excluded.public, allowed_mime_types=excluded.allowed_mime_types, file_size_limit=excluded.file_size_limit`);
const r = await c.query("select id, public, file_size_limit from storage.buckets where id='lesson-audio'");
console.log('bucket:', JSON.stringify(r.rows[0]));
await c.end();
