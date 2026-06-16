// Genera el audio (ElevenLabs, voz clara US) de las palabras del Phonetic Chart
// (keyword + ejemplos de cada fonema) y las fusiona al manifest de lesson-audio bajo
// el rol 'narrator'. Palabras reales => pronunciación perfecta. Idempotente.
// Uso: node scripts/audio/generate-phonemes.mjs   (--dry para solo contar)
import crypto from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const env = readFileSync('.env.local', 'utf8').split(/\r?\n/);
const g = (k) => { const l = env.find((x) => x.startsWith(k + '=')); return l ? l.slice(k.length + 1) : ''; };
const SUPA = g('NEXT_PUBLIC_SUPABASE_URL'), SERVICE = g('SUPABASE_SERVICE_ROLE_KEY'), KEY = g('ELEVENLABS_API_KEY');
const BUCKET = 'lesson-audio';
const MANIFEST_PATH = './scripts/audio/manifest.json';
const NARRATOR = 'XrExE9yKIg1WjnnlVkGX'; // Matilda — US clara
const PUBLIC = (p) => `${SUPA}/storage/v1/object/public/${BUCKET}/${p}`;
const hash = (s) => crypto.createHash('sha1').update(s).digest('hex').slice(0, 20);
const DRY = process.argv.includes('--dry');

// Extrae las palabras (keyword + examples) del dataset TS por regex.
const src = readFileSync('./src/lib/phonemes.ts', 'utf8');
const words = new Set();
for (const m of src.matchAll(/keyword:\s*'([^']+)'/g)) words.add(m[1].trim());
for (const m of src.matchAll(/examples:\s*\[([^\]]+)\]/g)) for (const w of m[1].split(',')) { const t = w.trim().replace(/^'|'$/g, ''); if (t) words.add(t); }
const ALL = [...words];

async function tts(text) {
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${NARRATOR}?output_format=mp3_44100_128`, {
    method: 'POST', headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json', accept: 'audio/mpeg' },
    body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2', voice_settings: { stability: 0.5, similarity_boost: 0.85, use_speaker_boost: true } }),
  });
  if (!r.ok) throw new Error(`TTS ${r.status}: ${(await r.text()).slice(0, 140)}`);
  return Buffer.from(await r.arrayBuffer());
}
async function upload(path, buf, ct) {
  const r = await fetch(`${SUPA}/storage/v1/object/${BUCKET}/${path}`, {
    method: 'POST', headers: { Authorization: `Bearer ${SERVICE}`, apikey: SERVICE, 'Content-Type': ct, 'x-upsert': 'true' }, body: buf,
  });
  if (!r.ok) throw new Error(`upload ${r.status}: ${(await r.text()).slice(0, 140)}`);
}
async function pool(items, n, fn) {
  const out = []; let i = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => { while (i < items.length) { const idx = i++; try { out[idx] = await fn(items[idx]); } catch (e) { out[idx] = { error: e.message, item: items[idx] }; } } }));
  return out;
}

const manifest = existsSync(MANIFEST_PATH) ? JSON.parse(readFileSync(MANIFEST_PATH, 'utf8')) : {};
const todo = ALL.filter((w) => !manifest[`narrator|${w}`]);
console.log(`Palabras del chart: ${ALL.length} | ya en manifest: ${ALL.length - todo.length} | a generar: ${todo.length} (${todo.reduce((n, w) => n + w.length, 0)} caracteres)`);
if (DRY) process.exit(0);

if (todo.length) {
  let done = 0;
  const res = await pool(todo, 5, async (w) => {
    const buf = await tts(w);
    const path = `${hash(`narrator|${w}`)}.mp3`;
    await upload(path, buf, 'audio/mpeg');
    manifest[`narrator|${w}`] = PUBLIC(path);
    if (++done % 20 === 0) console.log(`  ...${done}/${todo.length}`);
    return true;
  });
  const errs = res.filter((x) => x && x.error);
  console.log(`Generadas: ${todo.length - errs.length}/${todo.length}`);
  if (errs.length) errs.slice(0, 6).forEach((e) => console.log('  ERR', e.item, e.error));
}
writeFileSync(MANIFEST_PATH, JSON.stringify(manifest));
const clean = Object.fromEntries(Object.entries(manifest).filter(([k]) => !k.startsWith('__sfx_')));
await upload('manifest.json', Buffer.from(JSON.stringify(clean)), 'application/json');
console.log(`Manifest subido: ${Object.keys(clean).length} entradas.`);
