'use client';

import React, { useEffect, useState } from 'react';
import { Volume2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MobileSubHeader from '@/components/dashboard/MobileSubHeader';
import { playAudio, loadAudioManifest, playPhonemeSound } from '@/lib/lessonAudio';
import { PHONEMES, PH_GROUPS, type Phoneme } from '@/lib/phonemes';

const say = (w: string) => playAudio(w, 'narrator');           // palabra completa

function Highlighted({ word, part, className }: { word: string; part?: string; className: string }) {
    if (!part) return <>{word}</>;
    const i = word.toLowerCase().indexOf(part.toLowerCase());
    if (i === -1) return <>{word}</>;
    return (
        <>
            {word.slice(0, i)}<span className={className}>{word.slice(i, i + part.length)}</span>{word.slice(i + part.length)}
        </>
    );
}

export default function LetrasPage() {
    const [sel, setSel] = useState<Phoneme | null>(null);
    useEffect(() => { loadAudioManifest(); }, []);

    const open = (p: Phoneme) => { playPhonemeSound(p.ipa, p.keyword); setSel(p); }; // tap = SONIDO del símbolo

    return (
        <div className="flex flex-col w-full pb-32 bg-white">
            <MobileSubHeader />

            <div className="max-w-4xl mx-auto w-full px-4 pt-6 md:pt-10">
                {/* intro */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-[#632EB0] flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/20">
                        <span className="text-2xl font-serif text-white">æ</span>
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Tabla Fonética</h1>
                        <p className="text-sm text-gray-500 font-bold">Toca un sonido para escucharlo y ver ejemplos.</p>
                    </div>
                </div>

                {PH_GROUPS.map((g) => {
                    const items = PHONEMES.filter((p) => p.category === g.category);
                    if (!items.length) return null;
                    return (
                        <section key={g.category} className={`mb-6 rounded-3xl border ${g.border} ${g.bg} p-4`}>
                            <div className="flex items-center justify-between mb-3 px-1">
                                <div>
                                    <h2 className={`text-lg font-black ${g.text}`}>{g.title}</h2>
                                    <p className="text-[11px] font-bold text-gray-400">{g.subtitle}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {g.badge && <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-full bg-white/70 ${g.text}`}>{g.badge}</span>}
                                    <span className="text-[10px] font-black text-gray-400">{items.length} sonidos</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                                {items.map((p) => (
                                    <button key={p.ipa} onClick={() => open(p)}
                                        className={`group aspect-square rounded-xl border-2 ${g.tile} border-b-4 flex flex-col items-center justify-center gap-0.5 active:scale-95 active:border-b-2 active:translate-y-0.5 transition-all`}>
                                        <span className="text-2xl md:text-3xl font-serif text-gray-900 leading-none">{p.ipa}</span>
                                        <span className="text-[10px] md:text-[11px] font-bold text-gray-600 leading-none">
                                            <Highlighted word={p.keyword} part={p.keywordHighlight} className={`font-black ${g.text}`} />
                                        </span>
                                        <Volume2 className="w-3 h-3 text-gray-400 group-active:text-gray-600 mt-0.5" />
                                    </button>
                                ))}
                            </div>
                        </section>
                    );
                })}

                <p className="text-center text-[11px] text-gray-400 font-bold mt-2">Inglés americano · {PHONEMES.length} sonidos</p>
            </div>

            {/* Detail bottom-sheet */}
            <AnimatePresence>
                {sel && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSel(null)} className="fixed inset-0 bg-black/40 z-[60]" />
                        <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 320 }}
                            className="fixed bottom-0 inset-x-0 z-[70] bg-white rounded-t-[2.5rem] p-6 pb-10 shadow-2xl max-w-lg mx-auto">
                            {(() => {
                                const g = PH_GROUPS.find((x) => x.category === sel.category)!;
                                return (
                                    <>
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-16 h-16 rounded-2xl border-2 ${g.tile} flex items-center justify-center`}>
                                                    <span className="text-3xl font-serif text-gray-900">{sel.ipa}</span>
                                                </div>
                                                <div>
                                                    <p className={`text-xs font-black uppercase tracking-wide ${g.text}`}>{g.title}</p>
                                                    {g.badge && <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-100 text-gray-500`}>{g.badge}</span>}
                                                </div>
                                            </div>
                                            <button onClick={() => setSel(null)} className="p-2 rounded-full hover:bg-gray-100 text-gray-400"><X className="w-5 h-5" /></button>
                                        </div>

                                        {/* PROTAGONISTA: el sonido del símbolo */}
                                        <button onClick={() => playPhonemeSound(sel.ipa, sel.keyword)} className="w-full flex items-center justify-center gap-3 bg-[#632EB0] text-white font-black text-2xl py-5 rounded-2xl active:scale-[0.98] mb-4">
                                            <Volume2 className="w-7 h-7" /> Sonido «{sel.ipa}»
                                        </button>

                                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-wide mb-2">Palabra y ejemplos (toca para oír)</p>
                                        <div className="flex flex-wrap gap-2">
                                            <button onClick={() => say(sel.keyword)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 border-[#632EB0]/40 bg-purple-50 font-black text-[#632EB0] active:scale-95">
                                                <Volume2 className="w-4 h-4" /> <Highlighted word={sel.keyword} part={sel.keywordHighlight} className="underline decoration-[#632EB0]/50 decoration-2" />
                                            </button>
                                            {sel.examples.map((w) => (
                                                <button key={w} onClick={() => say(w)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 border-gray-200 font-bold text-gray-800 active:scale-95 hover:border-[#632EB0]">
                                                    <Volume2 className="w-4 h-4 text-gray-400" /> {w}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                );
                            })()}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
