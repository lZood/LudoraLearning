// Genera con ElevenLabs el audio (voz narrator) de los ítems del banco diagnóstico que aún no
// tienen MP3, lo sube a Storage (bucket 'lesson-audio') y lo agrega al manifest compartido.
// Además escribe un `content.audioUrl` opaco en cada ítem de audio, para que el servidor sirva
// la URL en vez del TEXTO de la respuesta (cierra la fuga de listen_missing_word / minimal_pairs).
// Idempotente: salta las claves ya presentes en el manifest local (no regasta créditos).
//
// Uso:
//   node scripts/db/gen-diagnostic-audio.mjs --dry   # solo cuenta cuántos clips faltan
//   node scripts/db/gen-diagnostic-audio.mjs         # genera, sube, y escribe audioUrl en la BD
import pg from 'pg';
import crypto from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const env = readFileSync('.env.local', 'utf8').split(/\r?\n/);
const getEnv = (k) => { const l = env.find((x) => x.startsWith(k + '=')); return l ? l.slice(k.length + 1).replace(/^["']|["']$/g, '') : ''; };
const DB = getEnv('SUPABASE_DB_URL');
const SUPA = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const SERVICE = getEnv('SUPABASE_SERVICE_ROLE_KEY');
const KEY = getEnv('ELEVENLABS_API_KEY');
if (!DB || !SUPA || !SERVICE || !KEY) { console.error('Faltan env vars'); process.exit(1); }

const MANIFEST_PATH = './scripts/audio/manifest.json';
const BUCKET = 'lesson-audio';
const PUBLIC = (p) => `${SUPA}/storage/v1/object/public/${BUCKET}/${p}`;
const VOICE_NARRATOR = 'XrExE9yKIg1WjnnlVkGX'; // Matilda (igual que generate-audio.mjs)
const DRY = process.argv.includes('--dry');
const hash = (s) => crypto.createHash('sha1').update(s).digest('hex').slice(0, 20);

async function tts(text) {
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_NARRATOR}?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json', accept: 'audio/mpeg' },
    body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2', voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0, use_speaker_boost: true } }),
  });
  if (!r.ok) throw new Error(`TTS ${r.status}: ${(await r.text()).slice(0, 160)}`);
  return Buffer.from(await r.arrayBuffer());
}
async function upload(path, buf, contentType) {
  const r = await fetch(`${SUPA}/storage/v1/object/${BUCKET}/${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${SERVICE}`, apikey: SERVICE, 'Content-Type': contentType, 'x-upsert': 'true' },
    body: buf,
  });
  if (!r.ok) throw new Error(`upload ${r.status}: ${(await r.text()).slice(0, 160)}`);
}
async function pool(items, n, fn) {
  let i = 0; const out = [];
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => {
    while (i < items.length) { const idx = i++; try { out[idx] = await fn(items[idx]); } catch (e) { out[idx] = { error: e.message, item: items[idx] }; } }
  }));
  return out;
}

// Todas las cadenas en INGLÉS que el reproductor pronuncia (voz narrator).
function diagStrings(type, content) {
  const out = [];
  const push = (s) => { if (s && typeof s === 'string' && s.trim()) out.push(s.trim()); };
  if (content.audio) push(content.audio);
  if (type === 'listen_missing_word' || type === 'minimal_pairs' || type === 'multi_select') (content.options || []).forEach((o) => push(typeof o === 'string' ? o : o?.text));
  if (type === 'word_bank' || type === 'listen_build') (content.answer || []).forEach(push);
  if (type === 'text_mc' && content.prompt) push(content.prompt); // enunciado en inglés (tocar para oír)
  if (type === 'speak' || type === 'speak_repeat') push(content.say);
  return out;
}

const manifest = existsSync(MANIFEST_PATH) ? JSON.parse(readFileSync(MANIFEST_PATH, 'utf8')) : {};
const c = new pg.Client({ connectionString: DB, ssl: { rejectUnauthorized: false } });
c.on('error', () => {});
await c.connect();

const rows = (await c.query('select id, type, content from diagnostic_items')).rows;
const seen = new Map();
for (const r of rows) for (const text of diagStrings(r.type, r.content)) {
  const key = `narrator|${text}`;
  if (!seen.has(key)) seen.set(key, { key, text });
}
const all = [...seen.values()];
const todo = all.filter((t) => !manifest[t.key]);
const chars = todo.reduce((n, t) => n + t.text.length, 0);
console.log(`Cadenas únicas: ${all.length} | ya en manifest: ${all.length - todo.length} | a generar: ${todo.length} (${chars} caracteres)`);
if (DRY) { console.log('(dry) ejemplos:', todo.slice(0, 10).map((t) => t.text)); await c.end(); process.exit(0); }

// 1) Generar + subir los MP3 faltantes
if (todo.length) {
  let done = 0;
  const res = await pool(todo, 5, async (t) => {
    const buf = await tts(t.text);
    const path = `${hash(t.key)}.mp3`;
    await upload(path, buf, 'audio/mpeg');
    manifest[t.key] = PUBLIC(path);
    if (++done % 20 === 0) console.log(`  ...${done}/${todo.length}`);
    return true;
  });
  const errs = res.filter((x) => x && x.error);
  console.log(`Generados: ${todo.length - errs.length}/${todo.length}`);
  errs.slice(0, 8).forEach((e) => console.log('  ERR', e.item.key, '=>', e.error));
}

// 2) Escribir audioUrl opaco en cada ítem que tenga `audio` (para no mandar el texto al cliente)
let urled = 0;
for (const r of rows) {
  const a = r.content?.audio;
  if (!a) continue;
  const url = manifest[`narrator|${String(a).trim()}`];
  if (!url) continue;
  if (r.content.audioUrl === url) continue;
  await c.query('update diagnostic_items set content = content || $1::jsonb where id=$2', [JSON.stringify({ audioUrl: url }), r.id]);
  urled++;
}
console.log(`audioUrl escrito en ${urled} ítems`);

// 3) Persistir manifest local + subir el público que consume el player
writeFileSync(MANIFEST_PATH, JSON.stringify(manifest));
const clean = Object.fromEntries(Object.entries(manifest).filter(([k]) => !k.startsWith('__sfx_')));
await upload('manifest.json', Buffer.from(JSON.stringify(clean)), 'application/json');
console.log(`Manifest subido: ${Object.keys(clean).length} entradas`);
await c.end();
