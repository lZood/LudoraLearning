'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Navigation } from 'lucide-react';

interface AdventureMapProps {
    englishLevel: string; // "Pre-A1", "A1", "A2", "B1 Inicial", "B1 Final", etc.
    subscriptionStatus: string; // "active", "trialing", "past_due", "canceled", "incomplete" etc.
}

type Zone = {
    id: string;
    title: string;
    level: string;
    description: string;
    world: 'Granja' | 'Ciudad';
    position: { left: number; bottom: number }; // using bottom % for vertical progression
    minLevelIndex: number; 
};

const levelsMap: Record<string, number> = {
    "Banda 1": 1, // A1
    "Banda 2": 2, // A2
    "Banda 3": 3, // B1 Inicial (to ensure they can see the full city if they subscribe)
    "Banda 4": 4, // B1 Final
    "Pre-A1": 0,
    "A1": 1,
    "A2": 2,
    "B1 Inicial": 3,
    "B1 Final": 4,
};

const ZONES: Zone[] = [
    {
        id: 'huerto',
        title: 'El Huerto de Inicio',
        level: 'Pre-A1',
        description: 'Vocabulario esencial y primeros pasos en el idioma.',
        world: 'Granja',
        position: { left: 50, bottom: 8 },
        minLevelIndex: 0
    },
    {
        id: 'mercado',
        title: 'El Mercado del Pueblo',
        level: 'A1',
        description: 'Interacciones básicas y descripciones tangibles.',
        world: 'Granja',
        position: { left: 25, bottom: 28 },
        minLevelIndex: 1
    },
    {
        id: 'minas',
        title: 'Las Minas Profundas',
        level: 'A2',
        description: 'Estructuras intermedias y narración del pasado.',
        world: 'Granja',
        position: { left: 75, bottom: 48 },
        minLevelIndex: 2
    },
    {
        id: 'distrito',
        title: 'Distrito Financiero',
        level: 'B1 Inicial',
        description: 'Negociaciones, opiniones y debates profesionales.',
        world: 'Ciudad',
        position: { left: 35, bottom: 68 },
        minLevelIndex: 3
    },
    {
        id: 'centro',
        title: 'Centro de Certificaciones',
        level: 'B1 Final',
        description: 'Fluidez, modismos y preparación para certificaciones.',
        world: 'Ciudad',
        position: { left: 65, bottom: 88 },
        minLevelIndex: 4
    }
];

export default function AdventureMap({ englishLevel, subscriptionStatus }: AdventureMapProps) {
    const router = useRouter();
    const currentLevelIndex = levelsMap[englishLevel] ?? 0;
    const isSubscribed = subscriptionStatus === 'active';
    
    const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleNodeClick = (zone: Zone) => {
        setSelectedZone(zone);
    };

    const handleCheckout = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    priceId: process.env.NEXT_PUBLIC_STRIPE_HYBRID_PRICE_ID || 'price_1T9w8q0qbWrTcjOeZ9z9n3ae',
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                alert(errorData.error || 'Ocurrió un error al procesar el pago.');
                setIsLoading(false);
                return;
            }

            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert('No se pudo conectar con el sistema de pagos.');
            setIsLoading(false);
        }
    };

    // Auto-scroll to current level on mount could be added here via a ref, but for simplicity we let user scroll

    return (
        <div className="w-full max-w-md mx-auto relative font-sans rounded-3xl overflow-y-auto overflow-x-hidden shadow-2xl border-4 border-[#0F5451] h-[600px] flex flex-col-reverse custom-scrollbar">
            {/* Inner scrollable area needs to be tall enough to spread the nodes vertically */}
            <div className="relative w-full h-[1200px] shrink-0 bg-gradient-to-b from-[#87CEEB] via-[#98FB98] to-[#2E8B57]">
                
                {/* Background Decoration (Clouds, Trees) */}
                <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
                     {/* Just a simple texture or repeating pattern to add depth */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay" />
                </div>

                {/* Path SVG Lines (Sinuous Vertical Path) */}
                {/* Since the container is 1200px tall, coordinates are percentages */}
                <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none drop-shadow-md">
                    <path 
                        d="M 50% 92% C 20% 80%, 10% 80%, 25% 72% C 50% 60%, 90% 60%, 75% 52% C 50% 40%, 10% 40%, 35% 32% C 60% 20%, 80% 20%, 65% 12%" 
                        fill="none" 
                        stroke="rgba(255, 255, 255, 0.4)" 
                        strokeWidth="12" 
                        strokeDasharray="16 16"
                        strokeLinecap="round"
                    />
                </svg>

                {/* Map Nodes */}
                <div className="absolute inset-0 z-20">
                    {ZONES.map((zone, index) => {
                        const isUnlockedByLevel = currentLevelIndex >= zone.minLevelIndex;
                        const isFullyUnlocked = isUnlockedByLevel && (zone.world === 'Granja' || isSubscribed);
                        const isCurrentNode = currentLevelIndex === zone.minLevelIndex;
                        
                        return (
                            <button
                                key={zone.id}
                                onClick={() => handleNodeClick(zone)}
                                className={`absolute transform -translate-x-1/2 translate-y-1/2 transition-all duration-300 group
                                    ${isFullyUnlocked ? 'hover:scale-110 cursor-pointer' : 'cursor-pointer'}
                                `}
                                style={{ 
                                    left: `${zone.position.left}%`, 
                                    bottom: `${zone.position.bottom}%`,
                                    filter: isFullyUnlocked ? 'none' : 'grayscale(100%) blur(1px) opacity(0.8)'
                                }}
                            >
                                <div className="relative">
                                    {/* Bouncing indicator for current level */}
                                    {isCurrentNode && (
                                        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 animate-bounce flex flex-col items-center">
                                            <div className="bg-white text-[#0F5451] text-xs font-black px-3 py-1 rounded-full shadow-md whitespace-nowrap mb-1">
                                                ¡Tú estás aquí!
                                            </div>
                                            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white"></div>
                                        </div>
                                    )}

                                    <div className={`
                                        w-20 h-20 rounded-full flex items-center justify-center border-[6px] shadow-xl relative
                                        ${zone.world === 'Granja' ? 'bg-[#7B1FA2] border-white' : 'bg-[#1976D2] border-white'}
                                        ${isFullyUnlocked ? 'shadow-[#0F7357]/40' : 'shadow-gray-900/50'}
                                    `}>
                                        {/* Stylized Node Inner Ring */}
                                        <div className="absolute inset-1 rounded-full border-2 border-white/30"></div>
                                        
                                        {!isFullyUnlocked && <Lock className="w-8 h-8 text-white/70" />}
                                        {isFullyUnlocked && (
                                            <span className="text-white font-black text-3xl drop-shadow-md">
                                                {index + 1}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Hover Tooltip */}
                                <div className="absolute top-1/2 left-full ml-4 transform -translate-y-1/2 w-max px-4 py-2 bg-white text-gray-800 text-sm font-bold rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg border-2 border-gray-100 hidden sm:block">
                                    {zone.title}
                                    <div className="absolute top-1/2 -left-2 transform -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[8px] border-r-white"></div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* World Markers inline inside the scrolling container */}
                <div className="absolute left-1/2 transform -translate-x-1/2 bottom-[15%] opacity-20 pointer-events-none text-white font-black text-6xl whitespace-nowrap tracking-widest">
                    LA GRANJA
                </div>
                <div className="absolute left-1/2 transform -translate-x-1/2 bottom-[75%] opacity-30 pointer-events-none text-blue-900 font-black text-6xl whitespace-nowrap tracking-widest text-center leading-none">
                    LA<br/>CIUDAD
                </div>

            </div>

            {/* Information Modal (Fixed overlay on top of scroller) */}
            {selectedZone && (
                <div className="absolute inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-sm shadow-2xl border-t-4 border-[#0F5451] relative animate-in slide-in-from-bottom-5">
                        <button 
                            onClick={() => setSelectedZone(null)}
                            className="absolute top-4 w-8 h-8 flex items-center justify-center right-4 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                        >
                            ✕
                        </button>
                        
                        <div className="mb-4 mt-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-[#0F5451] bg-[#0F5451]/10 py-1 px-3 rounded-full mr-2">
                                {selectedZone.world}
                            </span>
                            <span className="text-xs font-bold text-gray-500">Nivel {selectedZone.level}</span>
                        </div>
                        
                        <h3 className="text-2xl font-black text-gray-900 mb-2 leading-tight">{selectedZone.title}</h3>
                        <p className="text-gray-600 text-sm mb-6 font-medium">{selectedZone.description}</p>

                        {/* CTA Logic */}
                        {(() => {
                            const isUnlockedByLevel = currentLevelIndex >= selectedZone.minLevelIndex;
                            const isCity = selectedZone.world === 'Ciudad';

                            if (!isUnlockedByLevel && isCity) {
                                return (
                                    <div className="space-y-4">
                                        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 relative overflow-hidden">
                                            <div className="relative z-10">
                                                <p className="text-sm font-bold text-amber-800 mb-1">Bloqueado</p>
                                                <p className="text-sm font-medium text-amber-700 leading-relaxed">
                                                    ¡Increíble progreso! Dominas los campos de la Granja. Para desbloquear los rascacielos y misiones profesionales, necesitas subir a Nivel B1.
                                                </p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={handleCheckout}
                                            disabled={isLoading}
                                            className="w-full bg-[#0F5451] hover:bg-[#0a3a38] text-white font-bold rounded-2xl py-4 px-4 transition-all shadow-[0_8px_0_0_#0a3a38] hover:translate-y-1 hover:shadow-[0_4px_0_0_#0a3a38] focus:outline-none disabled:opacity-70 text-lg"
                                        >
                                            {isLoading ? 'Cargando...' : 'Reclamar y Acelerar XP'}
                                        </button>
                                    </div>
                                );
                            }

                            if (isUnlockedByLevel && isCity && !isSubscribed) {
                                return (
                                    <div className="space-y-4">
                                        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
                                            <p className="text-sm font-medium text-blue-700 leading-relaxed">
                                                Has desbloqueado este conocimiento, pero necesitas un guía para la misión. Activa tu suscripción para entrar a las clases grupales y reclamar tu territorio.
                                            </p>
                                        </div>
                                        <button 
                                            onClick={handleCheckout}
                                            disabled={isLoading}
                                            className="w-full bg-[#1976D2] hover:bg-[#1565C0] text-white font-bold rounded-2xl py-4 px-4 transition-all shadow-[0_8px_0_0_#0D47A1] hover:translate-y-1 hover:shadow-[0_4px_0_0_#0D47A1] focus:outline-none disabled:opacity-70 text-lg tracking-wide"
                                        >
                                            {isLoading ? 'Cargando...' : 'Desbloquear Acceso'}
                                        </button>
                                    </div>
                                );
                            }

                            if (isUnlockedByLevel && (!isCity || isSubscribed)) {
                                return (
                                    <button 
                                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-2xl py-4 px-4 transition-all shadow-[0_6px_0_0_#e5e7eb] hover:translate-y-1 hover:shadow-[0_2px_0_0_#e5e7eb] focus:outline-none text-lg"
                                        onClick={() => setSelectedZone(null)} // Or redirect to materials
                                    >
                                        Empezar Lección
                                    </button>
                                );
                            }

                            return (
                                <p className="text-sm text-gray-500 font-medium text-center">
                                    Completa niveles anteriores para abrir este camino.
                                </p>
                            );
                        })()}
                    </div>
                </div>
            )}
        </div>
    );
}
