'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Pickaxe, X, Loader2, RotateCcw, Volume2, Star, Coins, Gem, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Mascot from '@/components/lesson/Mascot';
import { playAudio, playUrl, loadAudioManifest, stopAudio, playSfx } from '@/lib/lessonAudio';

const say = (t: string) => playAudio(t, 'narrator');
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Item = { id: string; type: string; content: any };
type Result = { correct: number; total: number; xpEarned: number; coinsEarned: number; capReached: boolean; practice?: boolean };
type Step = 'loading' | 'error' | 'playing' | 'finishing' | 'result';

const AUDIO_TYPES = ['audio_mc', 'listen_missing_word', 'minimal_pairs'];
const LIVES_MAX = 3;

export default function CuevaGame() {
    const [dev] = useState(() => typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('dev') === '1');
    const [step, setStep] = useState<Step>('loading');
    const [items, setItems] = useState<Item[]>([]);
    const [idx, setIdx] = useState(0);
    const [lives, setLives] = useState(LIVES_MAX);
    const [depth, setDepth] = useState(0);
    const [gems, setGems] = useState(0);
    const [sel, setSel] = useState<number[]>([]);
    const [outcome, setOutcome] = useState<null | 'mined' | 'fail'>(null);
    const [checking, setChecking] = useState(false);
    const [result, setResult] = useState<Result | null>(null);
    const answersRef = useRef<Record<string, unknown>>({});
    const livesRef = useRef(LIVES_MAX);
    const depthRef = useRef(0);

    useEffect(() => { loadAudioManifest(); void load(); return () => stopAudio(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

    async function load() {
        setStep('loading'); answersRef.current = {}; livesRef.current = LIVES_MAX; depthRef.current = 0;
        setIdx(0); setLives(LIVES_MAX); setDepth(0); setGems(0); setSel([]); setOutcome(null); setResult(null);
        try {
            const r = await fetch('/api/games/round', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ game: 'cueva' }) });
            if (!r.ok) { setStep('error'); return; }
            const d = await r.json();
            if (!d.items?.length) { setStep('error'); return; }
            setItems(d.items); setStep('playing');
        } catch { setStep('error'); }
    }

    const item = items[idx];
    const e = item?.content ?? {};
    const options: string[] = e.options ?? [];
    const isMulti = item?.type === 'multi_select';

    // Audio del bloque al aparecer.
    useEffect(() => {
        if (step !== 'playing' || !item) return;
        setSel([]); setOutcome(null);
        if (AUDIO_TYPES.includes(item.type) && e.audioUrl) { const t = setTimeout(() => playUrl(e.audioUrl), 250); return () => clearTimeout(t); }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idx, step]);

    const toggle = (i: number) => {
        if (outcome || checking) return;
        if (isMulti) setSel((s) => s.includes(i) ? s.filter((x) => x !== i) : [...s, i]);
        else setSel([i]);
    };

    async function mine() {
        if (checking || outcome || !item || !sel.length) return;
        setChecking(true);
        const raw: unknown = isMulti ? sel : sel[0];
        answersRef.current[item.id] = raw;
        try {
            const r = await fetch('/api/games/check', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: item.id, raw }) });
            const d = await r.json();
            if (d.correct) {
                playSfx('correct');
                depthRef.current += 8; setDepth(depthRef.current); setGems((g) => g + 1);
                setOutcome('mined');
            } else {
                playSfx('wrong');
                livesRef.current = Math.max(0, livesRef.current - 1); setLives(livesRef.current);
                depthRef.current += 2; setDepth(depthRef.current);
                setOutcome('fail');
            }
            setTimeout(next, 950);
        } catch { setOutcome('fail'); setTimeout(next, 950); }
        finally { setChecking(false); }
    }
    function next() {
        stopAudio(); setOutcome(null); setSel([]);
        if (livesRef.current <= 0 || idx + 1 >= items.length) { void finish(); return; }
        setIdx((i) => i + 1);
    }
    async function finish() {
        setStep('finishing');
        const answers = items.map((it) => ({ id: it.id, raw: answersRef.current[it.id] ?? -1 }));
        try {
            const r = await fetch('/api/games/finish', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ game: 'cueva', answers, practice: dev }) });
            const d = await r.json();
            if (r.ok) { setResult(d); setStep('result'); } else { setStep('error'); }
        } catch { setStep('error'); }
    }

    if (step === 'loading' || step === 'finishing') {
        return (
            <div className="min-h-screen bg-[#0d0b14] flex flex-col items-center justify-center gap-4 text-center px-6">
                <Pickaxe className="w-12 h-12 text-purple-300 animate-bounce" />
                {step === 'finishing' && <p className="text-purple-100 font-black text-lg">Pesando las gemas…</p>}
                <Loader2 className="w-6 h-6 text-purple-300 animate-spin" />
            </div>
        );
    }
    if (step === 'error') {
        return (
            <div className="min-h-screen bg-[#0d0b14] flex flex-col items-center justify-center gap-5 text-center px-6">
                <Mascot character="apicultor" mood="sad" className="w-24 h-24" />
                <p className="text-purple-100 font-black text-lg">Se derrumbó la cueva</p>
                <button onClick={() => void load()} className="inline-flex items-center gap-2 bg-purple-400 text-[#0d0b14] font-black px-8 py-3.5 rounded-2xl active:scale-95"><RotateCcw className="w-5 h-5" /> Reintentar</button>
                <Link href="/portal-alumno/dashboard/juegos" className="text-purple-200/60 font-bold text-sm">Volver a juegos</Link>
            </div>
        );
    }
    if (step === 'result' && result) {
        return (
            <div className="min-h-screen bg-[#0d0b14] flex flex-col items-center justify-center gap-5 text-center px-6">
                <Mascot character="apicultor" mood="happy" className="w-32 h-32" />
                <h2 className="text-3xl font-black text-purple-100">¡Saliste de la cueva!</h2>
                <p className="text-purple-200/80 font-black">Profundidad: {depthRef.current} m · {result.correct}/{result.total} bloques</p>
                <div className="flex gap-3">
                    <div className="bg-[#1a1626] border border-purple-500/20 rounded-2xl px-6 py-3 flex flex-col items-center"><Star className="w-5 h-5 text-blue-300 mb-1" /><span className="text-2xl font-black text-purple-100">+{result.xpEarned}</span><span className="text-[10px] font-black text-purple-200/50 uppercase">XP</span></div>
                    <div className="bg-[#1a1626] border border-purple-500/20 rounded-2xl px-6 py-3 flex flex-col items-center"><Coins className="w-5 h-5 text-amber-300 mb-1" /><span className="text-2xl font-black text-purple-100">+{result.coinsEarned}</span><span className="text-[10px] font-black text-purple-200/50 uppercase">Monedas</span></div>
                </div>
                {result.practice && <p className="text-[11px] text-amber-300 font-black uppercase tracking-widest">Modo dev · sin recompensa</p>}
                {result.capReached && !result.practice && <p className="text-[11px] text-purple-200/50 font-bold max-w-xs">Llegaste al tope de XP por juegos de hoy, ¡pero puedes seguir cavando!</p>}
                <div className="flex flex-col gap-2 w-full max-w-xs mt-2">
                    <button onClick={() => void load()} className="bg-purple-400 text-[#0d0b14] font-black py-3.5 rounded-2xl active:scale-95">Cavar otra vez</button>
                    <Link href="/portal-alumno/dashboard/juegos" className="text-purple-200/70 font-bold py-2">Volver a juegos</Link>
                </div>
            </div>
        );
    }

    // playing
    return (
        <div className="min-h-screen bg-gradient-to-b from-[#1a1626] to-[#0d0b14] flex flex-col pb-32">
            {/* HUD */}
            <div className="sticky top-0 z-10 bg-[#0d0b14]/90 backdrop-blur px-4 py-3 flex items-center gap-3">
                <Link href="/portal-alumno/dashboard/juegos" className="p-1 text-purple-200/60 hover:text-purple-100"><X className="w-6 h-6" /></Link>
                <div className="flex items-center gap-1">
                    {Array.from({ length: LIVES_MAX }).map((_, i) => (
                        <Pickaxe key={i} className={`w-5 h-5 ${i < lives ? 'text-purple-300' : 'text-white/15'}`} />
                    ))}
                </div>
                <div className="flex-1" />
                {dev && <span className="text-[9px] font-black text-amber-300 uppercase tracking-widest bg-amber-500/10 px-2 py-1 rounded-full">DEV</span>}
                <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-300"><Gem className="w-4 h-4" /> {gems}</span>
                <span className="text-xs font-black text-purple-200/70 tabular-nums">{depth}m</span>
            </div>

            <div className="max-w-xl mx-auto w-full px-4 py-4 flex-1 flex flex-col">
                {/* Bloque (la pregunta) */}
                <motion.div key={idx} initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                    className={`rounded-2xl border-2 p-4 mb-4 text-center transition-colors ${outcome === 'mined' ? 'border-emerald-400 bg-emerald-500/10' : outcome === 'fail' ? 'border-red-400 bg-red-500/10' : 'border-purple-500/30 bg-black/30'}`}>
                    <p className="text-[10px] font-black text-purple-300 uppercase tracking-widest mb-1">Bloque {idx + 1}/{items.length}</p>
                    {AUDIO_TYPES.includes(item.type) && e.audioUrl && (
                        <button onClick={() => playUrl(e.audioUrl)} className="inline-flex items-center gap-2 bg-purple-500/15 text-purple-200 font-black px-5 py-2.5 rounded-2xl active:scale-95 mb-2"><Volume2 className="w-5 h-5" /> Escuchar</button>
                    )}
                    {item.type === 'audio_mc' && e.prompt && <p className="text-lg font-black text-purple-50">{e.prompt}</p>}
                    {item.type === 'listen_missing_word' && e.display && <p className="text-xl font-black text-purple-50">{e.display}</p>}
                    {item.type === 'minimal_pairs' && <p className="text-sm font-bold text-purple-200/60">¿Cuál palabra escuchaste?</p>}
                    {item.type === 'text_mc' && e.prompt && <p className="text-xl font-black text-purple-50">{e.prompt}</p>}
                    {item.type === 'fill_blank' && <p className="text-xl font-black text-purple-50">{e.before}<span className="text-amber-300">_____</span>{e.after}</p>}
                    {item.type === 'multi_select' && <p className="text-base font-black text-purple-50">{e.prompt || 'Selecciona todas las correctas'}</p>}
                    {e.instruction && item.type === 'multi_select' && <p className="text-[11px] font-bold text-purple-200/50 mt-1">{e.instruction}</p>}
                </motion.div>

                {/* Opciones */}
                <div className="grid grid-cols-2 gap-2.5">
                    {options.map((o, i) => {
                        const on = sel.includes(i);
                        const cls = outcome
                            ? (on ? (outcome === 'mined' ? 'border-emerald-400 bg-emerald-500/20 text-emerald-100' : 'border-red-400 bg-red-500/20 text-red-100') : 'border-white/10 text-white/40')
                            : (on ? 'border-purple-300 bg-purple-500/25 text-purple-50' : 'border-white/15 bg-white/5 text-purple-50 active:scale-95');
                        return (
                            <button key={i} onClick={() => toggle(i)} disabled={!!outcome || checking}
                                className={`p-4 rounded-2xl border-2 font-black text-center transition-all inline-flex items-center justify-center gap-1.5 ${cls}`}>
                                {o} {isMulti && on && <Check className="w-4 h-4" />}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Barra inferior: Minar */}
            <div className="fixed bottom-0 inset-x-0 z-20">
                <AnimatePresence mode="wait">
                    {outcome === 'mined' ? (
                        <motion.div key="ok" initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }} className="bg-[#3a6b00] px-4 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
                            <div className="max-w-xl mx-auto flex items-center gap-3 text-white font-black"><Gem className="w-6 h-6" /> ¡Bloque minado! +1 gema 💎</div>
                        </motion.div>
                    ) : outcome === 'fail' ? (
                        <motion.div key="no" initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }} className="bg-[#7a2e2e] px-4 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
                            <div className="max-w-xl mx-auto flex items-center gap-3 text-white font-black"><Pickaxe className="w-6 h-6" /> ¡Se rompió un pico!</div>
                        </motion.div>
                    ) : (
                        <motion.div key="mine" className="bg-[#0d0b14] border-t border-purple-500/20 px-4 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
                            <div className="max-w-xl mx-auto">
                                <button onClick={mine} disabled={!sel.length || checking}
                                    className={`w-full py-4 rounded-2xl font-black uppercase tracking-wide inline-flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${!sel.length || checking ? 'bg-[#1a1626] text-purple-200/30' : 'bg-purple-400 text-[#0d0b14] border-b-4 border-purple-700'}`}>
                                    {checking ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Pickaxe className="w-5 h-5" /> Minar el bloque</>}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
