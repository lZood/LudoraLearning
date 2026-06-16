// Reproducción de audio de lecciones.
// Usa audios pre-generados (ElevenLabs) servidos desde Supabase Storage; si una frase
// no tiene audio, cae a TTS del navegador (en-US). También reproduce efectos de sonido.

const SUPA = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const BASE = SUPA ? `${SUPA}/storage/v1/object/public/lesson-audio` : '';
const MANIFEST_URL = BASE ? `${BASE}/manifest.json` : '';

let manifest: Record<string, string> | null = null;
let loading: Promise<void> | null = null;

// Roles de voz (deben coincidir con scripts/audio/generate-audio.mjs)
export const VOICE_ROLES = ['narrator', 'granjerita', 'apicultor', 'npc1', 'npc2', 'npc3'] as const;
export type VoiceRole = (typeof VOICE_ROLES)[number];

export function loadAudioManifest(): Promise<void> {
    if (manifest) return Promise.resolve();
    if (loading) return loading;
    loading = (async () => {
        try {
            const r = await fetch(MANIFEST_URL, { cache: 'force-cache' });
            manifest = r.ok ? await r.json() : {};
        } catch {
            manifest = {};
        }
    })();
    return loading;
}

function ttsSpeak(text: string) {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text.trim());
        u.lang = 'en-US';
        u.rate = 0.92;
        const v = window.speechSynthesis.getVoices().find((vo) => vo.lang.startsWith('en'));
        if (v) u.voice = v;
        window.speechSynthesis.speak(u);
    } catch {
        /* noop */
    }
}

let current: HTMLAudioElement | null = null;

// Reproduce la frase: usa el MP3 pre-generado para (role, text) o (narrator, text); si no, TTS.
export function playAudio(text: string, role: VoiceRole | string = 'narrator') {
    if (!text) return;
    const url = manifest ? manifest[`${role}|${text}`] || manifest[`narrator|${text}`] : undefined;
    if (url) {
        try {
            if (current) current.pause();
            current = new Audio(url);
            current.play().catch(() => ttsSpeak(text));
            return;
        } catch {
            /* fall through a TTS */
        }
    }
    ttsSpeak(text);
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
