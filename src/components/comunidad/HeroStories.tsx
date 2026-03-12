"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useAnimationFrame, useMotionValue } from "framer-motion";
import { Swords, Shield, Heart, Zap, Medal } from "lucide-react";
import { WigglyUnderline } from "@/components/WigglyUnderline";

interface HeroStory {
    name: string;
    avatar: string;
    classType: string;
    level: number;
    before: string;
    after: string;
    instructorNote: string;
    accentColor: string;
    accentBg: string;
    shadowColor: string;
}

const stories: HeroStory[] = [
    {
        name: "Diego E.",
        avatar: "https://minotar.net/armor/bust/MHF_Steve/100.png",
        classType: "Guerrero · 10 años",
        level: 24,
        before: "Miedo a hablar en clase, vocabulario limitado a colores y números.",
        after: "Lidera expediciones, da instrucciones en tiempo real sin dudar.",
        instructorNote: "Diego pasó de ser observador a Capitán del equipo. Su fluidez mejoró increíblemente al no sentirse evaluado.",
        accentColor: "text-[#f59e0b]",
        accentBg: "bg-[#f59e0b]",
        shadowColor: "rgba(245, 158, 11, 0.4)",
    },
    {
        name: "Valentina P.",
        avatar: "https://minotar.net/armor/bust/MHF_Alex/100.png",
        classType: "Arquitecta · 12 años",
        level: 42,
        before: "Sabía leer bien, pero se bloqueaba completamente al intentar pronunciar.",
        after: "Explica sus diseños arquitectónicos completos detallando materiales (Oak Wood, Redstone) con gran acento.",
        instructorNote: "Construir le dio un propósito. Ahora su pronunciación es la más clara del servidor LATAM.",
        accentColor: "text-[#8ED462]",
        accentBg: "bg-[#8ED462]",
        shadowColor: "rgba(142, 212, 98, 0.4)",
    },
    {
        name: "Mateo L.",
        avatar: "https://minotar.net/armor/bust/MHF_Enderman/100.png",
        classType: "Explorador · 9 años",
        level: 15,
        before: "Odiaba las clases tradicionales de los sábados. Siempre estaba distraído.",
        after: "Se conecta 10 minutos antes. Lee todos los carteles del mapa para no perderse ninguna pista.",
        instructorNote: "La curiosidad pudo más que la apatía. Su comprensión lectora (Reading comprehension) despegó en 3 semanas.",
        accentColor: "text-[#a855f7]",
        accentBg: "bg-[#a855f7]",
        shadowColor: "rgba(168, 85, 247, 0.4)",
    },
    {
        name: "Ana Paola",
        avatar: "https://minotar.net/armor/bust/MHF_Pig/100.png",
        classType: "Alquimista · 14 años",
        level: 55,
        before: "Le daba vergüenza equivocarse frente a sus compañeros de escuela.",
        after: "Negocia intercambios complejos con otros jugadores defendiendo su inventario.",
        instructorNote: "El anonimato parcial de los avatares le dio la seguridad que le faltaba en el aula física.",
        accentColor: "text-[#ef4444]",
        accentBg: "bg-[#ef4444]",
        shadowColor: "rgba(239, 68, 68, 0.4)",
    },
];

const CharacterSheet = ({ t }: { t: HeroStory }) => {
    return (
        <div
            className="w-[340px] md:w-[420px] h-full flex-shrink-0 bg-[#2b2b2b] rounded-[30px] p-6 flex flex-col shadow-2xl border-4 border-[#3a3a3a] mx-4 transition-transform hover:scale-[1.02] hover:border-[#555]"
            style={{ boxShadow: `0 20px 50px -10px ${t.shadowColor}` }}
        >
            {/* Header: Avatar & Stats */}
            <div className="flex items-start gap-4 mb-6 border-b border-white/10 pb-6">
                <div className={`relative w-20 h-20 rounded-xl overflow-hidden bg-[#1a1a1a] flex-shrink-0 border-2 border-white/20`}>
                    <img
                        src={t.avatar}
                        alt={t.name}
                        className="w-full h-full object-cover scale-110"
                    />
                </div>
                <div className="flex-1">
                    <h3 className="font-black text-white text-2xl mb-1">{t.name}</h3>
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs font-bold uppercase tracking-wider ${t.accentColor}`}>
                            {t.classType}
                        </span>
                    </div>
                    {/* EXP Bar */}
                    <div className="flex items-center gap-2">
                        <div className="text-white text-xs font-bold bg-[#1a1a1a] px-2 py-0.5 rounded-md">LVL {t.level}</div>
                        <div className="flex-1 h-2 bg-black/50 rounded-full overflow-hidden">
                            <div className={`h-full ${t.accentBg} w-[75%]`} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Transformation */}
            <div className="flex-1 flex flex-col gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Shield className="w-4 h-4 text-gray-400" />
                        <span className="text-xs font-bold text-gray-400 uppercase">Estado Inicial</span>
                    </div>
                    <p className="text-white/70 text-sm font-medium leading-relaxed bg-black/20 p-3 rounded-xl border border-white/5">
                        {t.before}
                    </p>
                </div>

                {/* Arrow connector */}
                <div className="flex justify-center -my-2 z-10">
                    <div className={`w-6 h-6 rounded-full ${t.accentBg} flex items-center justify-center transform rotate-90 border-2 border-[#2b2b2b]`}>
                        <Zap className="w-3 h-3 text-[#2b2b2b] fill-current" />
                    </div>
                </div>

                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Swords className={`w-4 h-4 ${t.accentColor}`} />
                        <span className={`text-xs font-bold uppercase ${t.accentColor}`}>Nivel Actual</span>
                    </div>
                    <p className="text-white text-sm font-bold leading-relaxed bg-white/5 p-3 rounded-xl border border-white/10">
                        "{t.after}"
                    </p>
                </div>
            </div>

            {/* Instructor Note */}
            <div className="mt-auto bg-[#1a1a1a]/80 p-4 rounded-xl border-l-4 border-l-[#a855f7]">
                <div className="flex items-center gap-2 mb-1">
                    <Medal className="w-4 h-4 text-[#a855f7]" />
                    <span className="text-xs font-bold text-[#a855f7] uppercase tracking-wider">Bitácora del Instructor</span>
                </div>
                <p className="text-gray-300 text-xs font-medium italic">
                    {t.instructorNote}
                </p>
            </div>
        </div>
    );
}

export default function HeroStories() {
    const baseX = useMotionValue(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [singleSetWidth, setSingleSetWidth] = useState(0);

    const displayStories = [...stories, ...stories, ...stories, ...stories];

    useEffect(() => {
        const calculateWidth = () => {
            if (containerRef.current) {
                const width = containerRef.current.scrollWidth / 4;
                setSingleSetWidth(width);
                if (baseX.get() === 0) {
                    baseX.set(-width);
                }
            }
        };

        const timeoutId = setTimeout(calculateWidth, 100);
        window.addEventListener('resize', calculateWidth);
        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('resize', calculateWidth);
        };
    }, []);

    useAnimationFrame((t, delta) => {
        if (singleSetWidth === 0) return;
        if (isDragging) return;

        let currentX = baseX.get();
        if (!isHovered) {
            currentX -= 1 * (delta / 16);
        }

        if (currentX <= -(singleSetWidth * 2)) {
            currentX += singleSetWidth;
        } else if (currentX > -singleSetWidth) {
            currentX -= singleSetWidth;
        }

        baseX.set(currentX);
    });

    return (
        <section className="relative w-full py-24 md:py-32 bg-[#1a1a1a] rounded-[50px] overflow-hidden flex flex-col justify-center select-none shadow-[inset_0_10px_50px_rgba(0,0,0,0.5)]">
            {/* Background elements */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]" />

            <div className="relative z-10 w-full mb-16 md:mb-20 px-6 md:px-12 text-center max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.05] mb-6">
                        Historias de <br className="hidden md:block" />
                        <span className="text-[#a855f7] drop-shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                            Transformación
                        </span>
                    </h2>
                    <p className="text-[#cccccc] text-lg font-medium">
                        De Cero a Héroe. Descubre cómo nuestros estudiantes superaron el miedo a hablar inglés y se convirtieron en líderes dentro y fuera de la pantalla.
                    </p>
                </motion.div>
            </div>

            {/* Marquee Container */}
            <div
                className="relative w-full overflow-hidden py-10"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Edge gradients */}
                <div className="absolute left-0 top-0 bottom-0 w-12 md:w-32 bg-gradient-to-r from-[#1a1a1a] to-transparent z-20 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-12 md:w-32 bg-gradient-to-l from-[#1a1a1a] to-transparent z-20 pointer-events-none" />

                <motion.div
                    ref={containerRef}
                    className="flex w-max cursor-grab active:cursor-grabbing pb-8"
                    style={{ x: baseX }}
                    drag="x"
                    dragMomentum={false}
                    onDragStart={() => setIsDragging(true)}
                    onDragEnd={() => setIsDragging(false)}
                >
                    {displayStories.map((t, idx) => (
                        <CharacterSheet key={idx} t={t} />
                    ))}
                </motion.div>
            </div>

            <style jsx global>{`
                ::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </section>
    );
}
