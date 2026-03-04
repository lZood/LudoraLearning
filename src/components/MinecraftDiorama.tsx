"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function MinecraftDiorama() {
    return (
        <section className="relative w-full h-[150vh] md:h-[120vh] overflow-hidden flex items-center justify-center bg-[#f5f1e4] rounded-[50px]">
            {/* Capa 1: Fondo (z-0) */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/images/barebonesBackground.webp"
                    alt="Minecraft background"
                    fill
                    className="object-cover object-center"
                    priority
                />
            </div>

            {/* Todo el Diorama (Líneas + Personaje + Cita) Flotando juntos */}
            <motion.div
                className="absolute inset-0 z-10 w-full h-full pointer-events-none flex items-center justify-center"
                animate={{ y: [0, -15, 0] }} // Contenedor global flotando suavemente
                transition={{
                    repeat: Infinity,
                    duration: 5,
                    ease: "easeInOut",
                }}
            >
                {/* 
                  Un único SVG a pantalla completa (w-full h-full) 
                  que maneja el orden de renderizado (Sandwich) a través del flujo del DOM.
                */}
                <svg
                    viewBox="0 0 1000 1000"
                    preserveAspectRatio="xMidYMax meet"
                    className="w-full h-full max-w-[1200px] pointer-events-none overflow-visible"
                >
                    <defs>
                        {/* 
                          Ruta completa (invisible):
                          Es la S completa que rodea al personaje por detrás y luego por delante.
                        */}
                        <path
                            id="ruta-completa"
                            d="M 50 400 C 300 200, 700 300, 800 500 C 900 700, 400 1000, 100 800"
                        />
                    </defs>

                    {/* 
                      CAPA TRASERA (Línea que va por detrás): 
                      Dibujamos solo la primera mitad de la curvatura.
                    */}
                    <path
                        d="M 50 400 C 300 200, 700 300, 800 500" // Primera mitad de la curva
                        stroke="#88e04f" /* Color verde brillante original de ScrollSnake */
                        strokeWidth="100"
                        strokeLinecap="round"
                        fill="none"
                        className="drop-shadow-lg"
                    />

                    {/* 
                      CAPA MEDIA (El Personaje):
                      Se dibuja DESPUÉS de la capa trasera, por lo tanto, la TAPA visualmente.
                      Los atributos x,y width,height se manejan en unidades del viewBox (1000x1000).
                    */}
                    <image
                        href="/images/Pescador.png"
                        x="-400"    // Ajusta X para centrarlo horizontalmente en el viewBox
                        y="-400"    // Ajusta Y para alinear su cabeza con las curvas
                        width="1500"
                        height="1500"
                        className="drop-shadow-2xl"
                    />

                    {/* 
                      CAPA FRONTAL (Línea que va por delante + Texto): 
                      Se dibuja DESPUÉS de la imagen, pasando por encima de ella.
                    */}
                    {/* La línea visible frontal (Segunda mitad de la curva) */}
                    <path
                        d="M 800 500 C 900 700, 400 1000, 100 800" // Segunda mitad de la curva
                        stroke="#88e04f"
                        strokeWidth="100"
                        strokeLinecap="round"
                        fill="none"
                        className="drop-shadow-lg"
                    />

                    {/* El texto que fluye a lo largo de la ruta completa invisible */}
                    <text
                        className="fill-[#1d1d1b] font-bold text-3xl"
                        style={{ filter: "drop-shadow(2px 2px 0px rgba(255,255,255,0.8))" }}
                    >
                        <textPath
                            href="#ruta-completa"
                            startOffset="50%" // Centrado
                            textAnchor="middle"
                        >
                            ¡Todo listo para craftear tu inglés!
                        </textPath>
                    </text>
                </svg>
            </motion.div>
        </section>
    );
}
