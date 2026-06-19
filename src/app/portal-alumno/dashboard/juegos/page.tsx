'use client';

import React from 'react';
import Link from 'next/link';
import { Hammer, Swords, Pickaxe, ChevronRight, Gamepad2, MapPin, Star, ShoppingBag, Coins } from 'lucide-react';
import MobileSubHeader from '@/components/dashboard/MobileSubHeader';
import { listAdventures } from '@/lib/adventures';

type Mini = { id: string; title: string; tagline: string; icon: React.ReactNode; accent: string; href: string };

const PRACTICE: Mini[] = [
    { id: 'crafteo', title: 'Mesa de Crafteo', tagline: 'Arma oraciones con bloques', icon: <Hammer className="w-6 h-6" />, accent: '#8B5E3C', href: '/portal-alumno/dashboard/juegos/crafteo' },
    { id: 'aldea', title: 'Defiende la Aldea', tagline: 'Responde a tiempo', icon: <Swords className="w-6 h-6" />, accent: '#3FA34D', href: '/portal-alumno/dashboard/juegos/aldea' },
    { id: 'cueva', title: 'Expedición a la Cueva', tagline: 'Mina con cada acierto', icon: <Pickaxe className="w-6 h-6" />, accent: '#632EB0', href: '/portal-alumno/dashboard/juegos/cueva' },
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

                {/* Aventuras */}
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Aventuras 3D</p>
                <div className="grid gap-3 mb-7">
                    {listAdventures().map((a, i) => (
                        <Link key={a.id} href={`/portal-alumno/dashboard/juegos/aventura/${a.id}`} className="block">
                            <div className="relative overflow-hidden rounded-[2rem] p-5 shadow-xl active:scale-[0.99] transition-all" style={{ background: `linear-gradient(135deg, ${a.accent}, rgba(0,0,0,0.38))` }}>
                                <div className="absolute -right-4 -top-4 text-7xl opacity-30 select-none">{a.emoji}</div>
                                <div className="relative">
                                    <span className="inline-flex items-center gap-1 text-[10px] font-black text-white/90 uppercase tracking-widest bg-black/20 px-2.5 py-1 rounded-full">
                                        {i === 0 ? <><Star className="w-3 h-3 fill-white" /> Empieza aquí</> : <><MapPin className="w-3 h-3" /> Aventura</>}
                                    </span>
                                    <h2 className="text-2xl font-black text-white mt-3 drop-shadow">{a.title}</h2>
                                    <p className="text-white/90 font-bold text-sm mt-1 max-w-[78%]">{a.tagline}</p>
                                    <span className="inline-flex items-center gap-2 mt-4 bg-white font-black px-5 py-2.5 rounded-2xl text-sm" style={{ color: a.accent }}><MapPin className="w-4 h-4" /> Jugar</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Preview: nueva actividad de aprendizaje 3D */}
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Nuevo · Aprendizaje</p>
                <Link href="/portal-alumno/dashboard/juegos/colores" className="block mb-7">
                    <div className="relative overflow-hidden rounded-[2rem] p-5 shadow-xl active:scale-[0.99] transition-all" style={{ background: 'linear-gradient(135deg, #ff7a3d, #8b3fb0)' }}>
                        <div className="absolute -right-4 -top-4 text-7xl opacity-30 select-none">🎨</div>
                        <div className="relative">
                            <span className="inline-flex items-center gap-1 text-[10px] font-black text-white/90 uppercase tracking-widest bg-black/20 px-2.5 py-1 rounded-full"><Star className="w-3 h-3 fill-white" /> Preview</span>
                            <h2 className="text-2xl font-black text-white mt-3 drop-shadow">Colores</h2>
                            <p className="text-white/90 font-bold text-sm mt-1 max-w-[78%]">Aprende los colores en inglés buscando el objeto correcto. Mini-juego 3D.</p>
                            <span className="inline-flex items-center gap-2 mt-4 bg-white text-[#8b3fb0] font-black px-5 py-2.5 rounded-2xl text-sm"><MapPin className="w-4 h-4" /> Jugar</span>
                        </div>
                    </div>
                </Link>

                {/* Tienda: gasta tus monedas en cosméticos */}
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Tienda</p>
                <Link href="/portal-alumno/dashboard/tienda" className="block mb-7">
                    <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#632EB0] to-[#4a2186] p-5 shadow-xl active:scale-[0.99] transition-all">
                        <div className="absolute -right-3 -top-3 text-7xl opacity-25 select-none">🛒</div>
                        <div className="relative">
                            <span className="inline-flex items-center gap-1 text-[10px] font-black text-white/90 uppercase tracking-widest bg-black/20 px-2.5 py-1 rounded-full"><Coins className="w-3 h-3 fill-white" /> Cosméticos</span>
                            <h2 className="text-2xl font-black text-white mt-3 drop-shadow">Tienda de la Aldea</h2>
                            <p className="text-white/90 font-bold text-sm mt-1 max-w-[78%]">Gasta tus monedas en marcos, títulos y colores para presumir tu perfil.</p>
                            <span className="inline-flex items-center gap-2 mt-4 bg-white text-[#632EB0] font-black px-5 py-2.5 rounded-2xl text-sm"><ShoppingBag className="w-4 h-4" /> Ir a la tienda</span>
                        </div>
                    </div>
                </Link>

                {/* Práctica rápida */}
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Práctica rápida</p>
                <div className="grid gap-3">
                    {PRACTICE.map((c) => (
                        <Link key={c.id} href={c.href}>
                            <div className="flex items-center gap-4 p-4 rounded-3xl border-2 border-gray-100 bg-white hover:border-[#632EB0]/40 active:scale-[0.99] shadow-sm transition-all">
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0" style={{ backgroundColor: c.accent }}>{c.icon}</div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-black text-gray-900">{c.title}</p>
                                    <p className="text-xs font-bold text-gray-400">{c.tagline}</p>
                                </div>
                                <ChevronRight className="w-6 h-6 text-gray-300 shrink-0" />
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="mt-6 text-center">
                    <Link href="/portal-alumno/dashboard/juegos/tester" className="text-[11px] font-black text-gray-300 hover:text-gray-500 uppercase tracking-widest">
                        Modo desarrollo
                    </Link>
                </div>
            </div>
        </div>
    );
}
