'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Volume2, Loader2, Check, RotateCcw } from 'lucide-react';
import Mascot from '@/components/lesson/Mascot';
import { playAudio, loadAudioManifest, stopAudio } from '@/lib/lessonAudio';

const say = (t: string) => playAudio(t, 'narrator');
function shuffle<T>(a: T[]): T[] { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Item = { id: string; skill: string; type: string; content: any };
type Answer = { id: string; raw: unknown };

const MC_TYPES = ['text_mc', 'audio_mc', 'who_said_it', 'listen_missing_word', 'minimal_pairs'];
const AUDIO_TYPES = ['audio_mc', 'listen_missing_word', 'minimal_pairs'];

export default function DiagnosticPlayer({ theta0, onFinish }: { theta0: number; onFinish: (history: Answer[]) => void }) {
    const [item, setItem] = useState<Item | null>(null);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [raw, setRaw] = useState<unknown>(null); // respuesta cruda actual
    const [error, setError] = useState(false); // fallo de red/servidor (≠ diagnóstica terminada)
    const historyRef = useRef<Answer[]>([]);
    const APPROX = 10; // ítems aproximados (para la barra)

    useEffect(() => { loadAudioManifest(); void fetchNext(); return () => stopAudio(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

    async function fetchNext() {
        setLoading(true); setRaw(null); setError(false); stopAudio();
        try {
            const r = await fetch('/api/placement/next', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ theta0, history: historyRef.current }) });
            if (!r.ok) { setError(true); setLoading(false); return; } // 429/500: NO es "terminado"
            const d = await r.json();
            if (d.done === true || !d.item) { onFinish(historyRef.current); return; } // solo termina si el servidor lo dice
            setItem(d.item); setCount(d.count); setLoading(false);
        } catch { setError(true); setLoading(false); } // error de red: ofrecer reintento, no finalizar con datos incompletos
    }
    function submit() {
        if (raw === null || (Array.isArray(raw) && !raw.length) || !item) return;
        historyRef.current = [...historyRef.current, { id: item.id, raw }];
        void fetchNext();
    }

    if (error) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-5 text-center px-6">
                <Mascot character="apicultor" mood="sad" className="w-24 h-24" />
                <p className="text-lg font-black text-gray-900">Se nos cayó la conexión</p>
                <p className="text-sm font-bold text-gray-400 max-w-xs -mt-3">No te preocupes, tu progreso está a salvo.</p>
                <button onClick={() => void fetchNext()} className="inline-flex items-center gap-2 bg-[#632EB0] text-white font-black px-8 py-3.5 rounded-2xl active:scale-95">
                    <RotateCcw className="w-5 h-5" /> Reintentar
                </button>
            </div>
        );
    }
    if (loading || !item) {
        return <div className="min-h-screen bg-white flex items-center justify-center"><Loader2 className="w-8 h-8 text-[#632EB0] animate-spin" /></div>;
    }
    const e = item.content;
    const canSubmit = raw !== null && !(Array.isArray(raw) && raw.length === 0);

    return (
        <div className="min-h-screen bg-white pb-28">
            <div className="sticky top-0 bg-white px-4 py-3 flex items-center gap-3">
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden" role="progressbar" aria-valuenow={count} aria-valuemin={0} aria-valuemax={APPROX}>
                    {/* Se capa al 95% hasta que el servidor confirma el fin (el total real es 8–12). */}
                    <div className="h-full bg-[#88e04f] rounded-full transition-all" style={{ width: `${Math.min(95, Math.round((count / APPROX) * 100))}%` }} />
                </div>
                <span className="text-xs font-black text-gray-400" aria-live="polite">Pregunta {count + 1}</span>
            </div>

            <div className="max-w-xl mx-auto px-4 py-6">
                <div className="flex items-start gap-3 mb-6">
                    <Mascot character="apicultor" mood="curious" className="w-16 h-16 shrink-0 -mt-1" />
                    <div className="relative flex-1 bg-white border-2 border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
                        <span className="absolute -left-[9px] top-4 w-3.5 h-3.5 bg-white border-l-2 border-b-2 border-gray-100 rotate-45" />
                        <p className="text-lg font-black text-gray-900 leading-snug">{e.instruction || 'Responde'}</p>
                    </div>
                </div>

                {/* Audio para tipos auditivos */}
                {(AUDIO_TYPES.includes(item.type) && e.audio) && (
                    <button onClick={() => say(e.audio)} className="mb-6 inline-flex items-center gap-3 bg-[#632EB0] text-white font-black px-6 py-4 rounded-2xl active:scale-95">
                        <Volume2 className="w-6 h-6" /> Reproducir
                    </button>
                )}

                {/* who_said_it: el target a buscar + opciones que suenan */}
                {item.type === 'who_said_it' && (
                    <div className="flex items-center gap-2 mb-3"><span className="text-sm font-bold text-gray-400">Busca quién dijo:</span><span className="bg-[#632EB0]/10 text-[#632EB0] font-black px-3 py-1.5 rounded-xl">{e.target}</span></div>
                )}

                {/* text_mc / complete-the-conversation prompt */}
                {item.type === 'text_mc' && e.prompt && <p className="text-2xl font-black text-gray-900 mb-6">{e.prompt}</p>}

                {/* fill_blank: oración con hueco */}
                {item.type === 'fill_blank' && (
                    <p className="text-2xl font-black text-gray-900 mb-8 leading-relaxed">
                        {e.before} <span className="inline-block min-w-[80px] border-b-4 border-gray-200 text-center text-[#632EB0]">{typeof raw === 'number' ? e.options[raw as number] : ' '}</span> {e.after}
                    </p>
                )}

                {/* Opción múltiple (incluye who_said_it y fill_blank) */}
                {MC_TYPES.includes(item.type) || item.type === 'fill_blank' ? (
                    <div className={`grid ${item.type === 'who_said_it' ? 'grid-cols-2' : ''} gap-3`}>
                        {(e.options as string[]).map((o, i) => (
                            <button key={i} onClick={() => { setRaw(i); if (item.type === 'who_said_it' || item.type === 'audio_mc' || item.type === 'listen_missing_word' || item.type === 'minimal_pairs') say(o); }} disabled={false}
                                className={`p-4 rounded-2xl border-2 font-black text-left transition-all ${raw === i ? 'border-[#632EB0] bg-purple-50 text-[#632EB0]' : 'border-gray-200 text-gray-800'}`}>
                                {o}
                            </button>
                        ))}
                    </div>
                ) : null}

                {/* multi_select */}
                {item.type === 'multi_select' && (
                    <div className="grid grid-cols-2 gap-3">
                        {(e.options as { text: string }[]).map((o, i) => {
                            const sel = Array.isArray(raw) && (raw as number[]).includes(i);
                            return (
                                <button key={i} onClick={() => { const cur = Array.isArray(raw) ? (raw as number[]) : []; setRaw(sel ? cur.filter((x) => x !== i) : [...cur, i]); }}
                                    className={`p-4 rounded-2xl border-2 font-black flex items-center justify-between transition-all ${sel ? 'border-[#632EB0] bg-purple-50 text-[#632EB0]' : 'border-gray-200 text-gray-800'}`}>
                                    {o.text} {sel && <Check className="w-4 h-4" />}
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* word_bank / listen_build: armar con fichas */}
                {(item.type === 'word_bank' || item.type === 'listen_build') && (
                    <TileBuilder key={item.id} item={item} onChange={setRaw} />
                )}
            </div>

            <div className="fixed bottom-0 inset-x-0 border-t border-gray-100 bg-white px-4 py-4">
                <div className="max-w-xl mx-auto">
                    <button onClick={submit} disabled={!canSubmit}
                        className={`w-full py-4 rounded-2xl font-black uppercase tracking-wide transition-all active:scale-[0.98] ${!canSubmit ? 'bg-gray-100 text-gray-300' : 'bg-[#88e04f] text-[#1a1a1a] shadow-[0_4px_0_#6dc536]'}`}>
                        Siguiente
                    </button>
                </div>
            </div>
        </div>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TileBuilder({ item, onChange }: { item: Item; onChange: (raw: string[]) => void }) {
    const e = item.content;
    // El servidor envía las fichas YA barajadas (e.tiles), nunca el orden correcto; re-barajamos por si acaso.
    const tiles = useRef(shuffle((((e.tiles || e.answer) as string[]) || []).map((w: string, i: number) => ({ id: i, w })))).current;
    const [built, setBuilt] = useState<number[]>([]);
    const used = new Set(built);
    const set = (b: number[]) => { setBuilt(b); onChange(b.map((id) => tiles.find((t) => t.id === id)!.w)); };
    return (
        <div>
            {item.type === 'listen_build' && e.audio && (
                <button onClick={() => say(e.audio)} className="mb-5 inline-flex items-center gap-3 bg-[#632EB0] text-white font-black px-6 py-4 rounded-2xl active:scale-95"><Volume2 className="w-6 h-6" /> Reproducir</button>
            )}
            {e.prompt && <p className="text-sm font-bold text-gray-400 mb-4">{e.prompt}</p>}
            <div className="min-h-[56px] border-b-2 border-gray-100 flex flex-wrap gap-2 pb-3 mb-6">
                {built.map((id) => <button key={id} onClick={() => set(built.filter((b) => b !== id))} className="px-3 py-2 rounded-xl bg-[#632EB0] text-white font-black">{tiles.find((t) => t.id === id)!.w}</button>)}
            </div>
            <div className="flex flex-wrap gap-2">
                {tiles.map((t) => <button key={t.id} disabled={used.has(t.id)} onClick={() => { say(t.w); set([...built, t.id]); }} className={`px-3 py-2 rounded-xl border-2 font-black ${used.has(t.id) ? 'border-gray-100 text-gray-200' : 'border-gray-200 text-gray-800'}`}>{t.w}</button>)}
            </div>
        </div>
    );
}
