// Genera el audio del Phonetic Chart en Supabase Storage (rol/clave -> url en el manifest):
//  - SONIDO del fonema:  clave `sound|<ipa>`  (SSML <phoneme> con eleven_flash_v2 sobre una
//    sílaba portadora mínima -> "solo el sonido", no una palabra).
//  - PALABRAS (keyword + ejemplos): clave `narrator|<word>` (palabras reales = pronunciación perfecta).
// Idempotente. Uso: node scripts/audio/generate-phonemes.mjs   (--dry para contar | --sounds-only)
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
const SOUNDS_ONLY = process.argv.includes('--sounds-only');

const src = readFileSync('./src/lib/phonemes.ts', 'utf8');
// Palabras (keyword + examples)
const words = new Set();
for (const m of src.matchAll(/keyword:\s*'([^']+)'/g)) words.add(m[1].trim());
for (const m of src.matchAll(/examples:\s*\[([^\]]+)\]/g)) for (const w of m[1].split(',')) { const t = w.trim().replace(/^'|'$/g, ''); if (t) words.add(t); }
const ALL_WORDS = [...words];
// Fonemas (ipa + category)
const phonemes = [];
for (const m of src.matchAll(/\{\s*ipa:\s*'([^']+)',\s*category:\s*'([^']+)'/g)) phonemes.push({ ipa: m[1], category: m[2] });

// Consonantes que se pueden sostener solas (fricativas, nasales, aproximantes) -> sonido aislado.
const SUSTAIN = new Set(['f', 'θ', 's', 'ʃ', 'h', 'v', 'ð', 'z', 'ʒ', 'm', 'n', 'ŋ', 'l', 'r', 'w', 'j']);
function carrier(ipa, category) {
  if (category === 'diphthong' || category.startsWith('vowel')) return { ph: ipa, text: ipa };       // vocal/diptongo aislado
  if (SUSTAIN.has(ipa)) return { ph: ipa, text: ipa };                                               // consonante sostenible aislada
  return { ph: ipa + 'ə', text: ipa + 'uh' };                                                        // oclusiva/africada: + schwa mínima
}

async function ttsWord(text) {
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${NARRATOR}?output_format=mp3_44100_128`, {
    method: 'POST', headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json', accept: 'audio/mpeg' },
    body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2', voice_settings: { stability: 0.5, similarity_boost: 0.85, use_speaker_boost: true } }),
  });
  if (!r.ok) throw new Error(`word ${r.status}: ${(await r.text()).slice(0, 120)}`);
  return Buffer.from(await r.arrayBuffer());
}
async function ttsSound(ph, text) {
  // SSML <phoneme> SOLO lo respeta eleven_flash_v2 (multilingual_v2 lo ignora en silencio).
  const ssml = `<phoneme alphabet='ipa' ph='${ph}'>${text}</phoneme>`;
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${NARRATOR}?output_format=mp3_44100_128`, {
    method: 'POST', headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json', accept: 'audio/mpeg' },
    body: JSON.stringify({ text: ssml, model_id: 'eleven_flash_v2', voice_settings: { stability: 0.45, similarity_boost: 0.8, use_speaker_boost: true } }),
  });
  if (!r.ok) throw new Error(`sound ${r.status}: ${(await r.text()).slice(0, 120)}`);
  return Buffer.from(await r.arrayBuffer());
}
async function upload(path, buf, ct) {
  const r = await fetch(`${SUPA}/storage/v1/object/${BUCKET}/${path}`, {
    method: 'POST', headers: { Authorization: `Bearer ${SERVICE}`, apikey: SERVICE, 'Content-Type': ct, 'x-upsert': 'true' }, body: buf,
  });
  if (!r.ok) throw new Error(`upload ${r.status}: ${(await r.text()).slice(0, 120)}`);
}
async function pool(items, n, fn) {
  const out = []; let i = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => { while (i < items.length) { const idx = i++; try { out[idx] = await fn(items[idx]); } catch (e) { out[idx] = { error: e.message, item: items[idx] }; } } }));
  return out;
}

const manifest = existsSync(MANIFEST_PATH) ? JSON.parse(readFileSync(MANIFEST_PATH, 'utf8')) : {};

// --- SONIDOS por fonema (siempre se regeneran salvo --dry; son pocos y queremos la mejor versión) ---
const soundTasks = phonemes.map((p) => ({ ipa: p.ipa, ...carrier(p.ipa, p.category) }));
console.log(`Fonemas (sonido): ${soundTasks.length}`);
if (!DRY) {
  let done = 0;
  const res = await pool(soundTasks, 4, async (t) => {
    const buf = await ttsSound(t.ph, t.text);
    const path = `${hash(`sound|${t.ipa}`)}.mp3`;
    await upload(path, buf, 'audio/mpeg');
    manifest[`sound|${t.ipa}`] = PUBLIC(path);
    if (++done % 10 === 0) console.log(`  ...sonidos ${done}/${soundTasks.length}`);
    return true;
  });
  const errs = res.filter((x) => x && x.error);
  console.log(`Sonidos generados: ${soundTasks.length - errs.length}/${soundTasks.length}`);
  if (errs.length) errs.slice(0, 6).forEach((e) => console.log('  ERR sonido', e.item.ipa, e.error));
}

// --- PALABRAS (idempotente: solo las que falten) ---
if (!SOUNDS_ONLY) {
  const todo = ALL_WORDS.filter((w) => !manifest[`narrator|${w}`]);
  console.log(`Palabras: ${ALL_WORDS.length} | a generar: ${todo.length}`);
  if (!DRY && todo.length) {
    const res = await pool(todo, 5, async (w) => {
      const buf = await ttsWord(w);
      const path = `${hash(`narrator|${w}`)}.mp3`;
      await upload(path, buf, 'audio/mpeg');
      manifest[`narrator|${w}`] = PUBLIC(path);
      return true;
    });
    const errs = res.filter((x) => x && x.error);
    console.log(`Palabras generadas: ${todo.length - errs.length}/${todo.length}`);
  }
}

if (DRY) process.exit(0);
writeFileSync(MANIFEST_PATH, JSON.stringify(manifest));
const clean = Object.fromEntries(Object.entries(manifest).filter(([k]) => !k.startsWith('__sfx_')));
await upload('manifest.json', Buffer.from(JSON.stringify(clean)), 'application/json');
console.log(`Manifest subido: ${Object.keys(clean).length} entradas.`);
