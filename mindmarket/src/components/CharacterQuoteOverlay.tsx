"use client";

import React from "react";
import { motion } from "framer-motion";

export default function CharacterQuoteOverlay() {
    return (
        <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
            {/* 
              Animación de flotación sobre todo el SVG.
              Flota hacia arriba y abajo infinitamente.
            */}
            <motion.div
                className="w-full h-full flex items-center justify-center relative translate-y-[20%]" // Ajustado para centrarse visualmente sobre la cabeza del personaje
                animate={{ y: [0, -10, 0] }}
                transition={{
                    repeat: Infinity,
                    duration: 5,
                    ease: "easeInOut",
                }}
            >
                {/* SVG a pantalla completa, posicionado para que el viewBox caiga sobre el personaje */}
                <svg
                    viewBox="0 0 1000 1000"
                    className="w-full h-full max-w-[1200px]"
                    preserveAspectRatio="xMidYMax meet"
                >
                    <defs>
                        {/* 
                          La curva por la cual viajará el texto.
                          Empieza a la izquierda (M), curva hacia arriba y sobre el centro (C),
                          y termina a la derecha. Ajusta estas coordenadas si el personaje cambia de tamaño.
                        */}
                        <path
                            id="yellow-curve-path"
                            d="M 250 850 C 250 650, 750 650, 750 850"
                        />
                    </defs>

                    {/* La línea amarilla visible trazando el mismo path */}
                    <use
                        href="#yellow-curve-path"
                        stroke="#ffeb3b"
                        strokeWidth="4"
                        fill="none"
                        className="drop-shadow-lg"
                    />

                    {/* El texto que fluye a lo largo del path */}
                    <text
                        className="fill-[#ffeb3b] font-bold text-4xl" // Estilo del texto
                        style={{ filter: "drop-shadow(2px 2px 0px rgba(0,0,0,0.5))" }} // Sombra dura estilo pixel
                    >
                        <textPath
                            href="#yellow-curve-path"
                            startOffset="50%" // Centra el texto en la curva
                            textAnchor="middle" // Ancla desde el centro
                        >
                            ¡Todo listo para craftear tu inglés!
                        </textPath>
                    </text>
                </svg>
            </motion.div>
        </div>
    );
}
