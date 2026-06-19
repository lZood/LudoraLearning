// Genera el audio (ElevenLabs, voz por personaje) de TODAS las aventuras de src/lib/adventures.ts
// y lo agrega al manifest compartido. Data-driven (usa adventureVoiceLines) → al añadir historias
// no hay que sincronizar listas a mano. Idempotente (salta lo ya presente).
//
//   npx tsx scripts/db/gen-adventures-audio-all.ts
//
// Clave del manifest = `${role}|${textoCompleto con emoji}` (igual al que pasa el cliente);
// el audio se sintetiza del texto SIN emojis.
import crypto from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { ADVENTURES, adventureVoiceLines, type AdvChar } from '../../src/lib/adventures';

const env = readFileSync('.env.local', 'utf8').split(/\r?\n/);
const getEnv = (k: string) => { const l = env.find((x) => x.startsWith(k + '=')); return l ? l.slice(k.length + 1).replace(/^["']|["']$/g, '') : ''; };
const SUPA = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const SERVICE = getEnv('SUPABASE_SERVICE_ROLE_KEY');
const KEY = getEnv('ELEVENLABS_API_KEY');
if (!SUPA || !SERVICE || !KEY) { console.error('Faltan env vars (.env.local: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ELEVENLABS_API_KEY)'); process.exit(1); }

const MANIFEST_PATH = './scripts/audio/manifest.json';
const BUCKET = 'lesson-audio';
const PUBLIC = (p: string) => `${SUPA}/storage/v1/object/public/${BUCKET}/${p}`;
// IDs de voz por personaje (mismos que gen-adventure-audio.mjs). npc2/npc3 → narrator (no usados aún).
const VOICES: Record<string, string> = {
    narrator: 'XrExE9yKIg1WjnnlVkGX', granjerita: 'cgSgspJ2msm6clMCkdW9',
    apicultor: 'cjVigY5qzO86Huf0OWal', npc1: 'FGY2WhTYpPnrIDTdsKH5',
};
const hash = (s: string) => crypto.createHash('sha1').update(s).digest('hex').slice(0, 20);
const stripEmoji = (s: string) => s.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/gu, '').replace(/\s+/g, ' ').trim();

// Reúne (role,text) de TODAS las aventuras + la línea fija del motor; dedup por clave.
const lines = new Map<string, { role: AdvChar | string; text: string }>();
for (const adv of Object.values(ADVENTURES)) {
    for (const { role, text } of adventureVoiceLines(adv)) lines.set(`${role}|${text}`, { role, text });
}
// Línea literal del motor (useAdventureEngine): no está en adventureVoiceLines.
{ const t = 'Ask the villagers first to get clues.'; lines.set(`narrator|${t}`, { role: 'narrator', text: t }); }

async function tts(voiceId: string, text: string) {
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
        method: 'POST', headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json', accept: 'audio/mpeg' },
        body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2', voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0, use_speaker_boost: true } }),
    });
    if (!r.ok) throw new Error(`TTS ${r.status}: ${(await r.text()).slice(0, 160)}`);
    return Buffer.from(await r.arrayBuffer());
}
async function upload(path: string, buf: Buffer, contentType: string) {
    const r = await fetch(`${SUPA}/storage/v1/object/${BUCKET}/${path}`, {
        method: 'POST', headers: { Authorization: `Bearer ${SERVICE}`, apikey: SERVICE, 'Content-Type': contentType, 'x-upsert': 'true' }, body: buf,
    });
    if (!r.ok) throw new Error(`upload ${r.status}: ${(await r.text()).slice(0, 160)}`);
}

const manifest: Record<string, string> = existsSync(MANIFEST_PATH) ? JSON.parse(readFileSync(MANIFEST_PATH, 'utf8')) : {};
let done = 0, skipped = 0;
for (const [k, { role, text }] of lines) {
    if (manifest[k]) { skipped++; continue; }
    const buf = await tts(VOICES[role] || VOICES.narrator, stripEmoji(text));
    await upload(`${hash(k)}.mp3`, buf, 'audio/mpeg');
    manifest[k] = PUBLIC(`${hash(k)}.mp3`);
    done++; console.log('OK', role, '-', stripEmoji(text).slice(0, 44));
}
writeFileSync(MANIFEST_PATH, JSON.stringify(manifest));
const clean = Object.fromEntries(Object.entries(manifest).filter(([k]) => !k.startsWith('__sfx_')));
await upload('manifest.json', Buffer.from(JSON.stringify(clean)), 'application/json');
console.log(`\nNuevas: ${done} | ya existían: ${skipped} | manifest subido: ${Object.keys(clean).length} entradas`);
