"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
    {
        src: "/images/photogallery/1Grande.png",
        alt: "Estudiantes en clase",
        caption: "No juegas solo: Aprende y convive con otros estudiantes en tiempo real.",
    },
    {
        src: "/images/photogallery/2Larga.png",
        alt: "Misiones en Minecraft",
        caption: "Usa el idioma mientras exploras el mundo y completas retos, misiones reales, inglés real.",
    },
    {
        src: "/images/photogallery/3Cuadrada.png",
        alt: "Plataforma de aprendizaje",
        caption: "Este es tu espacio para mejorar, aprende con calma y a tus tiempos.",
    },
    {
        src: "/images/photogallery/4Cuadrada.png",
        alt: "Experiencia in-game",
        caption: "Aplica lo que sabes en situaciones dentro del juego.",
    },
];

const VISIBLE = 3; // images visible at once on desktop

/* ── Desktop: 3-image strip with prev/next ── */
function DesktopStrip() {
    const [page, setPage] = useState(0);
    const totalPages = Math.ceil(slides.length / VISIBLE);

    const prev = () => setPage((p) => (p - 1 + totalPages) % totalPages);
    const next = () => setPage((p) => (p + 1) % totalPages);

    const startIdx = page * VISIBLE;
    // Get visible slides, wrapping around if needed
    const visibleSlides = Array.from({ length: VISIBLE }, (_, i) => slides[(startIdx + i) % slides.length]);

    return (
        <div className="flex flex-col gap-8">
            {/* Image strip */}
            <div className="grid grid-cols-3 gap-4 lg:gap-5">
                {visibleSlides.map((slide, i) => (
                    <motion.div
                        key={`${page}-${i}`}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: i * 0.08 }}
                        className="relative aspect-[3/4] rounded-2xl overflow-hidden group cursor-pointer"
                    >
                        <img
                            src={slide.src}
                            alt={slide.alt}
                            className="object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                        {/* Caption on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                            <p className="p-5 text-white text-sm lg:text-base font-medium leading-relaxed">
                                {slide.caption}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
                <button
                    onClick={prev}
                    className="inline-flex items-center gap-2 bg-[#1d1d1b]/80 hover:bg-[#1d1d1b] text-white px-6 py-3 rounded-full font-semibold text-sm transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Anterior
                </button>

                <span className="bg-[#1d1d1b]/80 text-white px-5 py-3 rounded-full font-bold text-sm tabular-nums">
                    {page + 1} / {totalPages}
                </span>

                <button
                    onClick={next}
                    className="inline-flex items-center gap-2 bg-[#1d1d1b]/80 hover:bg-[#1d1d1b] text-white px-6 py-3 rounded-full font-semibold text-sm transition-colors"
                >
                    Siguiente
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

/* ── Mobile: Stacked Cards ── */
function MobileStack() {
    return (
        <div className="flex flex-col gap-6">
            {slides.map((slide, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className="group"
                >
                    <div className="relative w-full aspect-[4/3] rounded-[1.5rem] overflow-hidden">
                        <img
                            src={slide.src}
                            alt={slide.alt}
                            className="object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                        <p className="absolute bottom-0 inset-x-0 p-4 text-white text-sm font-medium leading-relaxed">
                            {slide.caption}
                        </p>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}

export default function PhotoGallery() {
    return (
        <section className="relative w-full bg-[#e0dbce] rounded-t-[50px] rounded-b-[50px] py-12 md:py-16 overflow-hidden">
            <div className="max-w-[92vw] sm:max-w-[90vw] mx-auto">
                {/* Mobile: stacked */}
                <div className="block md:hidden">
                    <MobileStack />
                </div>
                {/* Desktop: strip with pagination */}
                <div className="hidden md:block">
                    <DesktopStrip />
                </div>
            </div>
        </section>
    );
}
