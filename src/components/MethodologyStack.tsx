"use client";

import React from "react";
import { motion } from "framer-motion";
import { BookOpen, MessagesSquare, Users } from "lucide-react";
import localFont from "next/font/local";
import { Roboto } from "next/font/google";
import { WigglyUnderline } from "./WigglyUnderline";


const neueMachina = localFont({
    src: "../../public/fonts/NeueMachina-Ultrabold.otf",
    variable: "--font-neue-machina",
});

const roboto = Roboto({
    weight: ["400", "700"],
    subsets: ["latin"],
    display: "swap",
});

export default function MethodologyStack() {
    const cards = [
        {
            number: "01",
            description: "Aprende el vocabulario mientras lo usas en escenarios de supervivencia real.",
            icon: <BookOpen className="w-6 h-6 text-white" />,
            bgColor: "bg-white",
            textColor: "text-[#2ba0ff]", // Azul para el texto de la primera carta
            numberColor: "text-[#2ba0ff]",
            iconBg: "bg-[#2ba0ff]",
        },
        {
            number: "02",
            description: "Las reglas gramaticales cobran sentido resolviendo acertijos y crafteando.",
            icon: <MessagesSquare className="w-6 h-6 text-[#8ed462]" />,
            bgColor: "bg-[#8ed462]",
            textColor: "text-white",
            numberColor: "text-white",
            iconBg: "bg-white",
        },
        {
            number: "03",
            description: "Proyectos en equipo para dominar la comunicación y la resolución de problemas.",
            icon: <Users className="w-6 h-6 text-[#ff705d]" />,
            bgColor: "bg-[#ff705d]",
            textColor: "text-white",
            numberColor: "text-white",
            iconBg: "bg-white",
        },
    ];

    return (
        <section className="relative w-full bg-[#f5f1e4] text-[#1d1d1b]">
            <div className="max-w-[85vw] mx-auto py-32 flex flex-col lg:flex-row gap-16 lg:gap-32 relative">

                {/* Columna Izquierda (Texto Fijo & Subrayado Animado) */}
                <div className="w-full lg:w-1/2 lg:sticky lg:top-32 h-fit relative z-10">
                    <h2
                        className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight mb-8"
                    >
                        Aprende a tu propio{" "}
                        <WigglyUnderline color="#ebc1ff" speed="2.5s" thickness="12px" scaleX="2">
                            ritmo
                        </WigglyUnderline>
                    </h2>
                    <p className={`text-xl md:text-2xl leading-relaxed text-gray-700 max-w-xl ${roboto.className}`}>
                        Nuestra metodología se adapta a tu nivel. Cada bloque que colocas es una nueva palabra
                        aprendida, y cada misión es un paso más hacia la fluidez.
                    </p>
                </div>

                {/* Columna Derecha (Tarjetas Apilables) */}
                <div className="w-full lg:w-1/2 flex flex-col gap-[75px] relative z-20">
                    {cards.map((card, index) => (
                        <motion.div
                            key={index}
                            className="sticky w-full rounded-[40px] overflow-hidden origin-bottom"
                            style={{
                                top: `calc(100px + ${index * 75}px)`,
                                zIndex: index
                            }}
                            initial={{
                                y: 350,
                                rotate: index % 2 === 0 ? 10 : -10
                            }}
                            whileInView={{ y: 0, rotate: 0 }}
                            viewport={{ once: true, margin: "-10% 0px -20% 0px" }}
                            transition={{ duration: 1.6, type: "spring", bounce: 0.2 }}
                        >
                            {/* Card Content Wrapper */}
                            <div className={`${card.bgColor} p-8 md:p-12 min-h-[60vh] md:min-h-[70vh] flex flex-col border border-black/5 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)]`}>

                                {/* Fila 1: Icono circular (Arriba a la derecha) */}
                                <div className="flex justify-end w-full">
                                    <div className={`${card.iconBg} w-16 h-16 rounded-full flex items-center justify-center shrink-0`}>
                                        {card.icon}
                                    </div>
                                </div>

                                {/* Fila 2: Número gigante (Ocupa el mayor espacio en el medio) */}
                                <div className="flex-grow flex items-center justify-start py-8">
                                    <span className={`text-[10rem] md:text-[14rem] lg:text-[16rem] font-medium tracking-tighter leading-none ${card.numberColor} ${roboto.className}`}>
                                        {card.number}+
                                    </span>
                                </div>

                                {/* Fila 3: Texto de descripción (Abajo) */}
                                <div className="w-full pb-4">
                                    <p className={`text-2xl md:text-3xl font-medium ${card.textColor} ${roboto.className}`}>
                                        {card.description}
                                    </p>
                                </div>

                            </div>
                        </motion.div>
                    ))}

                    {/* Espaciador fantasma para asegurar que haya suficiente 'scroll' restante y la última carta pueda llegar hasta arriba a quedarse "pegada" a la pantalla manteniendo su separación correcta */}
                    <div className="h-[80vh] w-full pointer-events-none" aria-hidden="true" />
                </div>
            </div>
        </section>
    );
}
