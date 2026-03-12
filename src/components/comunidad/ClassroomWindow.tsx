"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Play, Volume2, VolumeX, Maximize2 } from "lucide-react";
import { WigglyUnderline } from "@/components/WigglyUnderline";

const clips = [
    {
        id: 1,
        title: "Diseño de Base Lunar",
        level: "Nivel 3 · Avanzado",
        videoUrl: "", // Poner URL real de video aquí
        poster: "https://images.unsplash.com/photo-1555099962-4199c345e5dd?auto=format&fit=crop&w=800&q=80",
        description: "Debate en inglés sobre la gestión de oxígeno en la base."
    },
    {
        id: 2,
        title: "Sistema de Riego",
        level: "Nivel 2 · Intermedio",
        videoUrl: "",
        poster: "https://images.unsplash.com/photo-1610484826967-09c5720778c7?auto=format&fit=crop&w=800&q=80",
        description: "Coordinando la recolección de cultivos usando vocabulario técnico."
    },
    {
        id: 3,
        title: "Refugio de Supervivencia",
        level: "Nivel 1 · Básico",
        videoUrl: "",
        poster: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80",
        description: "Primeros pasos: pidiendo materiales y herramientas."
    },
    {
        id: 4,
        title: "Defensa del Castillo",
        level: "Nivel 4 · Experto",
        videoUrl: "",
        poster: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",
        description: "Estrategias de defensa en tiempo real 100% en inglés."
    }
];

function VideoCard({ clip }: { clip: typeof clips[0] }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    return (
        <motion.div
            className="relative flex-shrink-0 w-[300px] md:w-[350px] h-[500px] md:h-[550px] rounded-[40px] overflow-hidden shadow-[0_20px_40px_rgb(0,0,0,0.12)] cursor-pointer group"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
            onClick={togglePlay}
        >
            {clip.videoUrl ? (
                <video
                    ref={videoRef}
                    src={clip.videoUrl}
                    poster={clip.poster}
                    className="w-full h-full object-cover"
                    loop
                    playsInline
                    muted={isMuted}
                />
            ) : (
                <img src={clip.poster} alt={clip.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

            {/* Play Button Overlay (Visible when paused) */}
            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-white/50 transition-transform group-hover:scale-110">
                        <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                </div>
            )}

            {/* Top Controls */}
            <div className="absolute top-6 right-6 flex gap-3">
                <button
                    onClick={toggleMute}
                    className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors"
                >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
            </div>

            {/* Content Bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 flex flex-col justify-end">
                <span className="inline-block px-4 py-1.5 bg-[#8ED462] text-[#222222] text-xs font-bold uppercase tracking-wider rounded-full mb-3 w-max">
                    {clip.level}
                </span>
                <h3 className="text-white text-2xl font-black mb-2 leading-tight">
                    {clip.title}
                </h3>
                <p className="text-white/80 text-sm font-medium line-clamp-2">
                    {clip.description}
                </p>
            </div>
        </motion.div>
    );
}

export default function ClassroomWindow() {
    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <section className="relative w-full py-24 md:py-32 bg-[#222222] overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]" />
            <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-[#8ED462]/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 max-w-[90vw] xl:max-w-[85vw] mx-auto mb-16 md:mb-20">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, type: "spring", bounce: 0.3 }}
                >
                    <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.05] mb-6">
                        Una ventana a  <br className="hidden md:block" />
                        <span className="text-[#8ED462]">
                            nuestras clases
                        </span>
                    </h2>
                    <p className="text-[#cccccc] text-lg md:text-xl max-w-2xl font-medium">
                        Escucha cómo nuestros alumnos se comunican en inglés mientras resuelven retos dentro de Minecraft. Sin guiones, solo aprendizaje real e inmersivo.
                    </p>
                </motion.div>
            </div>

            {/* Horizontal Scrollible Area */}
            <div className="relative z-10 w-full">
                {/* Scroll hint gradient left/right */}
                <div className="absolute left-0 top-0 bottom-0 w-8 md:w-24 bg-gradient-to-r from-[#222222] to-transparent z-20 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-8 md:w-24 bg-gradient-to-l from-[#222222] to-transparent z-20 pointer-events-none" />

                <div
                    ref={containerRef}
                    className="flex overflow-x-auto gap-6 px-8 md:px-[7.5vw] xl:px-[7.5vw] pb-12 pt-4 snap-x snap-mandatory hide-scrollbar"
                >
                    {clips.map((clip) => (
                        <div key={clip.id} className="snap-center md:snap-start">
                            <VideoCard clip={clip} />
                        </div>
                    ))}
                </div>
            </div>

            <style jsx global>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none; /* IE and Edge */
                    scrollbar-width: none; /* Firefox */
                }
            `}</style>
        </section>
    );
}
