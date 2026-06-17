'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Play, FlaskConical, Loader2, Volume2, ListChecks } from 'lucide-react';
import MobileSubHeader from '@/components/dashboard/MobileSubHeader';
import { playAudio, playUrl, loadAudioManifest } from '@/lib/lessonAudio';

const GAMES = [
    { id: 'crafteo', title: 'Mesa de Crafteo', color: '#8B5E3C' },
    { id: 'aldea', title: 'Defiende la Aldea', color: '#3FA34D' },
    { id: 'cueva', title: 'Expedición a la Cueva', color: '#632EB0' },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Item = { id: string; type: string; content: any };

export default function JuegosTester() {
    const [inspecting, setInspecting] = useState<string | null>(null);
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(false);

    async function inspect(game: string) {
        setInspecting(game); setLoading(true); setItems([]);
        await loadAudioManifest();
        try {
            const r = await fetch('/api/games/round', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ game }) });
            const d = await r.json();
            setItems(d.items ?? []);
        } catch { setItems([]); }
        finally { setLoading(false); }
    }

    return (
        <div className="flex flex-col w-full pb-32 bg-white">
            <MobileSubHeader />
            <div className="max-w-3xl mx-auto w-full px-4 pt-6 md:pt-10">
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-14 h-14 rounded-2xl bg-gray-900 flex items-center justify-center shrink-0"><FlaskConical className="w-7 h-7 text-emerald-300" /></div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Modo desarrollo</h1>
                        <p className="text-sm text-gray-500 font-bold">Prueba los juegos sin gastar ni ganar (práctica) e inspecciona su contenido.</p>
                    </div>
                </div>
                <p className="text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 mb-6">
                    En modo práctica el juego califica igual pero NO otorga XP ni monedas (no afecta tus estadísticas reales).
                </p>

                <div className="mb-3">
                    <Link href="/portal-alumno/dashboard/juegos/aventura/cofre-perdido" className="inline-flex items-center gap-2 bg-[#3b7a1e] text-white font-black px-4 py-2.5 rounded-2xl active:scale-95">
                        <Play className="w-4 h-4 fill-white" /> Aventura: El Cofre Perdido
                    </Link>
                </div>

                <div className="grid gap-3">
                    {GAMES.map((g) => (
                        <div key={g.id} className="border-2 border-gray-100 rounded-3xl p-4">
                            <div className="flex items-center justify-between gap-3 mb-3">
                                <p className="font-black text-gray-900">{g.title}</p>
                                <span className="text-[10px] font-black text-gray-400 uppercase">{g.id}</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Link href={`/portal-alumno/dashboard/juegos/${g.id}?dev=1`}
                                    className="inline-flex items-center gap-2 text-white font-black px-4 py-2.5 rounded-2xl active:scale-95" style={{ backgroundColor: g.color }}>
                                    <Play className="w-4 h-4 fill-white" /> Jugar (práctica)
                                </Link>
                                <Link href={`/portal-alumno/dashboard/juegos/${g.id}`}
                                    className="inline-flex items-center gap-2 text-gray-700 font-black px-4 py-2.5 rounded-2xl border-2 border-gray-200 active:scale-95">
                                    <Play className="w-4 h-4" /> Jugar (real)
                                </Link>
                                <button onClick={() => inspect(g.id)}
                                    className="inline-flex items-center gap-2 text-gray-700 font-black px-4 py-2.5 rounded-2xl border-2 border-gray-200 active:scale-95">
                                    <ListChecks className="w-4 h-4" /> Inspeccionar ronda
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Inspector de ronda (contenido sanitizado, igual al que recibe el juego) */}
                {inspecting && (
                    <div className="mt-6">
                        <h2 className="text-lg font-black text-gray-900 mb-3">Ronda servida · {inspecting}</h2>
                        {loading ? (
                            <div className="flex items-center gap-2 text-gray-400 font-bold py-6"><Loader2 className="w-5 h-5 animate-spin" /> Cargando…</div>
                        ) : (
                            <div className="grid gap-2">
                                {items.map((it, n) => {
                                    const e = it.content || {};
                                    const opts: string[] = (e.options || []).map((o: unknown) => (typeof o === 'string' ? o : (o as { text?: string })?.text)).filter(Boolean);
                                    const tiles: string[] = e.tiles || [];
                                    return (
                                        <div key={it.id} className="border border-gray-100 rounded-2xl p-3 text-sm">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] font-black text-white bg-gray-700 px-2 py-0.5 rounded-full">{n + 1}</span>
                                                <span className="text-[10px] font-black text-[#632EB0] uppercase tracking-wide">{it.type}</span>
                                                {e.audioUrl && <button onClick={() => playUrl(e.audioUrl)} className="text-[#632EB0]"><Volume2 className="w-4 h-4" /></button>}
                                            </div>
                                            {e.prompt && <p className="font-black text-gray-900">{e.prompt}</p>}
                                            {e.display && <p className="font-black text-gray-900">{e.display}</p>}
                                            {(e.before || e.after) && <p className="font-black text-gray-900">{e.before}<span className="text-amber-500">___</span>{e.after}</p>}
                                            {e.instruction && <p className="text-gray-400 font-bold text-xs">{e.instruction}</p>}
                                            {!!opts.length && <p className="text-gray-600 mt-1">Opciones: {opts.join(' · ')}</p>}
                                            {!!tiles.length && <p className="text-gray-600 mt-1">Fichas: {tiles.map((w) => <button key={w} onClick={() => playAudio(w, 'narrator')} className="underline decoration-dotted mr-1">{w}</button>)}</p>}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
