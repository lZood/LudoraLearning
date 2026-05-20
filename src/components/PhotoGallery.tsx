"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
    {
        src: "/images/photogallery/students.webp",
        alt: "Estudiantes aprendiendo juntos",
        caption: "No juegas solo: aprende y convive con otros estudiantes en tiempo real.",
    },
    {
        src: "/images/photogallery/football.webp",
        alt: "Deportes en Minecraft",
        caption: "Compite en actividades deportivas y usa el inglés bajo presión divertida.",
    },
    {
        src: "/images/photogallery/shop.webp",
        alt: "Tienda en Minecraft",
        caption: "Aprende vocabulario comprando, vendiendo y negociando en nuestras tiendas.",
    },
    {
        src: "/images/photogallery/kitchen.webp",
        alt: "Cocina en Minecraft",
        caption: "Sigue recetas en inglés y prepara platillos mientras practicas el idioma.",
    },
    {
        src: "/images/photogallery/converastion.webp",
        alt: "Conversación en inglés",
        caption: "Practica conversaciones reales con compañeros y maestros dentro del mundo.",

    },
    {
        src: "/images/photogallery/swiming.webp",
        alt: "Natación en Minecraft",
        caption: "Sumérgete en retos acuáticos que refuerzan vocabulario cotidiano.",
    },
    {
        src: "/images/photogallery/pigRace.webp",
        alt: "Carrera de cerdos",
        caption: "Participa en minijuegos locos y aprende a dar y seguir instrucciones.",
    },
    {
        src: "/images/photogallery/laberynth.webp",
        alt: "Laberinto en Minecraft",
        caption: "Resuelve laberintos y acertijos que ponen a prueba tu comprensión.",
    },
    {
        src: "/images/photogallery/words.webp",
        alt: "Retos de vocabulario",
        caption: "Construye palabras y frases en retos que fortalecen tu vocabulario.",
    },
];

const VISIBLE = 3; // images visible at once on desktop
const MOBILE_PREVIEW = 4; // images shown on mobile before CTA

/* ── Desktop: 3-image strip with prev/next ── */
function DesktopStrip() {
    const [page, setPage] = useState(0);
    const totalPages = Math.ceil(slides.length / VISIBLE);

    const prev = () => setPage((p) => (p - 1 + totalPages) % totalPages);
    const next = () => setPage((p) => (p + 1) % totalPages);

    const startIdx = page * VISIBLE;
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

/* ── Mobile: Stacked Cards (preview only) ── */
function MobileStack() {
    const preview = slides.slice(0, MOBILE_PREVIEW);

    return (
        <div className="flex flex-col gap-6">
            {preview.map((slide, i) => (
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
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
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
                {/* Mobile: stacked preview + CTA */}
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
