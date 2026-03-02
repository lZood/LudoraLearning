"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function BlockyFinalSection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dim, setDim] = useState({ w: 0, h: 0 });

    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (entry) {
                setDim({ w: entry.contentRect.width, h: entry.contentRect.height });
            }
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    // Función para generar un "camino" (path) SVG puro ortogonal (líneas rectas) 
    // que simula paisajes de cubos Minecraft. Calcula matemáticamente basado en el ancho actual.
    const generateSteppedPath = (width: number, height: number, layerBaseRatio: number, seedOffset: number) => {
        if (width === 0 || height === 0) return "";

        // Define el tamaño del bloque dinámicamente: más pequeño en móviles, más grande en escritorio
        const blockSize = width < 768 ? 40 : 60;
        const cols = Math.ceil(width / blockSize);

        let path = `M0,${height} `; // Comienza en la esquina inferior izquierda

        for (let i = 0; i < cols; i++) {
            // Ruido pseudo-aleatorio combinando ondas sinusoidales para dar un aspecto de terreno orgánico pero en bloque
            const noise = Math.sin(i * 0.4 + seedOffset) * 2.0 + Math.sin(i * 0.7 + seedOffset * 2) * 1.5;

            // Calculamos a qué altura empieza esta capa (en pixeles desde arriba)
            const baseYPixels = height * layerBaseRatio;

            // Le sumamos el ruido, y lo forzamos a redondearse al tamaño del bloque para que caiga EXACTO en la cuadrícula (Snap)
            let y = Math.round((baseYPixels + noise * blockSize) / blockSize) * blockSize;

            // Prevenimos que se salga del contenedor
            if (y < blockSize) y = blockSize;
            if (y > height) y = height;

            // Dibuja una línea vertical perfecta (V) hasta el nuevo nivel en "Y"
            path += `V${y} `;

            // Dibuja una línea horizontal perfecta (H) atravesando toda esta columna
            const x = Math.min((i + 1) * blockSize, width); // Se detiene al borde derecho
            path += `H${x} `;
        }

        // Cierra el camino bajando hasta el fondo de manera recta, logrando una pieza sólida.
        path += `V${height} Z`;
        return path;
    };

    // Variants for the staggered block building animation
    const containerVariants: Variants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.15, // Delay between each layer popping up
            },
        },
    };

    const layerVariants: Variants = {
        hidden: { y: dim.h ? dim.h : 500 }, // Start shifted down by the height of the SVG container
        visible: {
            y: 0, // Slide up into place
            transition: {
                type: "spring",
                stiffness: 120, // Snappy but bouncy feel
                damping: 20,
            },
        },
    };

    return (
        <div className="w-full flex flex-col relative overflow-hidden bg-transparent rounded-b-[50px]">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }} // Triggers when 10% is visible
            >
                {/* Part 1: Blocky Transition Area (Background Layers) */}
                <div ref={containerRef} className="relative w-full h-[300px] md:h-[500px]">
                    {/* Layer 1 (Deepest Background) */}
                    <motion.svg
                        variants={layerVariants}
                        viewBox={`0 0 ${dim.w} ${dim.h}`}
                        className="absolute bottom-0 w-full h-full z-0 block overflow-visible"
                        fill="#1a3d12"
                    >
                        <path d={generateSteppedPath(dim.w, dim.h, 0.3, 0)} vectorEffect="non-scaling-stroke" />
                        {dim.h > 0 && <rect x="0" y={dim.h - 1} width={dim.w} height="2000" />}
                    </motion.svg>

                    {/* Layer 2 (Mid-Back) */}
                    <motion.svg
                        variants={layerVariants}
                        viewBox={`0 0 ${dim.w} ${dim.h}`}
                        className="absolute bottom-0 w-full h-full z-0 block overflow-visible"
                        fill="#2f6b21"
                    >
                        <path d={generateSteppedPath(dim.w, dim.h, 0.5, 13)} vectorEffect="non-scaling-stroke" />
                        {dim.h > 0 && <rect x="0" y={dim.h - 1} width={dim.w} height="2000" />}
                    </motion.svg>

                    {/* Layer 3 (Mid-Front) */}
                    <motion.svg
                        variants={layerVariants}
                        viewBox={`0 0 ${dim.w} ${dim.h}`}
                        className="absolute bottom-0 w-full h-full z-0 block overflow-visible"
                        fill="#56a83b"
                    >
                        <path d={generateSteppedPath(dim.w, dim.h, 0.65, 27)} vectorEffect="non-scaling-stroke" />
                        {/* Extensión hacia abajo para cubrir el fondo mientras sube la capa 4 y el CTA */}
                        {dim.h > 0 && <rect x="0" y={dim.h - 1} width={dim.w} height="2000" />}
                    </motion.svg>
                </div>

                {/* Part 2: Layer 4 + CTA combined into one animated wrapper */}
                <motion.div variants={layerVariants} className="w-full flex flex-col relative z-20">
                    {/* Layer 4 SVG is absolutely positioned to sit exactly on top of the 'stage' above */}
                    <div className="absolute bottom-full left-0 w-full h-[300px] md:h-[500px] pointer-events-none">
                        <svg viewBox={`0 0 ${dim.w} ${dim.h}`} className="absolute bottom-0 w-full h-full block translate-y-[1px]" fill="#8ed462">
                            <path d={generateSteppedPath(dim.w, dim.h, 0.8, 42)} vectorEffect="non-scaling-stroke" />
                        </svg>
                    </div>

                    {/* CTA Section */}
                    <section className="relative w-full min-h-[70vh] bg-[#8ed462] flex flex-col items-center justify-center px-6 pt-32 pb-32 text-center">
                        <h2 className="text-6xl md:text-8xl lg:text-9xl font-bold text-[#1d1d1b] tracking-tight mb-8">
                            ¡Todo listo para<br />craftear tu inglés!
                        </h2>
                        <p className="max-w-3xl text-xl md:text-2xl text-[#1d1d1b] leading-relaxed mb-12">
                            Ya sea que quieras dominar los comandos técnicos o simplemente charlar con amigos en servidores globales, estamos aquí para hacer que tu aprendizaje sea inmersivo, divertido y natural desde el primer bloque. Hablemos de tu próxima aventura.
                        </p>

                        <Link
                            href="/contacto"
                            className="group flex items-center relative rounded-xl bg-white shadow-xl overflow-hidden"
                            style={{ width: '360px', height: '64px' }}
                        >
                            {/* Icono a la izquierda (escala 0 por defecto) */}
                            <div className="absolute left-2 bg-[#8ed462] rounded-full w-12 h-12 flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] z-10 scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100">
                                <ChevronRight className="w-6 h-6 text-[#1d1d1b]" strokeWidth={3} />
                            </div>

                            {/* Texto centrado visualmente hacia la izquierda por defecto */}
                            <span className="absolute left-8 font-semibold text-[#1d1d1b] text-xl transition-transform duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] group-hover:translate-x-[48px]">
                                Agenda tu clase!
                            </span>

                            {/* Icono a la derecha por defecto (escala 100 por defecto) */}
                            <div className="absolute right-2 bg-[#8ed462] rounded-full w-12 h-12 flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] z-10 scale-100 opacity-100 group-hover:scale-0 group-hover:opacity-0">
                                <ChevronRight className="w-6 h-6 text-[#1d1d1b]" strokeWidth={3} />
                            </div>
                        </Link>

                        {/* 3 Columnas inferiores añadidas */}
                        <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mt-32 gap-6 text-[#1d1d1b] text-base md:text-lg font-medium opacity-90">
                            <div className="flex-1 text-center md:text-left">Fast, high-quality insights</div>
                            <div className="flex-1 text-center">One seamless project lead</div>
                            <div className="flex-1 text-center md:text-right">Built for multi-market studies</div>
                        </div>
                    </section>
                </motion.div>
            </motion.div>
        </div>
    );
}
