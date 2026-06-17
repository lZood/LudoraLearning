'use client';

import React from 'react';
import Link from 'next/link';
import { Hammer, Swords, Pickaxe, Lock, ChevronRight, Gamepad2 } from 'lucide-react';
import MobileSubHeader from '@/components/dashboard/MobileSubHeader';

type Card = { id: string; title: string; tagline: string; icon: React.ReactNode; accent: string; href?: string; soon?: boolean };

const CARDS: Card[] = [
    { id: 'crafteo', title: 'Mesa de Crafteo', tagline: 'Craftea oraciones con bloques de palabras', icon: <Hammer className="w-7 h-7" />, accent: '#8B5E3C', href: '/portal-alumno/dashboard/juegos/crafteo' },
    { id: 'aldea', title: 'Defiende la Aldea', tagline: 'Derrota a los mobs respondiendo a tiempo', icon: <Swords className="w-7 h-7" />, accent: '#3FA34D', soon: true },
    { id: 'cueva', title: 'Expedición a la Cueva', tagline: 'Cava profundo y mina gemas con cada acierto', icon: <Pickaxe className="w-7 h-7" />, accent: '#632EB0', soon: true },
];

export default function JuegosHub() {
    return (
        <div className="flex flex-col w-full pb-32 bg-white">
            <MobileSubHeader />
            <div className="max-w-3xl mx-auto w-full px-4 pt-6 md:pt-10">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-[#632EB0] flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/20">
                        <Gamepad2 className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Juegos</h1>
                        <p className="text-sm text-gray-500 font-bold">Aprende inglés jugando. Ganas XP y monedas.</p>
                    </div>
                </div>

                <div className="grid gap-3">
                    {CARDS.map((c) => {
                        const inner = (
                            <div className={`relative flex items-center gap-4 p-4 rounded-3xl border-2 transition-all ${c.soon ? 'border-gray-100 bg-gray-50 opacity-80' : 'border-gray-100 bg-white hover:border-[#632EB0]/40 active:scale-[0.99] shadow-sm'}`}>
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0" style={{ backgroundColor: c.accent }}>
                                    {c.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-black text-gray-900">{c.title}</p>
                                    <p className="text-xs font-bold text-gray-400">{c.tagline}</p>
                                </div>
                                {c.soon
                                    ? <span className="inline-flex items-center gap-1 text-[10px] font-black text-gray-400 uppercase tracking-wide bg-gray-100 px-2.5 py-1 rounded-full shrink-0"><Lock className="w-3 h-3" /> Pronto</span>
                                    : <ChevronRight className="w-6 h-6 text-gray-300 shrink-0" />}
                            </div>
                        );
                        return c.href ? <Link key={c.id} href={c.href}>{inner}</Link> : <div key={c.id}>{inner}</div>;
                    })}
                </div>
            </div>
        </div>
    );
}
