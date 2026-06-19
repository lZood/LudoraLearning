'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { X, Loader2, Volume2, Star, Coins, MapPin, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAdventure, type Adventure } from '@/lib/adventures';
import { useAdventureEngine } from '@/hooks/useAdventureEngine';
import Adventure2DBoard from '@/components/adventure/Adventure2DBoard';
import CanvasFallbackBoundary from '@/components/three/CanvasFallbackBoundary';

// El motor 3D (WebGL) se carga solo en cliente y solo en esta página (lazy).
const VoxelAdventureCanvas = dynamic(() => import('@/components/three/VoxelAdventureCanvas'), {
    ssr: false,
    loading: () => <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 text-white/70 animate-spin" /></div>,
});

function webglAvailable(): boolean {
    try {
        const c = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
    } catch { return false; }
}

export default function AventuraPage() {
    const params = useParams();
    const adv = getAdventure(String(params.id));
    const eng = useAdventureEngine(adv);
    const {
        step, setStep, pos, talked, keyFound, chestOpen, reward,
        npc, cstage, setCstage, reply, nudge, toast,
        goTo, talkTo, pick, closeConvo, interact, closeToast, speak,
    } = eng;

    // Decisión 3D vs 2D solo tras montar en cliente (evita SSR de WebGL e hidratación).
    const [render3D, setRender3D] = useState<boolean | null>(null);
    useEffect(() => { setRender3D(webglAvailable()); }, []);

    if (!adv || step === 'missing') {
        return (
            <div className="min-h-screen bg-[#7ec850] flex flex-col items-center justify-center gap-4 text-center px-6">
                <p className="text-white font-black text-lg">Esta aventura no existe</p>
                <Link href="/portal-alumno/dashboard/juegos" className="bg-white text-[#3b7a1e] font-black px-6 py-3 rounded-2xl">Volver a juegos</Link>
            </div>
        );
    }
    const A: Adventure = adv;

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
    const boardProps = { A, pos, talked, keyFound, goTo, talkTo, interact };
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

            {/* Tablero: 3D voxel (con fallback 2D) */}
            {render3D === null ? (
                <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 text-white/70 animate-spin" /></div>
            ) : render3D ? (
                <CanvasFallbackBoundary fallback={<Adventure2DBoard {...boardProps} />}>
                    <VoxelAdventureCanvas A={A} pos={pos} talked={talked} keyFound={keyFound} chestOpen={chestOpen} onTile={goTo} onNpc={talkTo} onInteract={interact} />
                </CanvasFallbackBoundary>
            ) : (
                <Adventure2DBoard {...boardProps} />
            )}

            <p className="text-center text-white/60 text-xs font-bold pb-3 px-4">Toca el suelo para caminar · toca un personaje para hablar</p>

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
