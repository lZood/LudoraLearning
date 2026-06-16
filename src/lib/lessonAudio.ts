// Reproducción de audio de lecciones.
// Cada personaje tiene UNA voz fija: usa el MP3 pre-generado (ElevenLabs) de ese personaje
// y, si no existe, cae a TTS del navegador diferenciando el personaje por tono/voz.

const SUPA = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const BASE = SUPA ? `${SUPA}/storage/v1/object/public/lesson-audio` : '';
const MANIFEST_URL = BASE ? `${BASE}/manifest.json` : '';

let manifest: Record<string, string> | null = null;
let loading: Promise<void> | null = null;
let manifestTried = false; // ya intentamos cargar al menos una vez (aunque haya fallado)

// Roles de voz (deben coincidir con scripts/audio/generate-audio.mjs)
export const VOICE_ROLES = ['granjerita', 'apicultor', 'narrator'] as const;
export type VoiceRole = (typeof VOICE_ROLES)[number] | string;

// Voz "por defecto" de la lección actual (el personaje dueño). La fija el player al cargar.
let defaultVoice: string = 'narrator';
export function setDefaultVoice(role: string) { defaultVoice = role || 'narrator'; }

// Ajuste de TTS por personaje para que cada uno suene distinto aunque no haya MP3.
const TTS: Record<string, { pitch: number; rate: number; female?: boolean }> = {
    granjerita: { pitch: 1.4, rate: 1.0, female: true },   // niña alegre (aguda)
    apicultor: { pitch: 0.78, rate: 0.95, female: false }, // adulto cálido (grave)
    narrator: { pitch: 1.05, rate: 0.95 },
};
const ttsFor = (role: string) => TTS[role] || TTS.narrator;

// Chrome/Edge devuelven getVoices() vacío hasta que dispara 'voiceschanged'. Lo precargamos
// para que pickVoice no pierda la voz por personaje en la primera frase de la sesión.
if (typeof window !== 'undefined' && window.speechSynthesis) {
    try {
        window.speechSynthesis.getVoices();
        window.speechSynthesis.addEventListener('voiceschanged', () => { try { window.speechSynthesis.getVoices(); } catch { /* noop */ } });
    } catch { /* noop */ }
}

export function loadAudioManifest(): Promise<void> {
    if (manifest) return Promise.resolve();
    if (loading) return loading;
    loading = (async () => {
        try {
            // 'no-cache' revalida (ETag) en cada carga: así los audios nuevos aparecen sin
            // quedar pegados a una copia vieja del manifest cacheada por el navegador.
            const r = await fetch(MANIFEST_URL, { cache: 'no-cache' });
            if (r.ok) manifest = await r.json();
            // Si falla, NO fijamos manifest={} permanente: queda null para reintentar y no
            // condenar toda la sesión a TTS robótico por un fallo de red puntual.
        } catch {
            /* deja manifest en null para reintentar en la próxima llamada */
        } finally {
            manifestTried = true;
            loading = null; // permite reintentar la carga más adelante
        }
    })();
    return loading;
}

function pickVoice(role: string): SpeechSynthesisVoice | undefined {
    const voices = window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith('en'));
    if (!voices.length) return undefined;
    const has = (kws: string[]) => voices.find((v) => kws.some((k) => v.name.toLowerCase().includes(k)));
    const cfg = ttsFor(role);
    if (cfg.female === true) return has(['female', 'samantha', 'victoria', 'zira', 'karen', 'tessa', 'female']) || voices.find((v) => !/male|david|daniel|alex|fred|mark/i.test(v.name)) || voices[0];
    if (cfg.female === false) return has(['male', 'daniel', 'david', 'alex', 'fred', 'mark', 'rishi']) || voices[0];
    return voices[0];
}

function ttsSpeak(text: string, role: string) {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text.trim());
        u.lang = 'en-US';
        const cfg = ttsFor(role);
        u.rate = cfg.rate; u.pitch = cfg.pitch;
        const v = pickVoice(role);
        if (v) u.voice = v;
        window.speechSynthesis.speak(u);
    } catch {
        /* noop */
    }
}

let current: HTMLAudioElement | null = null;

// Reproduce la frase con la voz del personaje (role). Si no se pasa role, usa la voz de la lección.
// Usa el MP3 pre-generado de ESE personaje; si no existe, TTS con el tono del personaje
// (nunca cae a la voz de otro personaje, para mantener voces únicas).
export function playAudio(text: string, role?: string) {
    if (!text) return;
    const r = role || defaultVoice;
    // Si el manifest aún no cargó, espéralo para no caer a TTS robótico en las primeras frases.
    // Pero si YA intentamos y falló (manifest sigue null), no reintentamos en bucle: usamos TTS
    // ahora y disparamos una recarga en segundo plano para que las próximas frases se recuperen.
    if (!manifest) {
        if (!manifestTried) { loadAudioManifest().then(() => playAudio(text, r)); return; }
        void loadAudioManifest();
        ttsSpeak(text, r);
        return;
    }
    const url = manifest[`${r}|${text}`];
    if (url) {
        try {
            if (current) current.pause();
            current = new Audio(url);
            current.play().catch(() => ttsSpeak(text, r));
            return;
        } catch {
            /* fall through a TTS */
        }
    }
    ttsSpeak(text, r);
}

// Reproduce el SONIDO aislado de un fonema (clave `sound|<ipa>`). Si no hay clip,
// cae a la palabra clave (para no dejar al usuario sin audio).
export function playPhonemeSound(ipa: string, fallbackWord?: string) {
    if (!manifest) {
        if (!manifestTried) { loadAudioManifest().then(() => playPhonemeSound(ipa, fallbackWord)); return; }
        void loadAudioManifest();
        if (fallbackWord) playAudio(fallbackWord, 'narrator');
        return;
    }
    const url = manifest[`sound|${ipa}`];
    if (url) {
        try {
            if (current) current.pause();
            current = new Audio(url);
            current.play().catch(() => { if (fallbackWord) playAudio(fallbackWord, 'narrator'); });
            return;
        } catch { /* fall through */ }
    }
    if (fallbackWord) playAudio(fallbackWord, 'narrator');
}

// Detiene cualquier audio en curso (TTS o MP3). Útil al cambiar de ejercicio/desmontar.
export function stopAudio() {
    try { window.speechSynthesis?.cancel(); } catch { /* noop */ }
    try { if (current) current.pause(); } catch { /* noop */ }
}

// Efectos de sonido (acierto/error/completado). Silencioso si el archivo no existe.
export function playSfx(name: 'correct' | 'wrong' | 'complete') {
    if (!BASE) return;
    try {
        const a = new Audio(`${BASE}/sfx/${name}.mp3`);
        a.volume = name === 'complete' ? 0.7 : 0.45;
        a.play().catch(() => {});
    } catch {
        /* noop */
    }
}
