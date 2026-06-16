'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { X, Loader2, Volume2, Mic, Send, Check } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import Mascot from '@/components/lesson/Mascot';
import { playAudio, playSfx, loadAudioManifest } from '@/lib/lessonAudio';
import { speechMatches, getSR } from '@/lib/speech';
import type { LessonContent, Exercise } from '@/lib/lessonContent';

type Result = { correct: boolean; correctText?: string };
type Character = 'granjerita' | 'apicultor';

// ───────────────────────── helpers ─────────────────────────
// Reproduce inglés (audio pre-generado de ElevenLabs o TTS del navegador).
function speak(text: string, role?: string) { playAudio(text, role ?? 'narrator'); }
// Personaje según la destreza (le da "dueño" a cada lección).
const charForSkill = (skill?: string): Character =>
    skill === 'listening' || skill === 'speaking' || skill === 'pronunciation' ? 'apicultor' : 'granjerita';
const CharacterCtx = React.createContext<Character>('granjerita');
function shuffle<T>(a: T[]): T[] { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; }
// Descriptor corto del ejercicio para "Explain My Answer".
function exQuestion(ex: Exercise): string {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const e = ex as any;
    if (e.type === 'reading_passage') return 'una pregunta de comprensión de lectura';
    return e.prompt || e.question || e.instruction || e.audio || e.say || (e.target ? `¿Quién dijo "${e.target}"?` : '') || 'el ejercicio';
}

// ───────────────────────── shared UI ─────────────────────────
function Footer({ label, disabled, onClick }: { label: string; disabled?: boolean; onClick: () => void }) {
    return (
        <div className="fixed bottom-0 inset-x-0 z-30 border-t border-gray-100 bg-white px-4 py-4">
            <div className="max-w-xl mx-auto">
                <button onClick={onClick} disabled={disabled}
                    className={`w-full py-4 rounded-2xl font-black uppercase tracking-wide transition-all active:scale-[0.98] ${disabled ? 'bg-gray-100 text-gray-300' : 'bg-[#88e04f] text-[#1a1a1a] shadow-[0_4px_0_#6dc536]'}`}>
                    {label}
                </button>
            </div>
        </div>
    );
}

function FeedbackBar({ correct, correctText, onContinue, isLast, question }: { correct: boolean; correctText?: string; onContinue: () => void; isLast: boolean; question?: string }) {
    const [msgs, setMsgs] = useState<{ role: 'user' | 'tutor'; text: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const ask = async (followup?: string) => {
        setLoading(true); setOpen(true);
        const base = followup ? [...msgs, { role: 'user' as const, text: followup }] : msgs;
        if (followup) setMsgs(base);
        try {
            const r = await fetch('/api/explain', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: question || 'el ejercicio', correctAnswer: correctText || '', messages: base }) });
            const d = await r.json();
            setMsgs((m) => [...(followup ? base : m), { role: 'tutor', text: r.ok ? d.reply : 'No pude explicarlo ahora.' }]);
        } catch { setMsgs((m) => [...m, { role: 'tutor', text: 'No pude explicarlo ahora.' }]); }
        setLoading(false);
    };
    return (
        <div className={`fixed bottom-0 inset-x-0 z-40 ${correct ? 'bg-[#d7ffb8]' : 'bg-[#ffdfe0]'} border-t-2 ${correct ? 'border-[#88e04f]' : 'border-red-300'} px-4 py-4 animate-in slide-in-from-bottom-4`}>
            <div className="max-w-xl mx-auto">
                <div className="flex items-center gap-4">
                    <Mascot mood={correct ? 'happy' : 'sad'} className="w-14 h-14 shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className={`text-lg font-black ${correct ? 'text-[#4a8a1f]' : 'text-red-600'}`}>{correct ? '¡Muy bien!' : 'Casi…'}</p>
                        {!correct && correctText && <p className="text-sm font-bold text-red-600/90 truncate">Respuesta: {correctText}</p>}
                    </div>
                    {!correct && !open && <button onClick={() => ask()} className="shrink-0 px-3 py-2 rounded-xl bg-white/70 text-red-600 font-black text-xs active:scale-95">¿Por qué?</button>}
                    <button onClick={onContinue} className={`shrink-0 px-6 py-3 rounded-2xl font-black uppercase tracking-wide text-white active:scale-95 ${correct ? 'bg-[#58a700] shadow-[0_4px_0_#4a8a1f]' : 'bg-red-500 shadow-[0_4px_0_#c43d3d]'}`}>
                        {isLast ? 'Terminar' : 'Continuar'}
                    </button>
                </div>
                {open && (
                    <div className="mt-3 bg-white/85 rounded-2xl p-3 max-h-40 overflow-y-auto">
                        {msgs.filter((m) => m.role === 'tutor').map((m, i) => <p key={i} className="text-sm font-medium text-gray-800 mb-1">{m.text}</p>)}
                        {loading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                        {!loading && (
                            <div className="flex gap-2 mt-1">
                                <button onClick={() => ask('Dame otro ejemplo')} className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">Otro ejemplo</button>
                                <button onClick={() => ask('Explícalo más simple')} className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">Más simple</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// ───────────────────────── exercise renderers ─────────────────────────
// Cada renderer llama onDone({correct, correctText}) cuando el alumno envía.
type RProps = { ex: Exercise; frozen: boolean; onDone: (r: Result) => void };

// El personaje presenta el ejercicio con un globo de diálogo (protagonismo).
function MascotBubble({ text, character, mood = 'curious' }: { text: string; character: Character; mood?: 'curious' | 'happy' | 'sad' }) {
    return (
        <div className="flex items-start gap-3 mb-6">
            <Mascot character={character} mood={mood} className="w-16 h-16 md:w-20 md:h-20 shrink-0 -mt-1" />
            <div className="relative flex-1 bg-white border-2 border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-[0_2px_0_rgba(0,0,0,0.03)]">
                <span className="absolute -left-[9px] top-4 w-3.5 h-3.5 bg-white border-l-2 border-b-2 border-gray-100 rotate-45" />
                <p className="text-lg md:text-xl font-black text-gray-900 leading-snug">{text}</p>
            </div>
        </div>
    );
}
function ExHeader({ text }: { text?: string }) {
    const character = React.useContext(CharacterCtx);
    return text ? <MascotBubble text={text} character={character} /> : null;
}
function OptionBtn({ label, state, onClick, disabled }: { label: React.ReactNode; state: 'idle' | 'sel'; onClick: () => void; disabled?: boolean }) {
    return (
        <button onClick={onClick} disabled={disabled}
            className={`w-full text-left p-4 rounded-2xl border-2 font-bold transition-all ${state === 'sel' ? 'border-[#632EB0] bg-purple-50 text-[#632EB0]' : 'border-gray-200 hover:border-gray-300 text-gray-800'} ${disabled ? 'opacity-90' : ''}`}>
            {label}
        </button>
    );
}

function ChoiceMC({ ex, frozen, onDone, audio }: RProps & { audio?: string }) {
    const e = ex as { instruction?: string; prompt?: string; options: string[]; correct: number };
    const [sel, setSel] = useState<number | null>(null);
    useEffect(() => { if (!audio) return; const t = setTimeout(() => speak(audio), 350); return () => clearTimeout(t); }, []); // auto-reproduce al entrar
    return (
        <>
            <ExHeader text={(ex as { instruction?: string }).instruction || 'Elige la opción correcta'} />
            {audio && (
                <button onClick={() => speak(audio)} className="mb-6 inline-flex items-center gap-3 bg-[#632EB0] text-white font-black px-6 py-4 rounded-2xl active:scale-95">
                    <Volume2 className="w-6 h-6" /> Reproducir
                </button>
            )}
            {e.prompt && <p className="text-2xl font-black text-gray-900 mb-6">{e.prompt}</p>}
            <div className="space-y-3">
                {e.options.map((o, i) => <OptionBtn key={i} label={o} state={sel === i ? 'sel' : 'idle'} onClick={() => setSel(i)} disabled={frozen} />)}
            </div>
            <Footer label="Comprobar" disabled={sel === null} onClick={() => onDone({ correct: sel === e.correct, correctText: e.options[e.correct] })} />
        </>
    );
}

// 4 "aldeanos" visualmente distintos (alternan personaje + color) para que se sientan
// hablantes diferentes aunque solo haya 2 SVGs de personaje.
const NPC_STYLE: { char: Character; ring: string; bg: string; label: string }[] = [
    { char: 'granjerita', ring: '#22c55e', bg: 'bg-green-50', label: 'Aldeano 1' },
    { char: 'apicultor', ring: '#3b82f6', bg: 'bg-blue-50', label: 'Aldeano 2' },
    { char: 'granjerita', ring: '#f59e0b', bg: 'bg-amber-50', label: 'Aldeano 3' },
    { char: 'apicultor', ring: '#ec4899', bg: 'bg-pink-50', label: 'Aldeano 4' },
];
function WhoSaidIt({ ex, frozen, onDone }: RProps) {
    const e = ex as { instruction?: string; target: string; options: string[]; correct: number };
    const [sel, setSel] = useState<number | null>(null);
    const norm = (s: string) => s.trim().toLowerCase();
    return (
        <>
            <ExHeader text={e.instruction || '¿Quién lo dijo?'} />
            <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-bold text-gray-400">Busca quién dijo:</span>
                <span className="inline-flex items-center gap-2 bg-[#632EB0]/10 text-[#632EB0] font-black px-3 py-1.5 rounded-xl">{e.target}</span>
            </div>
            <p className="text-sm font-bold text-gray-400 mb-6">Toca cada aldeano para escucharlo, luego elige el correcto.</p>
            <div className="grid grid-cols-2 gap-4">
                {e.options.map((word, i) => {
                    const npc = NPC_STYLE[i % NPC_STYLE.length];
                    const active = sel === i;
                    return (
                        <button key={i} onClick={() => { speak(word, `npc${(i % 3) + 1}`); setSel(i); }} disabled={frozen}
                            className={`flex flex-col items-center gap-2 p-4 rounded-3xl border-2 transition-all ${active ? 'border-[#632EB0] bg-purple-50' : `border-transparent ${npc.bg} hover:brightness-95`}`}>
                            <div className="rounded-full p-1" style={{ boxShadow: `0 0 0 3px ${active ? '#632EB0' : npc.ring}` }}>
                                <Mascot character={npc.char} mood="curious" className="w-16 h-16" />
                            </div>
                            <span className="text-[11px] font-black text-gray-500">{npc.label}</span>
                            <Volume2 className={`w-5 h-5 ${active ? 'text-[#632EB0]' : 'text-gray-400'}`} />
                        </button>
                    );
                })}
            </div>
            <Footer label="Comprobar" disabled={sel === null} onClick={() => onDone({ correct: sel !== null && norm(e.options[sel]) === norm(e.target), correctText: e.target })} />
        </>
    );
}

function MultiSelect({ ex, frozen, onDone }: RProps) {
    const e = ex as { instruction?: string; prompt?: string; sound?: string; options: { text: string; correct: boolean }[] };
    const [sel, setSel] = useState<Set<number>>(new Set());
    const toggle = (i: number) => { if (frozen) return; const n = new Set(sel); n.has(i) ? n.delete(i) : n.add(i); setSel(n); if (e.options[i].correct && e.sound) speak(e.sound); };
    const submit = () => {
        const ok = e.options.every((o, i) => o.correct === sel.has(i));
        onDone({ correct: ok, correctText: e.options.filter((o) => o.correct).map((o) => o.text).join(', ') });
    };
    return (
        <>
            <ExHeader text={e.instruction || 'Selecciona todas las correctas'} />
            {e.sound && <button onClick={() => speak(e.sound!)} className="mb-5 inline-flex items-center gap-2 bg-[#10b981] text-white font-black px-5 py-3 rounded-2xl active:scale-95"><Volume2 className="w-5 h-5" /> Sound of the Day: {e.sound}</button>}
            {e.prompt && <p className="text-lg font-bold text-gray-700 mb-4">{e.prompt}</p>}
            <div className="grid grid-cols-2 gap-3">
                {e.options.map((o, i) => (
                    <button key={i} onClick={() => toggle(i)} disabled={frozen}
                        className={`p-4 rounded-2xl border-2 font-black flex items-center justify-between transition-all ${sel.has(i) ? 'border-[#632EB0] bg-purple-50 text-[#632EB0]' : 'border-gray-200 text-gray-800'}`}>
                        {o.text} {sel.has(i) && <Check className="w-4 h-4" />}
                    </button>
                ))}
            </div>
            <Footer label="Comprobar" disabled={sel.size === 0} onClick={submit} />
        </>
    );
}

function MatchPairs({ ex, frozen, onDone }: RProps) {
    const e = ex as { instruction?: string; pairs: { en: string; es: string }[] };
    const left = useRef(e.pairs.map((p, i) => ({ id: i, t: p.en }))).current;
    const right = useRef(shuffle(e.pairs.map((p, i) => ({ id: i, t: p.es })))).current;
    const [selL, setSelL] = useState<number | null>(null);
    const [matched, setMatched] = useState<Set<number>>(new Set());
    const [bad, setBad] = useState<number | null>(null);

    const tapRight = (id: number) => {
        if (frozen || selL === null || matched.has(id)) return;
        if (selL === id) { const n = new Set(matched); n.add(id); setMatched(n); setSelL(null); if (n.size === e.pairs.length) setTimeout(() => onDone({ correct: true }), 350); }
        else { setBad(id); setTimeout(() => setBad(null), 400); setSelL(null); }
    };
    return (
        <>
            <ExHeader text={e.instruction || 'Une cada palabra con su significado'} />
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-3">
                    {left.map((l) => (
                        <button key={l.id} disabled={frozen || matched.has(l.id)} onClick={() => { speak(l.t); setSelL(l.id); }}
                            className={`w-full p-4 rounded-2xl border-2 font-black transition-all ${matched.has(l.id) ? 'border-[#88e04f] bg-[#88e04f]/10 text-[#4a8a1f] opacity-60' : selL === l.id ? 'border-[#632EB0] bg-purple-50 text-[#632EB0]' : 'border-gray-200 text-gray-800'}`}>{l.t}</button>
                    ))}
                </div>
                <div className="space-y-3">
                    {right.map((r) => (
                        <button key={r.id} disabled={frozen || matched.has(r.id)} onClick={() => tapRight(r.id)}
                            className={`w-full p-4 rounded-2xl border-2 font-black transition-all ${matched.has(r.id) ? 'border-[#88e04f] bg-[#88e04f]/10 text-[#4a8a1f] opacity-60' : bad === r.id ? 'border-red-400 bg-red-50 text-red-600 animate-pulse' : 'border-gray-200 text-gray-800'}`}>{r.t}</button>
                    ))}
                </div>
            </div>
        </>
    );
}

function WordBank({ ex, frozen, onDone }: RProps) {
    const e = ex as { instruction?: string; prompt?: string; answer: string[] };
    const tiles = useRef(shuffle(e.answer.map((w, i) => ({ id: i, w })))).current;
    const [built, setBuilt] = useState<number[]>([]);
    const used = new Set(built);
    return (
        <>
            <ExHeader text={e.instruction || 'Ordena las palabras'} />
            {e.prompt && <p className="text-sm font-bold text-gray-400 mb-4">{e.prompt}</p>}
            <div className="min-h-[60px] border-b-2 border-gray-100 flex flex-wrap gap-2 pb-3 mb-6">
                {built.map((id) => (
                    <button key={id} disabled={frozen} onClick={() => setBuilt(built.filter((b) => b !== id))} className="px-3 py-2 rounded-xl bg-[#632EB0] text-white font-black">{tiles.find((t) => t.id === id)!.w}</button>
                ))}
            </div>
            <div className="flex flex-wrap gap-2">
                {tiles.map((t) => (
                    <button key={t.id} disabled={frozen || used.has(t.id)} onClick={() => setBuilt([...built, t.id])}
                        className={`px-3 py-2 rounded-xl border-2 font-black ${used.has(t.id) ? 'border-gray-100 text-gray-200' : 'border-gray-200 text-gray-800 bg-white'}`}>{t.w}</button>
                ))}
            </div>
            <Footer label="Comprobar" disabled={built.length !== e.answer.length} onClick={() => {
                const got = built.map((id) => tiles.find((t) => t.id === id)!.w).join(' ');
                onDone({ correct: got === e.answer.join(' '), correctText: e.answer.join(' ') });
            }} />
        </>
    );
}

function FillBlank({ ex, frozen, onDone }: RProps) {
    const e = ex as { instruction?: string; before: string; after: string; options: string[]; correct: number };
    const [sel, setSel] = useState<number | null>(null);
    return (
        <>
            <ExHeader text={e.instruction || 'Completa la oración'} />
            <p className="text-2xl font-black text-gray-900 mb-8 leading-relaxed">
                {e.before} <span className="inline-block min-w-[80px] border-b-4 border-gray-200 text-center text-[#632EB0]">{sel !== null ? e.options[sel] : ' '}</span> {e.after}
            </p>
            <div className="space-y-3">
                {e.options.map((o, i) => <OptionBtn key={i} label={o} state={sel === i ? 'sel' : 'idle'} onClick={() => setSel(i)} disabled={frozen} />)}
            </div>
            <Footer label="Comprobar" disabled={sel === null} onClick={() => onDone({ correct: sel === e.correct, correctText: e.options[e.correct] })} />
        </>
    );
}

function FreeText({ ex, frozen, onDone }: RProps) {
    const e = ex as { instruction?: string; prompt: string; promptAudio?: string; imageUrl?: string; accept: string[] };
    const [val, setVal] = useState('');
    return (
        <>
            <ExHeader text={e.instruction || 'Escribe tu respuesta'} />
            {e.imageUrl && <img src={e.imageUrl} alt="" className="w-40 h-40 object-contain mx-auto mb-4 [image-rendering:pixelated]" />}
            <p className="text-xl font-black text-gray-900 mb-2 flex items-center gap-2">
                {e.promptAudio && <Volume2 className="w-5 h-5 text-[#632EB0] cursor-pointer" onClick={() => speak(e.promptAudio!)} />} {e.prompt}
            </p>
            <textarea value={val} disabled={frozen} onChange={(ev) => setVal(ev.target.value)} placeholder="Escribe en inglés…"
                className="w-full mt-4 p-4 rounded-2xl border-2 border-gray-200 focus:border-[#632EB0] outline-none min-h-[120px] resize-none font-medium" />
            <Footer label="Comprobar" disabled={val.trim().length === 0} onClick={() => {
                const v = val.toLowerCase();
                const ok = e.accept.some((a) => v.includes(a.toLowerCase()));
                onDone({ correct: ok, correctText: e.accept[0] });
            }} />
        </>
    );
}

// Núcleo de los ejercicios de voz. Verifica al instante con SpeechRecognition del
// navegador (sin servidor); fallback a IA solo en navegadores sin soporte.
function SpeakCore({ instruction, model, prompt, verify, correctText, mode, frozen, onDone }: {
    instruction?: string; model: string; prompt?: string; verify: (alts: string[]) => boolean; correctText: string; mode: 'repeat' | 'answer'; frozen: boolean; onDone: (r: Result) => void;
}) {
    const [listening, setListening] = useState(false);
    const [recording, setRecording] = useState(false);
    const [busy, setBusy] = useState(false);
    const [heard, setHeard] = useState('');
    const mrRef = useRef<MediaRecorder | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recRef = useRef<any>(null);
    const hasSR = !!getSR();
    useEffect(() => { const t = setTimeout(() => speak(model), 350); return () => clearTimeout(t); }, []); // auto-reproduce al entrar

    const startSR = () => {
        try {
            const rec = new (getSR())(); recRef.current = rec;
            rec.lang = 'en-US'; rec.interimResults = false; rec.maxAlternatives = 5; rec.continuous = false;
            setHeard(''); setListening(true);
            let resolved = false;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            rec.onresult = (event: any) => {
                const alts: string[] = [];
                for (let i = 0; i < event.results.length; i++) for (let j = 0; j < event.results[i].length; j++) alts.push(event.results[i][j].transcript);
                resolved = true;
                setHeard(alts[0] || '');
                setListening(false);
                onDone({ correct: verify(alts), correctText });
            };
            rec.onerror = () => { setListening(false); };
            rec.onend = () => { setListening(false); if (!resolved) setHeard(''); };
            rec.start();
        } catch { onDone({ correct: true, correctText }); }
    };
    const stopSR = () => { try { recRef.current?.stop(); } catch { /* noop */ } };

    // Fallback (navegadores sin SpeechRecognition, p.ej. Firefox): graba y evalúa con IA.
    const startRec = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mr = new MediaRecorder(stream); mrRef.current = mr; const chunks: BlobPart[] = [];
            mr.ondataavailable = (ev) => ev.data.size && chunks.push(ev.data);
            mr.onstop = async () => {
                stream.getTracks().forEach((t) => t.stop()); setRecording(false); setBusy(true);
                const blob = new Blob(chunks, { type: 'audio/webm' });
                const qText = mode === 'answer' ? `Responde hablando en inglés a: "${model}"` : `Repite/di en inglés: "${model}"`;
                const rubric = mode === 'answer' ? `Acepta si la respuesta hablada menciona: ${correctText}. Sé indulgente.` : `El alumno debe pronunciar "${model}". Sé indulgente con principiantes.`;
                try {
                    const b64: string = await new Promise((res) => { const r = new FileReader(); r.onloadend = () => res(r.result as string); r.readAsDataURL(blob); });
                    const resp = await fetch('/api/evaluate-answer', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ questionType: 'audio-record', questionText: qText, gradingRubric: rubric, audioBase64: b64.split(',')[1], audioMimeType: 'audio/webm' }) });
                    const data = await resp.json();
                    onDone({ correct: resp.ok ? !!data.isCorrect : true, correctText });
                } catch { onDone({ correct: true, correctText }); }
                setBusy(false);
            };
            mr.start(); setRecording(true);
        } catch { onDone({ correct: true, correctText }); }
    };

    const active = listening || recording;
    const onMic = () => {
        if (frozen || busy) return;
        if (hasSR) { listening ? stopSR() : startSR(); }
        else { recording ? mrRef.current?.stop() : startRec(); }
    };
    const status = busy ? 'Evaluando…' : listening ? 'Escuchando… habla ahora' : recording ? 'Grabando… toca para terminar' : (mode === 'answer' ? 'Toca y responde hablando' : 'Toca y di la frase');
    return (
        <>
            <ExHeader text={instruction || (mode === 'answer' ? 'Responde hablando' : 'Habla')} />
            {prompt && <p className="text-gray-500 font-bold mb-4">{prompt}</p>}
            <div className="bg-purple-50/50 border border-purple-100 rounded-3xl p-6 text-center mb-6">
                <p className="text-2xl font-black text-gray-900 mb-3 flex items-center justify-center gap-2">
                    <Volume2 className="w-6 h-6 text-[#632EB0] cursor-pointer" onClick={() => speak(model)} /> {model}
                </p>
                <p className="text-xs font-bold text-gray-400">{mode === 'answer' ? 'Toca el botón y responde hablando.' : 'Toca el botón y repítelo.'}</p>
            </div>
            <div className="flex flex-col items-center gap-3">
                <button onClick={onMic} disabled={busy || frozen}
                    className={`w-24 h-24 rounded-full flex items-center justify-center text-white ${active ? 'bg-red-500 animate-pulse' : 'bg-[#632EB0]'} disabled:opacity-50`}>
                    {busy ? <Loader2 className="w-10 h-10 animate-spin" /> : <Mic className="w-10 h-10" />}
                </button>
                <p className="text-sm font-bold text-gray-500">{status}</p>
                {heard && <p className="text-xs font-bold text-gray-400">Te escuché: “{heard}”</p>}
                {!frozen && <button onClick={() => onDone({ correct: true, correctText })} className="text-xs font-bold text-gray-400 underline">Saltar</button>}
            </div>
        </>
    );
}
function Speak({ ex, frozen, onDone }: RProps) {
    const e = ex as { instruction?: string; say: string; prompt?: string };
    return <SpeakCore instruction={e.instruction} model={e.say} prompt={e.prompt} verify={(alts) => speechMatches(alts, e.say)} correctText={e.say} mode="repeat" frozen={frozen} onDone={onDone} />;
}
function SpeakAnswer({ ex, frozen, onDone }: RProps) {
    const e = ex as { instruction?: string; question: string; accept: string[]; prompt?: string };
    return <SpeakCore instruction={e.instruction || 'Responde hablando'} model={e.question} prompt={e.prompt} verify={(alts) => e.accept.some((a) => speechMatches(alts, a))} correctText={e.accept[0] || ''} mode="answer" frozen={frozen} onDone={onDone} />;
}

function ListenBuild({ ex, frozen, onDone }: RProps) {
    const e = ex as { instruction?: string; audio: string; answer: string[]; prompt?: string };
    const tiles = useRef(shuffle(e.answer.map((w, i) => ({ id: i, w })))).current;
    const [built, setBuilt] = useState<number[]>([]);
    const used = new Set(built);
    useEffect(() => { const t = setTimeout(() => speak(e.audio), 400); return () => clearTimeout(t); }, []); // auto-reproduce al entrar
    return (
        <>
            <ExHeader text={e.instruction || 'Escucha y arma la frase'} />
            <button onClick={() => speak(e.audio)} className="mb-6 inline-flex items-center gap-3 bg-[#632EB0] text-white font-black px-6 py-4 rounded-2xl active:scale-95">
                <Volume2 className="w-6 h-6" /> Reproducir
            </button>
            {e.prompt && <p className="text-sm font-bold text-gray-400 mb-4">{e.prompt}</p>}
            <div className="min-h-[60px] border-b-2 border-gray-100 flex flex-wrap gap-2 pb-3 mb-6">
                {built.map((id) => (
                    <button key={id} disabled={frozen} onClick={() => setBuilt(built.filter((b) => b !== id))} className="px-3 py-2 rounded-xl bg-[#632EB0] text-white font-black">{tiles.find((t) => t.id === id)!.w}</button>
                ))}
            </div>
            <div className="flex flex-wrap gap-2">
                {tiles.map((t) => (
                    <button key={t.id} disabled={frozen || used.has(t.id)} onClick={() => setBuilt([...built, t.id])}
                        className={`px-3 py-2 rounded-xl border-2 font-black ${used.has(t.id) ? 'border-gray-100 text-gray-200' : 'border-gray-200 text-gray-800 bg-white'}`}>{t.w}</button>
                ))}
            </div>
            <Footer label="Comprobar" disabled={built.length !== e.answer.length} onClick={() => {
                const got = built.map((id) => tiles.find((t) => t.id === id)!.w).join(' ');
                onDone({ correct: got === e.answer.join(' '), correctText: e.answer.join(' ') });
            }} />
        </>
    );
}

function Conversation({ ex, frozen, onDone }: RProps) {
    const e = ex as { instruction?: string; scenario: string; objective: string; starter: string; minTurns?: number; mode?: 'text' | 'voice'; persona?: string };
    const voice = e.mode === 'voice';
    const minTurns = e.minTurns ?? 3;
    const [messages, setMessages] = useState<Array<{ role: 'user' | 'npc'; text: string }>>([{ role: 'npc', text: e.starter }]);
    const [input, setInput] = useState(''); const [busy, setBusy] = useState(false);
    const [listening, setListening] = useState(false);
    const turns = messages.filter((m) => m.role === 'user').length;
    const endRef = useRef<HTMLDivElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recRef = useRef<any>(null);
    const hasSR = !!getSR();
    useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
    useEffect(() => { const t = setTimeout(() => speak(e.starter, voice ? 'apicultor' : 'narrator'), 400); return () => clearTimeout(t); }, []); // auto-reproduce el saludo
    const send = async (textArg?: string) => {
        const text = (textArg ?? input).trim(); if (!text || busy) return;
        const next = [...messages, { role: 'user' as const, text }]; setMessages(next); setInput(''); setBusy(true);
        try {
            const r = await fetch('/api/lesson-chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ scenario: e.scenario, objective: e.objective, messages: next }) });
            const d = await r.json(); const reply = r.ok ? d.reply : 'Try again.';
            setMessages((m) => [...m, { role: 'npc', text: reply }]);
            if (voice) speak(reply, 'apicultor'); // auto-reproduce la respuesta hablada
        } catch { setMessages((m) => [...m, { role: 'npc', text: 'Try again.' }]); }
        setBusy(false);
    };
    const startVoice = () => {
        const SR = getSR(); if (!SR || busy) return;
        const rec = new SR(); recRef.current = rec; rec.lang = 'en-US'; rec.interimResults = false; rec.maxAlternatives = 1; rec.continuous = false;
        setListening(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rec.onresult = (ev: any) => { const t = ev.results?.[0]?.[0]?.transcript || ''; setListening(false); if (t) send(t); };
        rec.onerror = () => setListening(false); rec.onend = () => setListening(false);
        rec.start();
    };
    return (
        <>
            <ExHeader text={e.instruction || (voice ? 'Habla con el personaje' : 'Conversa con el personaje')} />
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3 text-sm mb-3"><span className="font-black text-amber-800">Meta: </span><span className="text-amber-700 font-medium">{e.objective}</span></div>
            <div className="border border-gray-100 rounded-3xl p-3 flex flex-col gap-2 min-h-[300px]">
                {messages.map((m, i) => (
                    <div key={i} className={`flex items-end gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {m.role === 'npc' && <Mascot character="apicultor" mood={busy && i === messages.length - 1 ? 'curious' : 'happy'} className="w-9 h-9 shrink-0" />}
                        <div className={`max-w-[78%] px-3 py-2 rounded-2xl text-sm font-medium flex items-start gap-1.5 ${m.role === 'user' ? 'bg-[#632EB0] text-white' : 'bg-gray-100 text-gray-800'}`}>
                            {m.role === 'npc' && <Volume2 className="w-4 h-4 mt-0.5 shrink-0 text-[#632EB0] cursor-pointer" onClick={() => speak(m.text, voice ? 'apicultor' : 'narrator')} />}<span>{m.text}</span>
                        </div>
                    </div>
                ))}
                {busy && <div className="flex items-center gap-2 text-gray-400"><Mascot character="apicultor" mood="curious" className="w-7 h-7" /><Loader2 className="w-4 h-4 animate-spin" /></div>}<div ref={endRef} />
            </div>
            {voice && hasSR ? (
                <div className="flex flex-col items-center gap-2 mt-4">
                    <button onClick={startVoice} disabled={busy || frozen}
                        className={`w-20 h-20 rounded-full flex items-center justify-center text-white ${listening ? 'bg-red-500 animate-pulse' : 'bg-[#632EB0]'} disabled:opacity-50`}>
                        {busy ? <Loader2 className="w-8 h-8 animate-spin" /> : <Mic className="w-8 h-8" />}
                    </button>
                    <p className="text-xs font-bold text-gray-500">{listening ? 'Escuchando… habla en inglés' : busy ? 'El personaje piensa…' : 'Toca y habla'}</p>
                </div>
            ) : (
                <div className="flex gap-2 mt-3">
                    <input value={input} disabled={frozen} onChange={(ev) => setInput(ev.target.value)} onKeyDown={(ev) => ev.key === 'Enter' && send()} placeholder="Escribe en inglés…" className="flex-1 border-2 border-gray-200 focus:border-[#632EB0] rounded-2xl px-4 py-3 outline-none" />
                    <button onClick={() => send()} disabled={busy} className="bg-[#632EB0] text-white px-5 rounded-2xl disabled:opacity-50"><Send className="w-5 h-5" /></button>
                </div>
            )}
            <Footer label={turns >= minTurns ? 'Terminar' : `${voice ? 'Habla' : 'Escribe'} ${minTurns - turns} más`} disabled={turns < minTurns} onClick={() => onDone({ correct: true })} />
        </>
    );
}

function ListenMissingWord({ ex, frozen, onDone }: RProps) {
    const e = ex as { instruction?: string; audio: string; options: string[]; correct: number };
    const [sel, setSel] = useState<number | null>(null);
    useEffect(() => { const t = setTimeout(() => speak(e.audio), 350); return () => clearTimeout(t); }, []);
    return (
        <>
            <ExHeader text={e.instruction || 'Escucha y elige la palabra que falta'} />
            <button onClick={() => speak(e.audio)} className="mb-6 inline-flex items-center gap-3 bg-[#632EB0] text-white font-black px-6 py-4 rounded-2xl active:scale-95">
                <Volume2 className="w-6 h-6" /> Reproducir
            </button>
            <div className="grid grid-cols-2 gap-3">
                {e.options.map((o, i) => (
                    <button key={i} onClick={() => { speak(o); setSel(i); }} disabled={frozen}
                        className={`p-4 rounded-2xl border-2 font-black flex items-center justify-center gap-2 transition-all ${sel === i ? 'border-[#632EB0] bg-purple-50 text-[#632EB0]' : 'border-gray-200 text-gray-800'}`}>
                        <Volume2 className="w-4 h-4 opacity-50" /> {o}
                    </button>
                ))}
            </div>
            <Footer label="Comprobar" disabled={sel === null} onClick={() => onDone({ correct: sel === e.correct, correctText: e.options[e.correct] })} />
        </>
    );
}

function MinimalPairs({ ex, frozen, onDone }: RProps) {
    const e = ex as { instruction?: string; audio: string; options: string[]; correct: number; ipa?: string[] };
    const [sel, setSel] = useState<number | null>(null);
    useEffect(() => { const t = setTimeout(() => speak(e.audio), 350); return () => clearTimeout(t); }, []);
    return (
        <>
            <ExHeader text={e.instruction || '¿Cuál escuchaste?'} />
            <button onClick={() => speak(e.audio)} className="mb-6 inline-flex items-center gap-3 bg-[#10b981] text-white font-black px-6 py-4 rounded-2xl active:scale-95">
                <Volume2 className="w-6 h-6" /> Reproducir
            </button>
            <div className="grid grid-cols-2 gap-3">
                {e.options.map((o, i) => (
                    <button key={i} onClick={() => setSel(i)} disabled={frozen}
                        className={`p-5 rounded-2xl border-2 font-black flex flex-col items-center gap-1 transition-all ${sel === i ? 'border-[#632EB0] bg-purple-50 text-[#632EB0]' : 'border-gray-200 text-gray-800'}`}>
                        <span className="text-lg">{o}</span>
                        {e.ipa?.[i] && <span className="text-xs font-mono text-gray-400">{e.ipa[i]}</span>}
                    </button>
                ))}
            </div>
            <Footer label="Comprobar" disabled={sel === null} onClick={() => onDone({ correct: sel === e.correct, correctText: e.options[e.correct] })} />
        </>
    );
}

function TapPairsAudio({ ex, frozen, onDone }: RProps) {
    const e = ex as { instruction?: string; pairs: { audio: string; word: string }[] };
    const left = useRef(e.pairs.map((p, i) => ({ id: i, audio: p.audio }))).current;
    const right = useRef(shuffle(e.pairs.map((p, i) => ({ id: i, t: p.word })))).current;
    const [selL, setSelL] = useState<number | null>(null);
    const [matched, setMatched] = useState<Set<number>>(new Set());
    const [bad, setBad] = useState<number | null>(null);
    const tapRight = (id: number) => {
        if (frozen || selL === null || matched.has(id)) return;
        if (selL === id) { const n = new Set(matched); n.add(id); setMatched(n); setSelL(null); if (n.size === e.pairs.length) setTimeout(() => onDone({ correct: true }), 350); }
        else { setBad(id); setTimeout(() => setBad(null), 400); setSelL(null); }
    };
    return (
        <>
            <ExHeader text={e.instruction || 'Empareja cada sonido con su palabra'} />
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-3">
                    {left.map((l) => (
                        <button key={l.id} disabled={frozen || matched.has(l.id)} onClick={() => { speak(l.audio); setSelL(l.id); }}
                            className={`w-full p-4 rounded-2xl border-2 font-black flex items-center justify-center gap-2 transition-all ${matched.has(l.id) ? 'border-[#88e04f] bg-[#88e04f]/10 text-[#4a8a1f] opacity-60' : selL === l.id ? 'border-[#632EB0] bg-purple-50 text-[#632EB0]' : 'border-gray-200 text-gray-800'}`}>
                            <Volume2 className="w-5 h-5" /> Sonido {l.id + 1}
                        </button>
                    ))}
                </div>
                <div className="space-y-3">
                    {right.map((r) => (
                        <button key={r.id} disabled={frozen || matched.has(r.id)} onClick={() => tapRight(r.id)}
                            className={`w-full p-4 rounded-2xl border-2 font-black transition-all ${matched.has(r.id) ? 'border-[#88e04f] bg-[#88e04f]/10 text-[#4a8a1f] opacity-60' : bad === r.id ? 'border-red-400 bg-red-50 text-red-600 animate-pulse' : 'border-gray-200 text-gray-800'}`}>{r.t}</button>
                    ))}
                </div>
            </div>
        </>
    );
}

// Lectura interactiva: pasaje por oraciones + preguntas encadenadas (cloze/insert/highlight/idea/título).
type RQ = { kind: 'cloze'; gapId: number; prompt?: string; options: string[]; correct: number }
    | { kind: 'insert_sentence'; afterSentenceId: number; prompt?: string; options: string[]; correct: number }
    | { kind: 'highlight'; prompt: string; correctSentenceId: number }
    | { kind: 'main_idea'; prompt?: string; options: string[]; correct: number }
    | { kind: 'title'; prompt?: string; options: string[]; correct: number };
function ReadingPassage({ ex, onDone }: RProps) {
    const e = ex as { instruction?: string; title?: string | null; sentences: { id: number; text: string; gapId?: number }[]; glossary?: { word: string; es: string }[]; questions: RQ[] };
    const [qi, setQi] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [answered, setAnswered] = useState(false);
    const [lastOk, setLastOk] = useState(false);
    const [sel, setSel] = useState<number | null>(null);
    const [hlSel, setHlSel] = useState<number | null>(null);
    const [filled, setFilled] = useState<Record<number, { text: string; ok: boolean }>>({});
    const [revealed, setRevealed] = useState<Set<number>>(new Set());
    const q = e.questions[qi];
    const clozeByGap: Record<number, Extract<RQ, { kind: 'cloze' }>> = {};
    for (const qq of e.questions) if (qq.kind === 'cloze') clozeByGap[qq.gapId] = qq;
    const hlActive = q?.kind === 'highlight' && !answered;

    const check = () => {
        let ok = false;
        if (q.kind === 'highlight') ok = hlSel === q.correctSentenceId;
        else ok = sel === q.correct;
        if (q.kind === 'cloze' && sel !== null) setFilled((f) => ({ ...f, [q.gapId]: { text: q.options[sel], ok } }));
        setLastOk(ok); setAnswered(true); playSfx(ok ? 'correct' : 'wrong');
        if (ok) setCorrectCount((c) => c + 1);
    };
    const next = () => {
        if (qi + 1 >= e.questions.length) { onDone({ correct: (correctCount) / e.questions.length >= 0.6, correctText: 'Lectura completada' }); return; }
        setQi(qi + 1); setAnswered(false); setSel(null); setHlSel(null);
    };

    const renderSentence = (s: { id: number; text: string; gapId?: number }) => {
        const cloze = s.gapId != null ? clozeByGap[s.gapId] : undefined;
        if (cloze) {
            const gw = cloze.options[cloze.correct];
            const idx = s.text.toLowerCase().indexOf(gw.toLowerCase());
            const f = filled[s.gapId!];
            const blank = <span className={`inline-block min-w-[64px] text-center font-black border-b-4 px-1 ${f ? (f.ok ? 'text-[#4a8a1f] border-[#88e04f]' : 'text-red-600 border-red-400') : 'text-[#632EB0] border-gray-300'}`}>{f ? f.text : '_____'}</span>;
            if (idx === -1) return <span key={s.id}>{s.text} {blank} </span>;
            return <span key={s.id}>{s.text.slice(0, idx)}{blank}{s.text.slice(idx + gw.length)} </span>;
        }
        if (hlActive) {
            return <button key={s.id} onClick={() => setHlSel(s.id)} className={`text-left rounded px-1 ${hlSel === s.id ? 'bg-purple-200/60' : 'hover:bg-gray-100'}`}>{s.text} </button>;
        }
        const showCorrect = answered && q?.kind === 'highlight' && s.id === q.correctSentenceId;
        const showWrong = answered && q?.kind === 'highlight' && s.id === hlSel && !lastOk;
        return <span key={s.id} className={`px-1 rounded ${showCorrect ? 'bg-[#88e04f]/30' : showWrong ? 'bg-red-100' : ''}`}>{s.text} </span>;
    };

    return (
        <>
            <ExHeader text={e.instruction || 'Lee y responde'} />
            {e.title && <h3 className="text-lg font-black text-gray-900 mb-2">{e.title}</h3>}
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 mb-4 leading-relaxed text-gray-800 font-medium">
                {e.sentences.map(renderSentence)}
            </div>
            {e.glossary && e.glossary.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-5">
                    {e.glossary.map((g, i) => (
                        <button key={i} onClick={() => setRevealed((r) => new Set(r).add(i))}
                            className="text-xs font-bold px-3 py-1.5 rounded-full bg-amber-50 border border-amber-100 text-amber-700">
                            {g.word}{revealed.has(i) ? ` = ${g.es}` : ' 👁'}
                        </button>
                    ))}
                </div>
            )}
            <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-black text-gray-400 mb-2">Pregunta {qi + 1}/{e.questions.length}</p>
                {q.kind === 'highlight' && <p className="text-lg font-black text-gray-900 mb-3">{q.prompt} <span className="text-sm font-bold text-gray-400">(toca la oración)</span></p>}
                {q.kind !== 'highlight' && (
                    <>
                        <p className="text-lg font-black text-gray-900 mb-3">{q.kind === 'cloze' ? 'Elige la palabra que falta' : q.kind === 'insert_sentence' ? (q.prompt || '¿Qué oración encaja en el hueco?') : q.kind === 'main_idea' ? (q.prompt || '¿Cuál es la idea principal?') : (q.prompt || 'Elige el mejor título')}</p>
                        <div className="space-y-3">
                            {q.options.map((o, i) => (
                                <OptionBtn key={i} label={o} state={sel === i ? 'sel' : 'idle'} onClick={() => !answered && setSel(i)} disabled={answered} />
                            ))}
                        </div>
                    </>
                )}
            </div>
            {!answered
                ? <Footer label="Comprobar" disabled={q.kind === 'highlight' ? hlSel === null : sel === null} onClick={check} />
                : (
                    <div className={`fixed bottom-0 inset-x-0 z-40 ${lastOk ? 'bg-[#d7ffb8]' : 'bg-[#ffdfe0]'} border-t-2 ${lastOk ? 'border-[#88e04f]' : 'border-red-300'} px-4 py-5`}>
                        <div className="max-w-xl mx-auto flex items-center gap-4">
                            <Mascot mood={lastOk ? 'happy' : 'sad'} className="w-14 h-14 shrink-0" />
                            <p className={`flex-1 text-lg font-black ${lastOk ? 'text-[#4a8a1f]' : 'text-red-600'}`}>{lastOk ? '¡Correcto!' : 'Revisa la respuesta'}</p>
                            <button onClick={next} className={`shrink-0 px-6 py-3 rounded-2xl font-black uppercase text-white active:scale-95 ${lastOk ? 'bg-[#58a700]' : 'bg-red-500'}`}>{qi + 1 >= e.questions.length ? 'Terminar' : 'Siguiente'}</button>
                        </div>
                    </div>
                )}
        </>
    );
}

function MatchMadness({ ex, onDone }: RProps) {
    const e = ex as { instruction?: string; pool: { en: string; es: string }[]; seconds?: number };
    const SECONDS = e.seconds ?? 60;
    const deck = useRef(shuffle(e.pool.map((p, i) => ({ id: i, en: p.en, es: p.es })))).current;
    const total = deck.length;
    const VISIBLE = Math.min(5, total);
    const [left, setLeft] = useState(() => deck.slice(0, VISIBLE).map((d) => ({ id: d.id, t: d.en })));
    const [right, setRight] = useState(() => shuffle(deck.slice(0, VISIBLE).map((d) => ({ id: d.id, t: d.es }))));
    const [cursor, setCursor] = useState(VISIBLE);
    const [selL, setSelL] = useState<number | null>(null);
    const [bad, setBad] = useState<number | null>(null);
    const [cleared, setCleared] = useState(0);
    const [combo, setCombo] = useState(0);
    const [time, setTime] = useState(SECONDS);
    const clearedRef = useRef(0);
    const doneRef = useRef(false);
    const finish = (ok: boolean) => { if (doneRef.current) return; doneRef.current = true; setTimeout(() => onDone({ correct: ok, correctText: `${clearedRef.current}/${total}` }), 250); };
    useEffect(() => {
        const iv = setInterval(() => setTime((t) => { if (t <= 1) { clearInterval(iv); finish(clearedRef.current >= Math.ceil(total * 0.6)); return 0; } return t - 1; }), 1000);
        return () => clearInterval(iv);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const tapLeft = (id: number) => { const d = deck.find((x) => x.id === id); if (d) speak(d.en); setSelL(id); };
    const tapRight = (id: number) => {
        if (selL === null || doneRef.current) return;
        if (selL === id) {
            const nl = left.filter((x) => x.id !== id); const nr = right.filter((x) => x.id !== id);
            if (cursor < total) { const d = deck[cursor]; nl.push({ id: d.id, t: d.en }); nr.splice(Math.floor(Math.random() * (nr.length + 1)), 0, { id: d.id, t: d.es }); setCursor(cursor + 1); }
            setLeft(nl); setRight(nr); setSelL(null);
            setCombo((c) => c + 1);
            clearedRef.current += 1; setCleared(clearedRef.current);
            if (clearedRef.current >= total) finish(true);
        } else { setBad(id); setCombo(0); setTimeout(() => setBad(null), 350); setSelL(null); }
    };
    return (
        <>
            <ExHeader text={e.instruction || 'Empareja contra reloj'} />
            <div className="flex items-center justify-between mb-4 px-1">
                <span className="text-sm font-black text-gray-500">✅ {cleared}/{total}</span>
                {combo >= 2 && <span className="text-sm font-black text-orange-500 animate-pulse">🔥 x{combo}</span>}
                <span className={`text-sm font-black tabular-nums ${time <= 10 ? 'text-red-500' : 'text-gray-700'}`}>⏱ {time}s</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                    {left.map((l) => (
                        <button key={l.id} onClick={() => tapLeft(l.id)} className={`w-full p-3 rounded-2xl border-2 font-black transition-all ${selL === l.id ? 'border-[#632EB0] bg-purple-50 text-[#632EB0]' : 'border-gray-200 text-gray-800'}`}>{l.t}</button>
                    ))}
                </div>
                <div className="space-y-2">
                    {right.map((r) => (
                        <button key={r.id} onClick={() => tapRight(r.id)} className={`w-full p-3 rounded-2xl border-2 font-black transition-all ${bad === r.id ? 'border-red-400 bg-red-50 text-red-600 animate-pulse' : 'border-gray-200 text-gray-800'}`}>{r.t}</button>
                    ))}
                </div>
            </div>
        </>
    );
}

function Renderer(props: RProps) {
    switch (props.ex.type) {
        case 'text_mc': return <ChoiceMC {...props} />;
        case 'audio_mc': return <ChoiceMC {...props} audio={(props.ex as { audio: string }).audio} />;
        case 'who_said_it': return <WhoSaidIt {...props} />;
        case 'multi_select': return <MultiSelect {...props} />;
        case 'match_pairs': return <MatchPairs {...props} />;
        case 'word_bank': return <WordBank {...props} />;
        case 'fill_blank': return <FillBlank {...props} />;
        case 'free_text': return <FreeText {...props} />;
        case 'speak': return <Speak {...props} />;
        case 'speak_repeat': return <Speak {...props} />;
        case 'speak_answer': return <SpeakAnswer {...props} />;
        case 'listen_build': return <ListenBuild {...props} />;
        case 'listen_missing_word': return <ListenMissingWord {...props} />;
        case 'tap_pairs_audio': return <TapPairsAudio {...props} />;
        case 'minimal_pairs': return <MinimalPairs {...props} />;
        case 'reading_passage': return <ReadingPassage {...props} />;
        case 'match_madness': return <MatchMadness {...props} />;
        case 'conversation': return <Conversation {...props} />;
        default: return null;
    }
}

// ───────────────────────── page ─────────────────────────
export default function LeccionPage() {
    const params = useParams();
    const router = useRouter();
    const activityId = params.activityId as string;
    const supabase = createClient();

    const [loading, setLoading] = useState(true);
    const [missing, setMissing] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [unitId, setUnitId] = useState('');
    const [unitExt, setUnitExt] = useState('');
    const [xp, setXp] = useState(10);
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [skill, setSkill] = useState<string>('');
    const [idx, setIdx] = useState(0);
    const [result, setResult] = useState<Result | null>(null);
    const [correctCount, setCorrectCount] = useState(0);
    const [finished, setFinished] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadAudioManifest();
        (async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUserId(user?.id ?? null);
            const { data: act } = await supabase
                .from('activities')
                .select('id, xp_reward, content, unit_id, unit:units!activities_unit_id_fkey(external_id)')
                .eq('id', activityId).maybeSingle();
            const content = act?.content as LessonContent | undefined;
            const unit = (Array.isArray(act?.unit) ? act?.unit[0] : act?.unit) as { external_id?: string } | undefined;
            if (!act || content?.kind !== 'lesson' || !Array.isArray(content.exercises) || !content.exercises.length) { setMissing(true); setLoading(false); return; }
            setUnitId(act.unit_id as string);
            setUnitExt(unit?.external_id ?? '');
            setXp((act.xp_reward as number) ?? 10);
            setSkill(content.skill ?? '');
            setExercises(content.exercises);
            // Retomar donde se quedó (si la lección no está completada).
            if (user) {
                const { data: prog } = await supabase
                    .from('user_activity_progress')
                    .select('last_index, completed_at')
                    .eq('user_id', user.id).eq('activity_id', activityId).maybeSingle();
                const li = (prog?.last_index as number) ?? 0;
                if (prog && !prog.completed_at && li > 0 && li < content.exercises.length) setIdx(li);
            }
            setLoading(false);
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activityId]);

    const onDone = (r: Result) => { setResult(r); playSfx(r.correct ? 'correct' : 'wrong'); if (r.correct) setCorrectCount((c) => c + 1); };
    const onContinue = async () => {
        if (idx + 1 >= exercises.length) { await finish(); return; }
        const next = idx + 1;
        setIdx(next); setResult(null);
        // Guarda el avance para poder retomar después.
        if (userId) {
            supabase.from('user_activity_progress')
                .upsert({ user_id: userId, activity_id: activityId, last_index: next, attempts: 1 }, { onConflict: 'user_id,activity_id' })
                .then(() => {}, () => {});
        }
    };
    const finish = async () => {
        setFinished(true);
        playSfx('complete');
        if (!userId || !unitId) return;
        setSaving(true);
        try {
            await supabase.from('user_activity_progress').upsert({ user_id: userId, activity_id: activityId, completed_at: new Date().toISOString(), attempts: 1, score: Math.round((correctCount / exercises.length) * 100), last_index: exercises.length }, { onConflict: 'user_id,activity_id' });
            await supabase.rpc('grant_progress', { p_xp: xp, p_coins: 0, p_source: 'leccion' });
            const { data: acts } = await supabase.from('activities').select('id').eq('unit_id', unitId);
            const ids = (acts ?? []).map((a) => a.id as string);
            const { data: doneRows } = await supabase.from('user_activity_progress').select('activity_id').eq('user_id', userId).in('activity_id', ids).not('completed_at', 'is', null);
            const pct = Math.round(((doneRows?.length ?? 0) / (ids.length || 1)) * 100);
            await supabase.from('user_progress').upsert({ user_id: userId, unit_id: unitId, progress_pct: pct, status: pct >= 100 ? 'completed' : 'in_progress', last_accessed_at: new Date().toISOString() }, { onConflict: 'user_id,unit_id' });
        } catch (e) { console.error(e); }
        setSaving(false);
    };

    if (loading) return <div className="min-h-screen bg-white flex items-center justify-center"><Loader2 className="w-8 h-8 text-[#632EB0] animate-spin" /></div>;
    if (missing) return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 px-6 text-center">
            <Mascot mood="curious" className="w-28 h-28" />
            <p className="text-xl font-black text-gray-900">Esta lección aún no está disponible</p>
            <Link href={unitExt ? `/portal-alumno/dashboard/unidad/${unitExt}` : '/portal-alumno/dashboard/cursos'} className="bg-[#632EB0] text-white font-bold px-6 py-3 rounded-2xl">Volver</Link>
        </div>
    );

    if (finished) {
        const pct = Math.round((correctCount / exercises.length) * 100);
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-5 px-6 text-center">
                <Mascot mood="happy" className="w-40 h-40" />
                <h2 className="text-3xl font-black text-gray-900">¡Lección completada!</h2>
                <div className="flex gap-3">
                    <div className="border-2 border-yellow-200 rounded-2xl px-5 py-3"><p className="text-2xl font-black text-yellow-500">+{xp}</p><p className="text-[10px] font-black text-gray-400 uppercase">XP</p></div>
                    <div className="border-2 border-green-200 rounded-2xl px-5 py-3"><p className="text-2xl font-black text-[#58a700]">{pct}%</p><p className="text-[10px] font-black text-gray-400 uppercase">Aciertos</p></div>
                </div>
                <button onClick={() => router.push(unitExt ? `/portal-alumno/dashboard/unidad/${unitExt}` : '/portal-alumno/dashboard/cursos')} disabled={saving} className="mt-2 bg-[#88e04f] text-[#1a1a1a] font-black px-10 py-4 rounded-2xl shadow-[0_4px_0_#6dc536] disabled:opacity-50">
                    {saving ? 'Guardando…' : 'Continuar'}
                </button>
            </div>
        );
    }

    const ex = exercises[idx];
    return (
        <div className="min-h-screen bg-white pb-28">
            {/* top bar */}
            <div className="sticky top-0 z-20 bg-white px-4 py-3 flex items-center gap-3">
                <Link href={unitExt ? `/portal-alumno/dashboard/unidad/${unitExt}` : '/portal-alumno/dashboard/cursos'} className="p-1 text-gray-400 hover:text-gray-700"><X className="w-7 h-7" /></Link>
                <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#88e04f] rounded-full transition-all duration-300" style={{ width: `${(idx / exercises.length) * 100}%` }} />
                </div>
                <span className="text-xs font-black text-gray-400 tabular-nums">{idx + 1}/{exercises.length}</span>
            </div>

            <div className="max-w-xl mx-auto px-4 py-6">
                <CharacterCtx.Provider value={charForSkill(skill)}>
                    <Renderer key={idx} ex={ex} frozen={result !== null} onDone={onDone} />
                </CharacterCtx.Provider>
            </div>

            {result && <FeedbackBar correct={result.correct} correctText={result.correctText} onContinue={onContinue} isLast={idx + 1 >= exercises.length} question={ex ? exQuestion(ex) : undefined} />}
        </div>
    );
}
