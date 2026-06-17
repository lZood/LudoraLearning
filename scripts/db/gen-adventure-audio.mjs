// Genera el audio (ElevenLabs, voz por personaje) de las líneas de las aventuras y lo agrega al
// manifest compartido. Clave = `${role}|${textoCompleto}` (igual al que pasa el cliente); el audio
// se sintetiza del texto SIN emojis. Idempotente (salta lo ya presente).
import crypto from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const env = readFileSync('.env.local', 'utf8').split(/\r?\n/);
const getEnv = (k) => { const l = env.find((x) => x.startsWith(k + '=')); return l ? l.slice(k.length + 1).replace(/^["']|["']$/g, '') : ''; };
const SUPA = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const SERVICE = getEnv('SUPABASE_SERVICE_ROLE_KEY');
const KEY = getEnv('ELEVENLABS_API_KEY');
if (!SUPA || !SERVICE || !KEY) { console.error('Faltan env vars'); process.exit(1); }

const MANIFEST_PATH = './scripts/audio/manifest.json';
const BUCKET = 'lesson-audio';
const PUBLIC = (p) => `${SUPA}/storage/v1/object/public/${BUCKET}/${p}`;
const VOICES = { narrator: 'XrExE9yKIg1WjnnlVkGX', granjerita: 'cgSgspJ2msm6clMCkdW9', apicultor: 'cjVigY5qzO86Huf0OWal', npc1: 'FGY2WhTYpPnrIDTdsKH5' };
const hash = (s) => crypto.createHash('sha1').update(s).digest('hex').slice(0, 20);
const stripEmoji = (s) => s.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/gu, '').replace(/\s+/g, ' ').trim();

// Líneas (role, text) — deben coincidir EXACTO con src/lib/adventures.ts
const LINES = [
    ['granjerita', "Hi! I'm Lily. You look worried."],
    ['granjerita', "What's wrong?"],
    ['granjerita', 'Oh no! I saw something shiny near the water. Ask Sam, the beekeeper.'],
    ['apicultor', "Buzz! I'm Sam the beekeeper."],
    ['apicultor', 'Do you need help?'],
    ['apicultor', "It's small and golden. It fell into the fountain!"],
    ['npc1', 'Hello! Nice day, right?'],
    ['npc1', 'Can I help you?'],
    ['npc1', 'Yes! Look in the fountain, not in the tree.'],
    ['narrator', 'You search the fountain… 🔑 You found the golden key!'],
    ['narrator', 'Nothing here. Remember the clues!'],
    ['narrator', "It's locked. You need the key first!"],
    ['narrator', 'You open the chest… 🎉 Treasure! Adventure complete!'],
    ['narrator', 'Ask the villagers first to get clues.'],
];

async function tts(voiceId, text) {
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
        method: 'POST', headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json', accept: 'audio/mpeg' },
        body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2', voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0, use_speaker_boost: true } }),
    });
    if (!r.ok) throw new Error(`TTS ${r.status}: ${(await r.text()).slice(0, 160)}`);
    return Buffer.from(await r.arrayBuffer());
}
async function upload(path, buf, contentType) {
    const r = await fetch(`${SUPA}/storage/v1/object/${BUCKET}/${path}`, {
        method: 'POST', headers: { Authorization: `Bearer ${SERVICE}`, apikey: SERVICE, 'Content-Type': contentType, 'x-upsert': 'true' }, body: buf,
    });
    if (!r.ok) throw new Error(`upload ${r.status}: ${(await r.text()).slice(0, 160)}`);
}

const manifest = existsSync(MANIFEST_PATH) ? JSON.parse(readFileSync(MANIFEST_PATH, 'utf8')) : {};
let done = 0;
for (const [role, text] of LINES) {
    const k = `${role}|${text}`;
    if (manifest[k]) { console.log('skip', k.slice(0, 50)); continue; }
    const buf = await tts(VOICES[role] || VOICES.narrator, stripEmoji(text));
    const path = `${hash(k)}.mp3`;
    await upload(path, buf, 'audio/mpeg');
    manifest[k] = PUBLIC(path);
    done++; console.log('OK', role, '-', stripEmoji(text).slice(0, 40));
}
writeFileSync(MANIFEST_PATH, JSON.stringify(manifest));
const clean = Object.fromEntries(Object.entries(manifest).filter(([k]) => !k.startsWith('__sfx_')));
await upload('manifest.json', Buffer.from(JSON.stringify(clean)), 'application/json');
console.log(`\nGenerados: ${done} | manifest subido: ${Object.keys(clean).length} entradas`);
