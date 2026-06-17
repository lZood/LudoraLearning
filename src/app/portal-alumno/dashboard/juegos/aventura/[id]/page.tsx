'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { X, Loader2, Volume2, Star, Coins, MapPin, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { playAudio, loadAudioManifest, stopAudio, playSfx } from '@/lib/lessonAudio';
import { getAdventure, type Adventure, type NPC, type Interactable, type DialogueOption } from '@/lib/adventures';

type Step = 'intro' | 'playing' | 'finishing' | 'complete' | 'missing';
type Pos = { x: number; y: number };
const speak = (text: string, role: string) => playAudio(text, role);

export default function AventuraPage() {
    const params = useParams();
    const adv = getAdventure(String(params.id));
    const [step, setStep] = useState<Step>(adv ? 'intro' : 'missing');
    const [pos, setPos] = useState<Pos>(adv ? adv.start : { x: 0, y: 0 });
    const [talked, setTalked] = useState<Set<string>>(new Set());
    const [keyFound, setKeyFound] = useState(false);
    const [reward, setReward] = useState<{ xp: number; coins: number } | null>(null);

    // Conversación
    const [npc, setNpc] = useState<NPC | null>(null);
    const [cstage, setCstage] = useState<'intro' | 'ask' | 'reply'>('intro');
    const [reply, setReply] = useState<DialogueOption | null>(null);
    const [nudge, setNudge] = useState(false);
    // Interactuable (resultado de buscar)
    const [toast, setToast] = useState<{ line: string; es?: string; role?: string } | null>(null);

    const movingRef = useRef(false);
    const pendingRef = useRef<null | (() => void)>(null);

    useEffect(() => { loadAudioManifest(); return () => stopAudio(); }, []);

    if (!adv || step === 'missing') {
        return (
            <div className="min-h-screen bg-[#7ec850] flex flex-col items-center justify-center gap-4 text-center px-6">
                <p className="text-white font-black text-lg">Esta aventura no existe</p>
                <Link href="/portal-alumno/dashboard/juegos" className="bg-white text-[#3b7a1e] font-black px-6 py-3 rounded-2xl">Volver a juegos</Link>
            </div>
        );
    }
    const A: Adventure = adv;

    // ── Mapa / caminos ──
    const npcAt = (x: number, y: number) => A.npcs.find((n) => n.x === x && n.y === y);
    const interAt = (x: number, y: number) => A.interactables.find((it) => it.x === x && it.y === y);
    const wall = (x: number, y: number) => x < 0 || y < 0 || x >= A.cols || y >= A.rows || A.grid[y][x] === '#';
    const walkable = (x: number, y: number) => !wall(x, y) && !npcAt(x, y) && !interAt(x, y);

    const bfs = useCallback((from: Pos, to: Pos): Pos[] => {
        if (!walkable(to.x, to.y)) return [];
        const key = (p: Pos) => `${p.x},${p.y}`;
        const q: Pos[] = [from]; const prev = new Map<string, Pos | null>(); prev.set(key(from), null);
        while (q.length) {
            const c = q.shift()!;
            if (c.x === to.x && c.y === to.y) break;
            for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
                const nx = c.x + dx, ny = c.y + dy;
                if (walkable(nx, ny) && !prev.has(`${nx},${ny}`)) { prev.set(`${nx},${ny}`, c); q.push({ x: nx, y: ny }); }
            }
        }
        if (!prev.has(key(to))) return [];
        const path: Pos[] = []; let cur: Pos | null = to;
        while (cur) { path.unshift(cur); cur = prev.get(key(cur)) ?? null; }
        path.shift(); // quita la posición actual
        return path;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [A]);

    // Casilla libre adyacente más cercana a un objetivo (NPC/interactuable).
    const adjacentTo = useCallback((t: Pos): Pos | null => {
        const opts = [[0, 1], [0, -1], [1, 0], [-1, 0]].map(([dx, dy]) => ({ x: t.x + dx, y: t.y + dy })).filter((p) => walkable(p.x, p.y));
        if (!opts.length) return null;
        opts.sort((a, b) => (Math.abs(a.x - pos.x) + Math.abs(a.y - pos.y)) - (Math.abs(b.x - pos.x) + Math.abs(b.y - pos.y)));
        return opts[0];
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pos, A]);

    const walkPath = useCallback((path: Pos[], onArrive?: () => void) => {
        if (movingRef.current || !path.length) { onArrive?.(); return; }
        movingRef.current = true;
        let i = 0;
        const stepFn = () => {
            if (i >= path.length) { movingRef.current = false; onArrive?.(); return; }
            setPos(path[i]); i++;
            setTimeout(stepFn, 150);
        };
        stepFn();
    }, []);

    const goTo = (x: number, y: number) => {
        if (step !== 'playing' || npc || toast) return;
        walkPath(bfs(pos, { x, y }));
    };
    const approach = (t: Pos, onArrive: () => void) => {
        if (step !== 'playing' || npc || toast || movingRef.current) return;
        const adj = adjacentTo(t);
        if (!adj) { onArrive(); return; }
        walkPath(bfs(pos, adj), onArrive);
    };

    // ── Conversación ──
    function talkTo(n: NPC) {
        approach({ x: n.x, y: n.y }, () => { setNpc(n); setCstage('intro'); setReply(null); setNudge(false); });
    }
    // voz al cambiar de etapa
    useEffect(() => {
        if (!npc) return;
        if (cstage === 'intro') speak(npc.greeting, npc.char);
        else if (cstage === 'ask') speak(npc.ask, npc.char);
        else if (cstage === 'reply' && reply?.reply) speak(reply.reply, npc.char);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [npc, cstage]);

    function pick(o: DialogueOption) {
        if (!npc) return;
        if (o.correct) { playSfx('correct'); setReply(o); setCstage('reply'); }
        else { playSfx('wrong'); setNudge(true); setTimeout(() => setNudge(false), 1400); }
    }
    function closeConvo() {
        if (npc && reply?.correct) setTalked((t) => new Set(t).add(npc.id));
        stopAudio(); setNpc(null); setReply(null);
    }

    // ── Interactuables / acertijo ──
    function useInteractable(it: Interactable) {
        approach({ x: it.x, y: it.y }, () => {
            if (it.id === A.chestId) {
                if (!keyFound) { setToast({ line: A.chestLockedLine, es: A.chestLockedEs, role: 'narrator' }); speak(A.chestLockedLine, 'narrator'); return; }
                setToast({ line: A.completeLine, es: A.completeEs, role: 'narrator' }); speak(A.completeLine, 'narrator');
                pendingRef.current = () => void complete();
                return;
            }
            // Buscar en una ubicación: requiere haber preguntado a 2+ aldeanos.
            if (talked.size < 2) { setToast({ line: 'Ask the villagers first to get clues.', es: 'Pregunta primero a los aldeanos para conseguir pistas.', role: 'narrator' }); speak('Ask the villagers first to get clues.', 'narrator'); return; }
            if (it.id === A.keyLocation) { playSfx('complete'); setKeyFound(true); setToast({ line: it.foundLine, es: it.foundEs, role: 'narrator' }); speak(it.foundLine, 'narrator'); }
            else { playSfx('wrong'); setToast({ line: it.wrongLine || 'Nothing here.', es: it.wrongEs, role: 'narrator' }); speak(it.wrongLine || 'Nothing here.', 'narrator'); }
        });
    }
    function closeToast() { const cb = pendingRef.current; pendingRef.current = null; stopAudio(); setToast(null); cb?.(); }

    async function complete() {
        setStep('finishing');
        try {
            const r = await fetch('/api/adventures/complete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: A.id }) });
            const d = await r.json();
            setReward(r.ok ? { xp: d.xpEarned ?? 0, coins: d.coinsEarned ?? 0 } : { xp: 0, coins: 0 });
        } catch { setReward({ xp: 0, coins: 0 }); }
        setStep('complete');
    }

    // ── Pantallas ──
    if (step === 'intro') {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#7ec850] to-[#5ba832] flex flex-col items-center justify-center gap-5 text-center px-6">
                <div className="text-6xl">🗺️</div>
                <h1 className="text-3xl font-black text-white drop-shadow">{A.title}</h1>
                <p className="text-white/90 font-bold max-w-sm">{A.intro}</p>
                <div className="bg-white/20 rounded-2xl px-4 py-2 text-white font-black text-sm inline-flex items-center gap-2"><MapPin className="w-4 h-4" /> {A.goal}</div>
                <button onClick={() => setStep('playing')} className="bg-white text-[#3b7a1e] font-black px-10 py-4 rounded-2xl shadow-lg active:scale-95 inline-flex items-center gap-2">Empezar <ArrowRight className="w-5 h-5" /></button>
                <Link href="/portal-alumno/dashboard/juegos" className="text-white/70 font-bold text-sm">Volver</Link>
            </div>
        );
    }
    if (step === 'finishing') {
        return <div className="min-h-screen bg-[#5ba832] flex items-center justify-center"><Loader2 className="w-8 h-8 text-white animate-spin" /></div>;
    }
    if (step === 'complete') {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#7ec850] to-[#5ba832] flex flex-col items-center justify-center gap-5 text-center px-6">
                <div className="text-6xl">🎉</div>
                <h1 className="text-3xl font-black text-white drop-shadow">¡Aventura completada!</h1>
                <p className="text-white/90 font-bold">{A.title}</p>
                <div className="flex gap-3">
                    <div className="bg-white/20 rounded-2xl px-6 py-3 flex flex-col items-center"><Star className="w-5 h-5 text-yellow-200 mb-1" /><span className="text-2xl font-black text-white">+{reward?.xp ?? 0}</span><span className="text-[10px] font-black text-white/60 uppercase">XP</span></div>
                    <div className="bg-white/20 rounded-2xl px-6 py-3 flex flex-col items-center"><Coins className="w-5 h-5 text-yellow-200 mb-1" /><span className="text-2xl font-black text-white">+{reward?.coins ?? 0}</span><span className="text-[10px] font-black text-white/60 uppercase">Monedas</span></div>
                </div>
                <Link href="/portal-alumno/dashboard/juegos" className="bg-white text-[#3b7a1e] font-black px-10 py-4 rounded-2xl shadow-lg active:scale-95">Volver a juegos</Link>
            </div>
        );
    }

    // ── Mapa (playing) ──
    const cluesLeft = A.npcs.length - talked.size;
    return (
        <div className="min-h-screen bg-[#3b7a1e] flex flex-col">
            {/* HUD */}
            <div className="sticky top-0 z-20 bg-[#2f5f18] px-4 py-3 flex items-center gap-3">
                <Link href="/portal-alumno/dashboard/juegos" className="p-1 text-white/70 hover:text-white"><X className="w-6 h-6" /></Link>
                <span className="text-white font-black text-sm flex-1 truncate">{A.title}</span>
                <span className="text-[11px] font-black text-white/80 bg-black/20 px-2.5 py-1 rounded-full">
                    {keyFound ? '🔑 Llave lista' : cluesLeft > 0 ? `🗣️ Habla con ${cluesLeft}` : '🔎 Busca la llave'}
                </span>
            </div>

            {/* Tablero */}
            <div className="flex-1 flex items-center justify-center p-3">
                <div className="relative w-full" style={{ maxWidth: 420, aspectRatio: `${A.cols}/${A.rows}` }}>
                    {/* Tiles */}
                    <div className="absolute inset-0 grid rounded-2xl overflow-hidden" style={{ gridTemplateColumns: `repeat(${A.cols}, 1fr)` }}>
                        {Array.from({ length: A.cols * A.rows }).map((_, k) => {
                            const x = k % A.cols, y = Math.floor(k / A.cols);
                            const isWall = A.grid[y][x] === '#';
                            return (
                                <button key={k} onClick={() => goTo(x, y)} disabled={isWall}
                                    className={`${isWall ? 'bg-[#2e6b2a]' : (x + y) % 2 ? 'bg-[#9be25e]' : 'bg-[#8ed94f]'}`}
                                    style={{ aspectRatio: '1' }} aria-hidden />
                            );
                        })}
                    </div>
                    {/* Bordes (seto) decorativo arriba */}
                    {/* Interactuables */}
                    {A.interactables.map((it) => {
                        const active = it.id === A.keyLocation ? (talked.size >= 2 && !keyFound) : it.id === A.chestId ? keyFound : false;
                        return (
                            <button key={it.id} onClick={() => useInteractable(it)}
                                className="absolute flex items-center justify-center"
                                style={{ left: `${(it.x * 100) / A.cols}%`, top: `${(it.y * 100) / A.rows}%`, width: `${100 / A.cols}%`, height: `${100 / A.rows}%` }}>
                                <span className={`text-2xl ${active ? 'animate-bounce drop-shadow-[0_0_8px_rgba(255,255,150,0.9)]' : ''}`}>{it.emoji}</span>
                            </button>
                        );
                    })}
                    {/* NPCs */}
                    {A.npcs.map((n) => (
                        <button key={n.id} onClick={() => talkTo(n)}
                            className="absolute flex flex-col items-center justify-center"
                            style={{ left: `${(n.x * 100) / A.cols}%`, top: `${(n.y * 100) / A.rows}%`, width: `${100 / A.cols}%`, height: `${100 / A.rows}%` }}>
                            <span className="text-2xl">{n.emoji}</span>
                            {!talked.has(n.id) && <span className="absolute -top-1 text-xs animate-bounce">💬</span>}
                        </button>
                    ))}
                    {/* Avatar */}
                    <motion.div className="absolute flex items-center justify-center pointer-events-none z-10"
                        animate={{ left: `${(pos.x * 100) / A.cols}%`, top: `${(pos.y * 100) / A.rows}%` }}
                        transition={{ duration: 0.14, ease: 'linear' }}
                        style={{ width: `${100 / A.cols}%`, height: `${100 / A.rows}%` }}>
                        <span className="text-2xl drop-shadow">🧍</span>
                    </motion.div>
                </div>
            </div>
            <p className="text-center text-white/60 text-xs font-bold pb-3 px-4">Toca el mapa para caminar · toca un personaje para hablar</p>

            {/* Conversación */}
            <AnimatePresence>
                {npc && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-30" onClick={cstage === 'intro' ? () => setCstage('ask') : undefined} />
                        <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 320 }}
                            className="fixed bottom-0 inset-x-0 z-40 bg-white rounded-t-[2rem] p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] max-w-xl mx-auto shadow-2xl">
                            <div className="flex items-start gap-3 mb-4">
                                <span className="text-4xl shrink-0">{npc.emoji}</span>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-[#632EB0] uppercase tracking-widest">{npc.name}</p>
                                    <button onClick={() => speak(cstage === 'reply' ? (reply?.reply || '') : cstage === 'ask' ? npc.ask : npc.greeting, npc.char)} className="text-left inline-flex items-start gap-1.5">
                                        <Volume2 className="w-4 h-4 text-[#632EB0] mt-1 shrink-0" />
                                        <span className="text-lg font-black text-gray-900 leading-snug">{cstage === 'reply' ? reply?.reply : cstage === 'ask' ? npc.ask : npc.greeting}</span>
                                    </button>
                                    <p className="text-xs font-bold text-gray-400 mt-1">{cstage === 'reply' ? reply?.replyEs : cstage === 'ask' ? npc.askEs : npc.greetingEs}</p>
                                </div>
                            </div>

                            {cstage === 'intro' && (
                                <button onClick={() => setCstage('ask')} className="w-full bg-[#88e04f] text-[#1a1a1a] font-black py-3.5 rounded-2xl active:scale-[0.98]">Continuar</button>
                            )}
                            {cstage === 'ask' && (
                                <div className="flex flex-col gap-2">
                                    {nudge && <p className="text-center text-sm font-black text-red-500">¡Mmm! Esa no. Inténtalo de nuevo 🤔</p>}
                                    {npc.options.map((o, i) => (
                                        <button key={i} onClick={() => pick(o)} className="w-full text-left p-4 rounded-2xl border-2 border-gray-200 hover:border-[#632EB0] active:scale-[0.99] transition-all">
                                            <p className="font-black text-gray-900">{o.text}</p>
                                            {o.es && <p className="text-xs font-bold text-gray-400">{o.es}</p>}
                                        </button>
                                    ))}
                                </div>
                            )}
                            {cstage === 'reply' && (
                                <button onClick={closeConvo} className="w-full bg-[#88e04f] text-[#1a1a1a] font-black py-3.5 rounded-2xl active:scale-[0.98]">¡Entendido!</button>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Toast de interacción */}
            <AnimatePresence>
                {toast && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-30" onClick={closeToast} />
                        <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 320 }}
                            className="fixed bottom-0 inset-x-0 z-40 bg-white rounded-t-[2rem] p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] max-w-xl mx-auto shadow-2xl text-center">
                            <button onClick={() => speak(toast.line, toast.role || 'narrator')} className="inline-flex items-center gap-2 text-lg font-black text-gray-900 mb-1"><Volume2 className="w-5 h-5 text-[#632EB0]" /> {toast.line}</button>
                            {toast.es && <p className="text-sm font-bold text-gray-400 mb-3">{toast.es}</p>}
                            <button onClick={closeToast} className="w-full bg-[#88e04f] text-[#1a1a1a] font-black py-3.5 rounded-2xl active:scale-[0.98] mt-2">Continuar</button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
