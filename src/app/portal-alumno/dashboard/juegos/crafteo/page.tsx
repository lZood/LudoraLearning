'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Hammer, X, Loader2, RotateCcw, Volume2, Star, Coins, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Mascot from '@/components/lesson/Mascot';
import { playAudio, loadAudioManifest, stopAudio, playSfx } from '@/lib/lessonAudio';

const say = (t: string) => playAudio(t, 'narrator');
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Item = { id: string; type: string; content: any };
type Result = { correct: number; total: number; xpEarned: number; coinsEarned: number; capReached: boolean };
type Step = 'loading' | 'error' | 'playing' | 'finishing' | 'result';

export default function CrafteoGame() {
    const router = useRouter();
    const [step, setStep] = useState<Step>('loading');
    const [items, setItems] = useState<Item[]>([]);
    const [idx, setIdx] = useState(0);
    const [built, setBuilt] = useState<number[]>([]);
    const [fb, setFb] = useState<null | 'correct' | 'wrong'>(null);
    const [checking, setChecking] = useState(false);
    const [result, setResult] = useState<Result | null>(null);
    const answersRef = useRef<Record<string, string[]>>({});

    useEffect(() => { loadAudioManifest(); void load(); return () => stopAudio(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

    async function load() {
        setStep('loading'); answersRef.current = {}; setIdx(0); setBuilt([]); setFb(null); setResult(null);
        try {
            const r = await fetch('/api/games/round', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ game: 'crafteo' }) });
            if (!r.ok) { setStep('error'); return; }
            const d = await r.json();
            if (!d.items?.length) { setStep('error'); return; }
            setItems(d.items); setStep('playing');
        } catch { setStep('error'); }
    }

    const item = items[idx];
    const tiles: string[] = item?.content?.tiles ?? [];
    const used = new Set(built);
    const craftedWords = built.map((i) => tiles[i]);

    const add = (i: number) => { if (fb || used.has(i)) return; say(tiles[i]); setBuilt((b) => [...b, i]); };
    const remove = (i: number) => { if (fb) return; setBuilt((b) => b.filter((x) => x !== i)); };

    async function craft() {
        if (checking || built.length !== tiles.length || !item) return;
        setChecking(true);
        const raw = craftedWords;
        answersRef.current[item.id] = raw;
        try {
            const r = await fetch('/api/games/check', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: item.id, raw }) });
            const d = await r.json();
            const ok = !!d.correct;
            playSfx(ok ? 'correct' : 'wrong');
            setFb(ok ? 'correct' : 'wrong');
            if (ok) setTimeout(next, 950);
        } catch { setFb('wrong'); }
        finally { setChecking(false); }
    }
    function retry() { setFb(null); setBuilt([]); }
    function next() {
        setFb(null); setBuilt([]); stopAudio();
        if (idx + 1 >= items.length) { void finish(); return; }
        setIdx((i) => i + 1);
    }
    async function finish() {
        setStep('finishing');
        const answers = items.map((it) => ({ id: it.id, raw: answersRef.current[it.id] ?? [] }));
        try {
            const r = await fetch('/api/games/finish', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ game: 'crafteo', answers }) });
            const d = await r.json();
            if (r.ok) { setResult(d); setStep('result'); } else { setStep('error'); }
        } catch { setStep('error'); }
    }

    if (step === 'loading' || step === 'finishing') {
        return (
            <div className="min-h-screen bg-[#1d1410] flex flex-col items-center justify-center gap-4 text-center px-6">
                <Hammer className="w-12 h-12 text-amber-300 animate-bounce" />
                {step === 'finishing' && <p className="text-amber-100 font-black text-lg">Forjando tu recompensa…</p>}
                <Loader2 className="w-6 h-6 text-amber-300 animate-spin" />
            </div>
        );
    }
    if (step === 'error') {
        return (
            <div className="min-h-screen bg-[#1d1410] flex flex-col items-center justify-center gap-5 text-center px-6">
                <Mascot character="granjerita" mood="sad" className="w-24 h-24" />
                <p className="text-amber-100 font-black text-lg">Se atascó la mesa de crafteo</p>
                <button onClick={() => void load()} className="inline-flex items-center gap-2 bg-amber-400 text-[#1d1410] font-black px-8 py-3.5 rounded-2xl active:scale-95"><RotateCcw className="w-5 h-5" /> Reintentar</button>
                <Link href="/portal-alumno/dashboard/juegos" className="text-amber-200/60 font-bold text-sm">Volver a juegos</Link>
            </div>
        );
    }
    if (step === 'result' && result) {
        const pct = result.total ? Math.round((result.correct / result.total) * 100) : 0;
        return (
            <div className="min-h-screen bg-[#1d1410] flex flex-col items-center justify-center gap-5 text-center px-6">
                <Mascot character="granjerita" mood="happy" className="w-32 h-32" />
                <h2 className="text-3xl font-black text-amber-100">¡Crafteo completado!</h2>
                <p className="text-amber-200/80 font-black">{result.correct}/{result.total} oraciones · {pct}%</p>
                <div className="flex gap-3">
                    <div className="bg-[#2a1d15] border border-amber-500/20 rounded-2xl px-6 py-3 flex flex-col items-center"><Star className="w-5 h-5 text-blue-300 mb-1" /><span className="text-2xl font-black text-amber-100">+{result.xpEarned}</span><span className="text-[10px] font-black text-amber-200/50 uppercase">XP</span></div>
                    <div className="bg-[#2a1d15] border border-amber-500/20 rounded-2xl px-6 py-3 flex flex-col items-center"><Coins className="w-5 h-5 text-amber-300 mb-1" /><span className="text-2xl font-black text-amber-100">+{result.coinsEarned}</span><span className="text-[10px] font-black text-amber-200/50 uppercase">Monedas</span></div>
                </div>
                {result.capReached && <p className="text-[11px] text-amber-200/50 font-bold max-w-xs">Llegaste al tope de XP por juegos de hoy, ¡pero puedes seguir practicando!</p>}
                <div className="flex flex-col gap-2 w-full max-w-xs mt-2">
                    <button onClick={() => void load()} className="bg-amber-400 text-[#1d1410] font-black py-3.5 rounded-2xl active:scale-95">Jugar otra vez</button>
                    <Link href="/portal-alumno/dashboard/juegos" className="text-amber-200/70 font-bold py-2">Volver a juegos</Link>
                </div>
            </div>
        );
    }

    // playing
    return (
        <div className="min-h-screen bg-[#1d1410] flex flex-col pb-32">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-[#1d1410] px-4 py-3 flex items-center gap-3">
                <Link href="/portal-alumno/dashboard/juegos" className="p-1 text-amber-200/60 hover:text-amber-100"><X className="w-7 h-7" /></Link>
                <div className="flex-1 h-3 bg-black/30 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${(idx / items.length) * 100}%` }} />
                </div>
                <span className="text-xs font-black text-amber-200/70 tabular-nums">{idx + 1}/{items.length}</span>
            </div>

            <div className="max-w-xl mx-auto w-full px-4 py-4 flex-1 flex flex-col">
                {/* Personaje + qué craftear */}
                <div className="flex items-start gap-3 mb-5">
                    <Mascot character="granjerita" mood="curious" className="w-14 h-14 shrink-0" />
                    <div className="flex-1 bg-[#2a1d15] border border-amber-500/20 rounded-2xl px-4 py-3">
                        <p className="text-[10px] font-black text-amber-300 uppercase tracking-widest mb-0.5">Craftea en inglés</p>
                        <p className="text-lg font-black text-amber-50 leading-snug">«{item?.content?.prompt || 'Forma la oración'}»</p>
                    </div>
                </div>

                {/* Slot de crafteo (la oración que vas formando) */}
                <div className="min-h-[64px] rounded-2xl border-2 border-dashed border-amber-500/30 bg-black/20 flex flex-wrap items-center gap-2 p-3 mb-6">
                    {built.length === 0 && <span className="text-amber-200/30 font-bold text-sm">Toca los bloques para formar la oración…</span>}
                    {built.map((i) => (
                        <button key={i} onClick={() => remove(i)} disabled={!!fb}
                            className="px-3 py-2 rounded-lg bg-amber-400 text-[#1d1410] font-black border-b-4 border-amber-600 active:translate-y-0.5 active:border-b-2">
                            {tiles[i]}
                        </button>
                    ))}
                </div>

                {/* Banco de bloques de palabras */}
                <div className="flex flex-wrap gap-2.5 justify-center">
                    {tiles.map((w, i) => (
                        <motion.button key={i} whileTap={{ scale: 0.94 }} onClick={() => add(i)} disabled={used.has(i) || !!fb}
                            className={`px-4 py-3 rounded-lg font-black border-b-4 transition-all ${used.has(i) ? 'bg-[#2a1d15] border-black/40 text-amber-200/20' : 'bg-[#6b4f3a] border-[#3d2c1f] text-amber-50 active:translate-y-0.5 active:border-b-2'}`}>
                            {w}
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Barra inferior: feedback o "Craftear" */}
            <div className="fixed bottom-0 inset-x-0 z-20">
                <AnimatePresence mode="wait">
                    {fb === 'correct' ? (
                        <motion.div key="ok" initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }} className="bg-[#3a6b00] px-4 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
                            <div className="max-w-xl mx-auto flex items-center gap-3 text-white font-black"><span className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"><Check className="w-6 h-6" /></span> ¡Crafteado! 🎉</div>
                        </motion.div>
                    ) : fb === 'wrong' ? (
                        <motion.div key="no" initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }} className="bg-[#7a2e2e] px-4 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
                            <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
                                <span className="text-white font-black">¡Casi! Revisa el orden.</span>
                                <div className="flex gap-2">
                                    <button onClick={retry} className="bg-white/15 text-white font-black px-4 py-2.5 rounded-xl inline-flex items-center gap-1.5"><RotateCcw className="w-4 h-4" /> Reintentar</button>
                                    <button onClick={next} className="bg-white text-[#7a2e2e] font-black px-5 py-2.5 rounded-xl">Continuar</button>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="craft" className="bg-[#1d1410] border-t border-amber-500/20 px-4 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
                            <div className="max-w-xl mx-auto flex items-center gap-3">
                                <button onClick={() => item && say(craftedWords.join(' '))} disabled={!built.length} className="w-12 h-12 rounded-2xl bg-[#2a1d15] border border-amber-500/20 text-amber-200 flex items-center justify-center disabled:opacity-40"><Volume2 className="w-5 h-5" /></button>
                                <button onClick={craft} disabled={built.length !== tiles.length || checking}
                                    className={`flex-1 py-4 rounded-2xl font-black uppercase tracking-wide inline-flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${built.length !== tiles.length || checking ? 'bg-[#2a1d15] text-amber-200/30' : 'bg-amber-400 text-[#1d1410] border-b-4 border-amber-600'}`}>
                                    {checking ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Hammer className="w-5 h-5" /> Craftear</>}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
