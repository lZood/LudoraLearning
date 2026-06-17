'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { Swords, X, Loader2, RotateCcw, Volume2, Star, Coins, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Mascot from '@/components/lesson/Mascot';
import { playAudio, playUrl, loadAudioManifest, stopAudio, playSfx } from '@/lib/lessonAudio';

const say = (t: string) => playAudio(t, 'narrator');
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Item = { id: string; type: string; content: any };
type Result = { correct: number; total: number; xpEarned: number; coinsEarned: number; capReached: boolean };
type Step = 'loading' | 'error' | 'playing' | 'finishing' | 'result';

const MOBS = ['🧟', '🐗', '💀', '🕷️', '👹']; // mobs nocturnos
const AUDIO_TYPES = ['audio_mc', 'listen_missing_word', 'minimal_pairs'];
const HEARTS_MAX = 3;
const timeForMob = (i: number) => Math.max(4500, 9000 - i * 450); // ms; se acorta con cada mob

export default function AldeaGame() {
    const [step, setStep] = useState<Step>('loading');
    const [items, setItems] = useState<Item[]>([]);
    const [idx, setIdx] = useState(0);
    const [hearts, setHearts] = useState(HEARTS_MAX);
    const [combo, setCombo] = useState(0);
    const [timeLeft, setTimeLeft] = useState(9000);
    const [phase, setPhase] = useState<'asking' | 'resolving'>('asking');
    const [outcome, setOutcome] = useState<null | { kind: 'defeat' | 'hit'; pick: number }>(null);
    const [result, setResult] = useState<Result | null>(null);
    const answersRef = useRef<Record<string, number>>({});
    const heartsRef = useRef(HEARTS_MAX);

    useEffect(() => { loadAudioManifest(); void load(); return () => stopAudio(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

    async function load() {
        setStep('loading'); answersRef.current = {}; heartsRef.current = HEARTS_MAX;
        setIdx(0); setHearts(HEARTS_MAX); setCombo(0); setOutcome(null); setResult(null); setPhase('asking');
        try {
            const r = await fetch('/api/games/round', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ game: 'aldea' }) });
            if (!r.ok) { setStep('error'); return; }
            const d = await r.json();
            if (!d.items?.length) { setStep('error'); return; }
            setItems(d.items); setStep('playing');
        } catch { setStep('error'); }
    }

    const item = items[idx];

    // Nuevo mob: reinicia el reloj, reproduce el audio si aplica.
    useEffect(() => {
        if (step !== 'playing' || !item) return;
        setPhase('asking'); setOutcome(null); setTimeLeft(timeForMob(idx));
        if (AUDIO_TYPES.includes(item.type) && item.content?.audioUrl) { const t = setTimeout(() => playUrl(item.content.audioUrl), 250); return () => clearTimeout(t); }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idx, step]);

    const advance = useCallback(() => {
        stopAudio();
        if (heartsRef.current <= 0) { void finish(); return; }
        if (idx + 1 >= items.length) { void finish(); return; }
        setIdx((i) => i + 1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idx, items.length]);

    const hit = useCallback((pick: number) => {
        heartsRef.current = Math.max(0, heartsRef.current - 1);
        setHearts(heartsRef.current); setCombo(0); playSfx('wrong');
        setOutcome({ kind: 'hit', pick }); setPhase('resolving');
        setTimeout(advance, 1100);
    }, [advance]);

    // Cuenta regresiva del mob actual.
    useEffect(() => {
        if (step !== 'playing' || phase !== 'asking') return;
        if (timeLeft <= 0) { if (item) answersRef.current[item.id] = -1; hit(-1); return; }
        const t = setTimeout(() => setTimeLeft((tl) => tl - 100), 100);
        return () => clearTimeout(t);
    }, [timeLeft, phase, step, item, hit]);

    async function answer(pick: number) {
        if (phase !== 'asking' || !item) return;
        setPhase('resolving');
        answersRef.current[item.id] = pick;
        try {
            const r = await fetch('/api/games/check', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: item.id, raw: pick }) });
            const d = await r.json();
            if (d.correct) {
                setCombo((c) => c + 1); playSfx('correct');
                setOutcome({ kind: 'defeat', pick });
                setTimeout(advance, 850);
            } else { hit(pick); }
        } catch { hit(pick); }
    }

    async function finish() {
        setStep('finishing');
        const answers = items.map((it) => ({ id: it.id, raw: answersRef.current[it.id] ?? -1 }));
        try {
            const r = await fetch('/api/games/finish', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ game: 'aldea', answers }) });
            const d = await r.json();
            if (r.ok) { setResult(d); setStep('result'); } else { setStep('error'); }
        } catch { setStep('error'); }
    }

    if (step === 'loading' || step === 'finishing') {
        return (
            <div className="min-h-screen bg-[#0b1220] flex flex-col items-center justify-center gap-4 text-center px-6">
                <Swords className="w-12 h-12 text-emerald-300 animate-pulse" />
                {step === 'finishing' && <p className="text-emerald-100 font-black text-lg">Contando el botín…</p>}
                <Loader2 className="w-6 h-6 text-emerald-300 animate-spin" />
            </div>
        );
    }
    if (step === 'error') {
        return (
            <div className="min-h-screen bg-[#0b1220] flex flex-col items-center justify-center gap-5 text-center px-6">
                <Mascot character="apicultor" mood="sad" className="w-24 h-24" />
                <p className="text-emerald-100 font-black text-lg">La aldea quedó en silencio</p>
                <button onClick={() => void load()} className="inline-flex items-center gap-2 bg-emerald-400 text-[#0b1220] font-black px-8 py-3.5 rounded-2xl active:scale-95"><RotateCcw className="w-5 h-5" /> Reintentar</button>
                <Link href="/portal-alumno/dashboard/juegos" className="text-emerald-200/60 font-bold text-sm">Volver a juegos</Link>
            </div>
        );
    }
    if (step === 'result' && result) {
        const survived = heartsRef.current > 0;
        return (
            <div className="min-h-screen bg-[#0b1220] flex flex-col items-center justify-center gap-5 text-center px-6">
                <Mascot character="apicultor" mood={survived ? 'happy' : 'sad'} className="w-32 h-32" />
                <h2 className="text-3xl font-black text-emerald-100">{survived ? '¡Aldea defendida!' : '¡Cayó la aldea!'}</h2>
                <p className="text-emerald-200/80 font-black">{result.correct}/{result.total} mobs derrotados</p>
                <div className="flex gap-3">
                    <div className="bg-[#152033] border border-emerald-500/20 rounded-2xl px-6 py-3 flex flex-col items-center"><Star className="w-5 h-5 text-blue-300 mb-1" /><span className="text-2xl font-black text-emerald-100">+{result.xpEarned}</span><span className="text-[10px] font-black text-emerald-200/50 uppercase">XP</span></div>
                    <div className="bg-[#152033] border border-emerald-500/20 rounded-2xl px-6 py-3 flex flex-col items-center"><Coins className="w-5 h-5 text-amber-300 mb-1" /><span className="text-2xl font-black text-emerald-100">+{result.coinsEarned}</span><span className="text-[10px] font-black text-emerald-200/50 uppercase">Monedas</span></div>
                </div>
                {result.capReached && <p className="text-[11px] text-emerald-200/50 font-bold max-w-xs">Llegaste al tope de XP por juegos de hoy, ¡pero puedes seguir defendiendo!</p>}
                <div className="flex flex-col gap-2 w-full max-w-xs mt-2">
                    <button onClick={() => void load()} className="bg-emerald-400 text-[#0b1220] font-black py-3.5 rounded-2xl active:scale-95">Jugar otra vez</button>
                    <Link href="/portal-alumno/dashboard/juegos" className="text-emerald-200/70 font-bold py-2">Volver a juegos</Link>
                </div>
            </div>
        );
    }

    // playing
    const e = item?.content ?? {};
    const options: string[] = e.options ?? [];
    const wave = Math.floor(idx / 4) + 1;
    const timePct = Math.max(0, Math.min(100, (timeLeft / timeForMob(idx)) * 100));
    const mob = MOBS[idx % MOBS.length];
    const danger = timePct < 35;

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0b1220] to-[#16233b] flex flex-col pb-6">
            {/* HUD */}
            <div className="sticky top-0 z-10 bg-[#0b1220]/90 backdrop-blur px-4 py-3 flex items-center gap-3">
                <Link href="/portal-alumno/dashboard/juegos" className="p-1 text-emerald-200/60 hover:text-emerald-100"><X className="w-6 h-6" /></Link>
                <div className="flex items-center gap-1">
                    {Array.from({ length: HEARTS_MAX }).map((_, i) => (
                        <Heart key={i} className={`w-5 h-5 ${i < hearts ? 'text-red-500 fill-red-500' : 'text-white/15'}`} />
                    ))}
                </div>
                <span className="text-xs font-black text-emerald-200/70 ml-1">Oleada {wave}</span>
                <div className="flex-1" />
                {combo > 1 && <span className="text-xs font-black text-amber-300">🔥 x{combo}</span>}
                <span className="text-[11px] font-black text-emerald-200/50 tabular-nums">{idx + 1}/{items.length}</span>
            </div>

            {/* Campo: el mob avanza hacia la aldea (derecha); la barra es el tiempo */}
            <div className="px-4 pt-4">
                <div className="relative h-20 rounded-2xl bg-black/30 border border-white/5 overflow-hidden">
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 text-3xl">🏠</div>
                    <motion.div
                        className="absolute top-1/2 -translate-y-1/2 text-3xl"
                        animate={{ left: `${6 + (100 - timePct) * 0.8}%`, scale: outcome?.kind === 'defeat' ? [1, 1.4, 0] : 1, opacity: outcome?.kind === 'defeat' ? [1, 1, 0] : 1, rotate: outcome?.kind === 'hit' ? [0, -8, 8, 0] : 0 }}
                        transition={{ left: { ease: 'linear', duration: 0.12 }, default: { duration: 0.5 } }}
                    >
                        {outcome?.kind === 'defeat' ? '💥' : mob}
                    </motion.div>
                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/40">
                        <div className={`h-full transition-all ${danger ? 'bg-red-500' : 'bg-emerald-400'}`} style={{ width: `${timePct}%` }} />
                    </div>
                </div>
            </div>

            <div className="max-w-xl mx-auto w-full px-4 py-4 flex-1 flex flex-col">
                {/* Reto */}
                <div className="mb-4 text-center">
                    {AUDIO_TYPES.includes(item.type) && e.audioUrl && (
                        <button onClick={() => playUrl(e.audioUrl)} className="inline-flex items-center gap-2 bg-emerald-500/15 text-emerald-200 font-black px-5 py-3 rounded-2xl active:scale-95 mb-2"><Volume2 className="w-5 h-5" /> Escuchar</button>
                    )}
                    {item.type === 'audio_mc' && e.prompt && <p className="text-lg font-black text-emerald-50">{e.prompt}</p>}
                    {item.type === 'listen_missing_word' && e.display && <p className="text-xl font-black text-emerald-50">{e.display}</p>}
                    {item.type === 'minimal_pairs' && <p className="text-sm font-bold text-emerald-200/60">¿Cuál palabra escuchaste?</p>}
                    {item.type === 'text_mc' && e.prompt && <p className="text-xl font-black text-emerald-50">{e.prompt}</p>}
                    {item.type === 'fill_blank' && <p className="text-xl font-black text-emerald-50">{e.before}<span className="text-amber-300">_____</span>{e.after}</p>}
                    {e.instruction && !e.prompt && item.type !== 'fill_blank' && item.type !== 'listen_missing_word' && <p className="text-sm font-bold text-emerald-200/60 mt-1">{e.instruction}</p>}
                </div>

                {/* Opciones */}
                <div className="grid grid-cols-2 gap-2.5 mt-auto">
                    {options.map((o, i) => {
                        const picked = outcome?.pick === i;
                        const cls = outcome
                            ? (picked ? (outcome.kind === 'defeat' ? 'border-emerald-400 bg-emerald-500/20 text-emerald-100' : 'border-red-400 bg-red-500/20 text-red-100') : 'border-white/10 text-white/40')
                            : 'border-white/15 bg-white/5 text-emerald-50 active:scale-95';
                        return (
                            <button key={i} onClick={() => answer(i)} disabled={phase !== 'asking'}
                                className={`p-4 rounded-2xl border-2 font-black text-center transition-all ${cls}`}>
                                {o}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
