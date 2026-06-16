// Genera audio (ElevenLabs) para las frases en inglés de las lecciones y lo sube a
// Supabase Storage (bucket público 'lesson-audio'), construyendo un manifest text->url.
// Idempotente: salta las claves ya presentes en el manifest local (no regasta créditos).
//
// Uso:
//   node scripts/audio/generate-audio.mjs            # piloto: Niveles 1-2 (u1-*, u2-*)
//   node scripts/audio/generate-audio.mjs u3- u4-    # otras bandas
//   node scripts/audio/generate-audio.mjs --all      # todas las unidades
//   node scripts/audio/generate-audio.mjs --sfx-only # solo (re)genera efectos de sonido
//   node scripts/audio/generate-audio.mjs --dry       # solo lista cuántos clips faltan
import pg from 'pg';
import crypto from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const env = readFileSync('.env.local', 'utf8').split(/\r?\n/);
const getEnv = (k) => { const l = env.find((x) => x.startsWith(k + '=')); return l ? l.slice(k.length + 1) : ''; };
const DB = getEnv('SUPABASE_DB_URL');
const SUPA = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const SERVICE = getEnv('SUPABASE_SERVICE_ROLE_KEY');
const KEY = getEnv('ELEVENLABS_API_KEY');
if (!SUPA || !SERVICE || !KEY) { console.error('Faltan env vars'); process.exit(1); }

const MANIFEST_PATH = './scripts/audio/manifest.json';
const BUCKET = 'lesson-audio';
const PUBLIC = (p) => `${SUPA}/storage/v1/object/public/${BUCKET}/${p}`;

// Voces Pack A (deben coincidir con VOICE_ROLES de src/lib/lessonAudio.ts)
const VOICES = {
  narrator: 'XrExE9yKIg1WjnnlVkGX',   // Matilda — educadora US clara
  granjerita: 'cgSgspJ2msm6clMCkdW9', // Jessica — joven alegre
  apicultor: 'cjVigY5qzO86Huf0OWal',  // Eric — cálido
  npc1: 'FGY2WhTYpPnrIDTdsKH5',       // Laura
  npc2: 'bIHbv24MWmeRgasZH58o',       // Will
  npc3: 'IKne3meq5aSn9XLyUdCD',       // Charlie
};

const args = process.argv.slice(2);
const DRY = args.includes('--dry');
const SFX_ONLY = args.includes('--sfx-only');
const ALL = args.includes('--all');
const prefixes = args.filter((a) => /^u\d+-$/.test(a));
const PREFIXES = prefixes.length ? prefixes : ['u1-', 'u2-'];

const hash = (s) => crypto.createHash('sha1').update(s).digest('hex').slice(0, 20);

async function tts(voiceId, text) {
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json', accept: 'audio/mpeg' },
    body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2', voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0, use_speaker_boost: true } }),
  });
  if (!r.ok) throw new Error(`TTS ${r.status}: ${(await r.text()).slice(0, 160)}`);
  return Buffer.from(await r.arrayBuffer());
}
async function soundFx(prompt, dur) {
  const r = await fetch('https://api.elevenlabs.io/v1/sound-generation', {
    method: 'POST', headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json', accept: 'audio/mpeg' },
    body: JSON.stringify({ text: prompt, duration_seconds: dur, prompt_influence: 0.4 }),
  });
  if (!r.ok) throw new Error(`SFX ${r.status}: ${(await r.text()).slice(0, 160)}`);
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

// Pool de concurrencia simple
async function pool(items, n, fn) {
  const out = []; let i = 0;
  const workers = Array.from({ length: Math.min(n, items.length) }, async () => {
    while (i < items.length) { const idx = i++; try { out[idx] = await fn(items[idx], idx); } catch (e) { out[idx] = { error: e.message, item: items[idx] }; } }
  });
  await Promise.all(workers);
  return out;
}

// Cada destreza tiene un personaje dueño -> su voz. (Debe coincidir con charForSkill del player.)
const charOf = (skill) => (skill === 'reading' || skill === 'writing' || skill === 'simple') ? 'granjerita' : 'apicultor';
// "Who said it": los 4 aldeanos alternan personaje (debe coincidir con NPC_STYLE del player).
const NPC_AUDIO = ['granjerita', 'apicultor', 'granjerita', 'apicultor'];

// Extrae las frases en inglés (con la voz del personaje) de una lección.
function extract(content) {
  const tasks = [];
  const ch = charOf(content.skill);
  for (const e of content.exercises || []) {
    if (e.type === 'audio_mc' && e.audio) tasks.push([ch, e.audio]);
    else if (e.type === 'listen_build' && e.audio) tasks.push([ch, e.audio]);
    else if (e.type === 'listen_missing_word') { if (e.audio) tasks.push([ch, e.audio]); (e.options || []).forEach((o) => tasks.push([ch, o])); }
    else if (e.type === 'minimal_pairs') { if (e.audio) tasks.push([ch, e.audio]); (e.options || []).forEach((o) => tasks.push([ch, o])); }
    else if (e.type === 'speak' && e.say) tasks.push([ch, e.say]);
    else if (e.type === 'speak_repeat' && e.say) tasks.push([ch, e.say]);
    else if (e.type === 'speak_answer' && e.question) tasks.push([ch, e.question]);
    else if (e.type === 'conversation' && e.starter) tasks.push(['apicultor', e.starter]);
    else if (e.type === 'dialogue' && Array.isArray(e.turns)) e.turns.forEach((t) => t.npc && tasks.push(['apicultor', t.npc]));
    else if (e.type === 'who_said_it' && Array.isArray(e.options)) e.options.forEach((o, i) => tasks.push([NPC_AUDIO[i % NPC_AUDIO.length], o]));
    else if (e.type === 'tap_pairs_audio' && Array.isArray(e.pairs)) e.pairs.forEach((p) => p.audio && tasks.push([ch, p.audio]));
    else if (e.type === 'match_pairs' && Array.isArray(e.pairs)) e.pairs.forEach((p) => tasks.push([ch, p.en]));
  }
  return tasks;
}

const manifest = existsSync(MANIFEST_PATH) ? JSON.parse(readFileSync(MANIFEST_PATH, 'utf8')) : {};

// ─── SFX ───
async function ensureSfx() {
  const SFX = [
    ['correct', 'short cheerful positive ding, correct answer, bright bell, game UI', 1.0],
    ['wrong', 'soft gentle buzz, wrong answer, low error tone, game UI', 0.8],
    ['complete', 'happy success fanfare, level complete, cheerful chime, short', 1.6],
  ];
  for (const [name, prompt, dur] of SFX) {
    if (manifest[`__sfx_${name}`] && !args.includes('--force-sfx')) { console.log(`  sfx ${name}: ya existe`); continue; }
    if (DRY) { console.log(`  sfx ${name}: (dry)`); continue; }
    const buf = await soundFx(prompt, dur);
    await upload(`sfx/${name}.mp3`, buf, 'audio/mpeg');
    manifest[`__sfx_${name}`] = PUBLIC(`sfx/${name}.mp3`);
    console.log(`  sfx ${name}: OK (${buf.length} bytes)`);
  }
}

// ─── main ───
const c = new pg.Client({ connectionString: DB, ssl: false });
c.on('error', () => {});
await c.connect();

if (!SFX_ONLY) {
  const where = ALL ? '' : 'where ' + PREFIXES.map((_, i) => `u.external_id like $${i + 1}`).join(' or ');
  const params = ALL ? [] : PREFIXES.map((p) => p + '%');
  const rows = (await c.query(
    `select a.content from public.activities a join public.units u on u.id=a.unit_id ${where ? where : ''} ${where ? 'and' : 'where'} a.type='lesson'`,
    params
  )).rows;
  console.log(`Lecciones: ${rows.length} (${ALL ? 'todas' : PREFIXES.join(', ')})`);

  // dedupe (role|text)
  const seen = new Map();
  for (const r of rows) for (const [role, text] of extract(r.content)) {
    const t = (text || '').trim(); if (!t) continue;
    const key = `${role}|${t}`;
    if (!seen.has(key)) seen.set(key, { role, text: t, key });
  }
  const allTasks = [...seen.values()];
  const todo = allTasks.filter((t) => !manifest[t.key]);
  const chars = todo.reduce((n, t) => n + t.text.length, 0);
  console.log(`Frases únicas: ${allTasks.length} | ya en manifest: ${allTasks.length - todo.length} | a generar: ${todo.length} (${chars} caracteres)`);

  if (!DRY && todo.length) {
    let done = 0;
    const res = await pool(todo, 5, async (t) => {
      const buf = await tts(VOICES[t.role] || VOICES.narrator, t.text);
      const path = `${hash(t.key)}.mp3`;
      await upload(path, buf, 'audio/mpeg');
      manifest[t.key] = PUBLIC(path);
      if (++done % 20 === 0) console.log(`  ...${done}/${todo.length}`);
      return true;
    });
    const errs = res.filter((x) => x && x.error);
    console.log(`Generados: ${todo.length - errs.length}/${todo.length}`);
    if (errs.length) { console.log('ERRORES:'); errs.slice(0, 8).forEach((e) => console.log('  -', e.item.key, '=>', e.error)); }
  }
}

console.log('SFX:');
await ensureSfx();
await c.end();

if (!DRY) {
  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest));
  // sube el manifest público que consume el player
  const clean = Object.fromEntries(Object.entries(manifest).filter(([k]) => !k.startsWith('__sfx_')));
  await upload('manifest.json', Buffer.from(JSON.stringify(clean)), 'application/json');
  console.log(`Manifest subido: ${Object.keys(clean).length} entradas -> ${PUBLIC('manifest.json')}`);
}
