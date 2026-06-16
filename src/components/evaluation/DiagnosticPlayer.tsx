'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Volume2, Loader2, Check, RotateCcw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Mascot from '@/components/lesson/Mascot';
import { playAudio, loadAudioManifest, stopAudio, playSfx } from '@/lib/lessonAudio';

const say = (t: string) => playAudio(t, 'narrator'); // siempre inglés con voz narradora
function shuffle<T>(a: T[]): T[] { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Item = { id: string; skill: string; type: string; content: any };
type Answer = { id: string; raw: unknown };
type Staged = { item: Item | null; count: number; done: boolean };

const MC_TYPES = ['text_mc', 'audio_mc', 'listen_missing_word', 'minimal_pairs'];
const AUDIO_TYPES = ['audio_mc', 'listen_missing_word', 'minimal_pairs', 'listen_build'];
const SPEAK_OPTION_TYPES = ['minimal_pairs', 'listen_missing_word']; // opciones en INGLÉS: ok hablarlas al tocar
const OK = ['¡Muy bien! 🎉', '¡Correcto!', '¡Lo lograste! 💪', '¡Excelente!'];
const NO = ['¡Casi! Vas aprendiendo 🌱', 'No pasa nada, ¡sigue!', 'Buen intento, ¡continúa!'];

export default function DiagnosticPlayer({ theta0, onFinish }: { theta0: number; onFinish: (history: Answer[]) => void }) {
    const [item, setItem] = useState<Item | null>(null);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [raw, setRaw] = useState<unknown>(null);
    const [feedback, setFeedback] = useState<{ correct: boolean; msg: string } | null>(null);
    const historyRef = useRef<Answer[]>([]);
    const stagedRef = useRef<Staged | null>(null);
    const APPROX = 10;

    useEffect(() => {
        loadAudioManifest();
        void start();
        return () => stopAudio();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function callNext() {
        const r = await fetch('/api/placement/next', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ theta0, history: historyRef.current }) });
        if (!r.ok) throw new Error('http ' + r.status);
        return r.json();
    }
    function autoPlay(it: Item | null) {
        if (it && AUDIO_TYPES.includes(it.type) && it.content?.audio) setTimeout(() => say(it.content.audio), 350);
    }
    async function start() {
        setLoading(true); setError(false); stopAudio();
        try {
            const d = await callNext();
            if (d.done || !d.item) { onFinish(historyRef.current); return; }
            setItem(d.item); setCount(d.count); setLoading(false); autoPlay(d.item);
        } catch { setError(true); setLoading(false); }
    }
    async function submit() {
        if (!canSubmit || !item || submitting) return;
        historyRef.current = [...historyRef.current, { id: item.id, raw }];
        setSubmitting(true); stopAudio();
        try {
            const d = await callNext();
            stagedRef.current = { item: d.done ? null : d.item, count: d.count ?? count + 1, done: !!d.done };
            const correct = !!d.lastCorrect;
            playSfx(correct ? 'correct' : 'wrong');
            setFeedback({ correct, msg: (correct ? OK : NO)[Math.floor((historyRef.current.length * 7) % (correct ? OK.length : NO.length))] });
        } catch { setError(true); }
        finally { setSubmitting(false); }
    }
    function continueNext() {
        const staged = stagedRef.current;
        setFeedback(null); setRaw(null);
        if (!staged || staged.done || !staged.item) { onFinish(historyRef.current); return; }
        setItem(staged.item); setCount(staged.count); autoPlay(staged.item);
    }

    if (error) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-5 text-center px-6">
                <Mascot character="apicultor" mood="sad" className="w-24 h-24" />
                <p className="text-lg font-black text-gray-900">Se nos cayó la conexión</p>
                <p className="text-sm font-bold text-gray-400 max-w-xs -mt-3">No te preocupes, tu progreso está a salvo.</p>
                <button onClick={() => void start()} className="inline-flex items-center gap-2 bg-[#632EB0] text-white font-black px-8 py-3.5 rounded-2xl active:scale-95">
                    <RotateCcw className="w-5 h-5" /> Reintentar
                </button>
            </div>
        );
    }
    if (loading || !item) {
        return <div className="min-h-screen bg-white flex items-center justify-center"><Loader2 className="w-8 h-8 text-[#632EB0] animate-spin" /></div>;
    }
    const e = item.content;
    const frozen = feedback !== null;
    const canSubmit = raw !== null && !(Array.isArray(raw) && raw.length === 0);
    const optClass = (i: number) => {
        const selected = raw === i;
        if (frozen && selected) return feedback!.correct ? 'border-[#58a700] bg-[#d7ffb8] text-[#3a6b00]' : 'border-red-400 bg-red-50 text-red-600';
        return selected ? 'border-[#632EB0] bg-purple-50 text-[#632EB0]' : 'border-gray-200 text-gray-800';
    };

    return (
        <div className="min-h-screen bg-white pb-32 flex flex-col">
            {/* Barra de progreso */}
            <div className="sticky top-0 z-10 bg-white px-4 py-3 flex items-center gap-3">
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden" role="progressbar" aria-valuenow={count} aria-valuemin={0} aria-valuemax={APPROX}>
                    <motion.div className="h-full bg-[#88e04f] rounded-full" animate={{ width: `${Math.min(95, Math.round((count / APPROX) * 100))}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} />
                </div>
                <span className="text-xs font-black text-gray-400 tabular-nums" aria-live="polite">Pregunta {count + 1}</span>
            </div>

            <AnimatePresence mode="wait">
                <motion.div key={item.id} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.22 }}
                    className="max-w-xl mx-auto w-full px-4 py-6 flex-1">
                    {/* Personaje + instrucción */}
                    <div className="flex items-start gap-3 mb-6">
                        <Mascot character="apicultor" mood={frozen ? (feedback!.correct ? 'happy' : 'curious') : 'curious'} className="w-16 h-16 shrink-0 -mt-1" />
                        <div className="relative flex-1 bg-white border-2 border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
                            <span className="absolute -left-[9px] top-4 w-3.5 h-3.5 bg-white border-l-2 border-b-2 border-gray-100 rotate-45" />
                            <p className="text-lg font-black text-gray-900 leading-snug">{e.instruction || 'Responde'}</p>
                        </div>
                    </div>

                    {/* Audio (auto-reproduce; el botón permite repetir) */}
                    {(AUDIO_TYPES.includes(item.type) && e.audio) && (
                        <button onClick={() => say(e.audio)} className="mb-5 inline-flex items-center gap-3 bg-[#632EB0] text-white font-black px-6 py-4 rounded-2xl active:scale-95 shadow-[0_4px_0_#4a2088]">
                            <Volume2 className="w-6 h-6" /> Escuchar de nuevo
                        </button>
                    )}

                    {/* audio_mc: muestra la PREGUNTA en pantalla */}
                    {item.type === 'audio_mc' && e.prompt && <p className="text-xl font-black text-gray-900 mb-5">{e.prompt}</p>}

                    {/* listen_missing_word: cloze en pantalla (oración con hueco) */}
                    {item.type === 'listen_missing_word' && e.display && (
                        <p className="text-2xl font-black text-gray-900 mb-6 leading-relaxed">{e.display}</p>
                    )}

                    {/* text_mc: enunciado a traducir */}
                    {item.type === 'text_mc' && e.prompt && <p className="text-2xl font-black text-gray-900 mb-6">{e.prompt}</p>}

                    {/* fill_blank: oración con hueco interactivo */}
                    {item.type === 'fill_blank' && (
                        <p className="text-2xl font-black text-gray-900 mb-8 leading-relaxed">
                            {e.before}<span className="inline-block min-w-[80px] border-b-4 border-gray-200 text-center text-[#632EB0]">{typeof raw === 'number' ? e.options[raw as number] : ' '}</span>{e.after}
                        </p>
                    )}

                    {/* multi_select: prompt explicativo */}
                    {item.type === 'multi_select' && e.prompt && <p className="text-lg font-black text-gray-700 mb-4">{e.prompt}</p>}

                    {/* Opción múltiple */}
                    {(MC_TYPES.includes(item.type) || item.type === 'fill_blank') && (
                        <div className={`grid ${item.type === 'minimal_pairs' || item.type === 'listen_missing_word' ? 'grid-cols-2' : ''} gap-3`}>
                            {(e.options as string[]).map((o, i) => (
                                <motion.button key={i} whileTap={frozen ? undefined : { scale: 0.97 }} disabled={frozen}
                                    onClick={() => { setRaw(i); if (SPEAK_OPTION_TYPES.includes(item.type)) say(o); }}
                                    className={`p-4 rounded-2xl border-2 font-black text-left transition-colors ${optClass(i)}`}>
                                    {o}
                                </motion.button>
                            ))}
                        </div>
                    )}

                    {/* multi_select */}
                    {item.type === 'multi_select' && (
                        <div className="grid grid-cols-2 gap-3">
                            {(e.options as { text: string }[]).map((o, i) => {
                                const sel = Array.isArray(raw) && (raw as number[]).includes(i);
                                return (
                                    <motion.button key={i} whileTap={frozen ? undefined : { scale: 0.97 }} disabled={frozen}
                                        onClick={() => { const cur = Array.isArray(raw) ? (raw as number[]) : []; setRaw(sel ? cur.filter((x) => x !== i) : [...cur, i]); }}
                                        className={`p-4 rounded-2xl border-2 font-black flex items-center justify-between transition-colors ${sel ? 'border-[#632EB0] bg-purple-50 text-[#632EB0]' : 'border-gray-200 text-gray-800'}`}>
                                        {o.text} {sel && <Check className="w-4 h-4" />}
                                    </motion.button>
                                );
                            })}
                        </div>
                    )}

                    {/* word_bank / listen_build */}
                    {(item.type === 'word_bank' || item.type === 'listen_build') && (
                        <TileBuilder key={item.id} item={item} frozen={frozen} onChange={setRaw} />
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Barra inferior: feedback o "Comprobar" (centrada) */}
            <div className="fixed bottom-0 inset-x-0 z-20">
                <AnimatePresence mode="wait">
                    {feedback ? (
                        <motion.div key="fb" initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }} transition={{ type: 'spring', stiffness: 260, damping: 26 }}
                            className={`${feedback.correct ? 'bg-[#d7ffb8]' : 'bg-red-50'} border-t-2 ${feedback.correct ? 'border-[#b6e89a]' : 'border-red-200'} px-4 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]`}>
                            <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <span className={`w-11 h-11 rounded-full flex items-center justify-center ${feedback.correct ? 'bg-[#58a700] text-white' : 'bg-red-400 text-white'}`}>
                                        {feedback.correct ? <Check className="w-6 h-6" /> : <X className="w-6 h-6" />}
                                    </span>
                                    <p className={`font-black ${feedback.correct ? 'text-[#3a6b00]' : 'text-red-600'}`}>{feedback.msg}</p>
                                </div>
                                <button onClick={continueNext} className={`font-black px-7 py-3.5 rounded-2xl active:scale-95 ${feedback.correct ? 'bg-[#58a700] text-white shadow-[0_4px_0_#3a6b00]' : 'bg-red-500 text-white shadow-[0_4px_0_#b91c1c]'}`}>
                                    Continuar
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="submit" className="border-t border-gray-100 bg-white px-4 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
                            <div className="max-w-xl mx-auto">
                                <button onClick={submit} disabled={!canSubmit || submitting}
                                    className={`w-full py-4 rounded-2xl font-black uppercase tracking-wide transition-all active:scale-[0.98] inline-flex items-center justify-center gap-2 ${!canSubmit || submitting ? 'bg-gray-100 text-gray-300' : 'bg-[#88e04f] text-[#1a1a1a] shadow-[0_4px_0_#6dc536]'}`}>
                                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Comprobar'}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TileBuilder({ item, frozen, onChange }: { item: Item; frozen: boolean; onChange: (raw: string[]) => void }) {
    const e = item.content;
    const tiles = useRef(shuffle((((e.tiles || e.answer) as string[]) || []).map((w: string, i: number) => ({ id: i, w })))).current;
    const [built, setBuilt] = useState<number[]>([]);
    const used = new Set(built);
    const set = (b: number[]) => { setBuilt(b); onChange(b.map((id) => tiles.find((t) => t.id === id)!.w)); };
    return (
        <div>
            {e.prompt && <p className="text-sm font-bold text-gray-400 mb-4">{e.prompt}</p>}
            <div className="min-h-[56px] border-b-2 border-gray-100 flex flex-wrap gap-2 pb-3 mb-6">
                {built.map((id) => <button key={id} disabled={frozen} onClick={() => set(built.filter((b) => b !== id))} className="px-3 py-2 rounded-xl bg-[#632EB0] text-white font-black">{tiles.find((t) => t.id === id)!.w}</button>)}
            </div>
            <div className="flex flex-wrap gap-2">
                {tiles.map((t) => <button key={t.id} disabled={frozen || used.has(t.id)} onClick={() => { say(t.w); set([...built, t.id]); }} className={`px-3 py-2 rounded-xl border-2 font-black ${used.has(t.id) ? 'border-gray-100 text-gray-200' : 'border-gray-200 text-gray-800'}`}>{t.w}</button>)}
            </div>
        </div>
    );
}
