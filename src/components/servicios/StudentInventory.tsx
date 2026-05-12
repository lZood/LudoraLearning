"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { WigglyUnderline } from "@/components/WigglyUnderline";

// Agregamos iconSrc para usar las imágenes de Minecraft en lugar de Lucide
const INVENTORY_ITEMS = [
    {
        id: "server",
        title: "Servidor Privado",
        iconSrc: "/images/estrategia-page/grassblock.webp",
        color: "text-[#8ED462]",
        bgColor: "#8ED462",
        description: "Al inscribirte en tu primer módulo de aprendizaje con Ludora, obtienes acceso a nuestro servidor privado de Minecraft, donde aprenderemos inglés juntos dentro del juego. Las sesiones se realizan una vez por semana, tienen una duración de máximo 2 horas, y cada nivel está compuesto por 8 sesiones."
    },
    {
        id: "portal",
        title: "Portal de Alumnos",
        iconSrc: "/images/service-page/netherportal.gif",
        color: "text-[#a855f7]",
        bgColor: "#a855f7",
        description: "Desde tu inscripción también tendrás acceso inmediato a nuestro portal exclusivo para alumnos, un espacio diseñado para complementar y reforzar tus sesiones in-game. Todo lo que practiques dentro de la plataforma podrás aplicarlo directamente en el juego mediante actividades, interacción y comunicación en tiempo real, ayudándote a mejorar de forma más natural y divertida."
    },
    {
        id: "gameplay",
        title: "Videos Gameplay",
        iconSrc: "/images/service-page/enderchest.gif",
        color: "text-[#3b82f6]",
        bgColor: "#3b82f6",
        description: "Dentro del portal podrás desbloquear videos correspondientes a tu nivel y al tema que estés cursando, en los que maestros reales juegan Minecraft mientras explican y refuerzan los contenidos vistos en clase, todo en formato gameplay."
    },
    {
        id: "tools",
        title: "Material Interactivo",
        iconSrc: "/images/estrategia-page/bookshelf.webp",
        color: "text-[#f59e0b]",
        bgColor: "#f59e0b",
        description: "Este portal es un beneficio adicional para nuestros alumnos, donde además de los videos encontrarás material de apoyo interactivo, como flashcards, cuadros de estudio, quizzes, dictados interactivos, retos de voz y muchas otras herramientas diseñadas para seguir aprendiendo mientras juegas."
    }
];

export default function StudentInventory() {
    const [activeItem, setActiveItem] = useState(0);

    // Variantes tomadas y adaptadas de LudoraCard para la transición al cambiar
    const containerVariants: Variants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.1,
            },
        },
        exit: {
            opacity: 0,
            scale: 0.95,
            transition: { duration: 0.2 }
        }
    };

    const colorBlockVariants: Variants = {
        hidden: { scale: 0.5, opacity: 0 },
        visible: {
            scale: 1,
            opacity: 1,
            transition: { duration: 0.3, ease: "easeOut" },
        },
    };

    const cardVariants: Variants = {
        hidden: { scale: 0.8, opacity: 0, y: 30 },
        visible: {
            scale: 1,
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 85,
                damping: 20,
            },
        },
    };

    return (
        <section
            className="w-full min-h-screen py-24 bg-[#86d2fb] text-white relative overflow-hidden flex flex-col justify-center rounded-b-[50px]"
        >

            <div className="max-w-7xl mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 items-center gap-10 lg:gap-16 w-full">

                {/* Columna Izquierda: Imagen del apicultor */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="flex justify-center lg:justify-start order-2 lg:order-1"
                >
                    <motion.img
                        src="/images/service-page/Inventario.webp"
                        alt="Personaje apicultor de Minecraft con abejas"
                        className="w-full max-w-md lg:max-w-xl h-auto object-contain drop-shadow-2xl"
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    />
                </motion.div>

                {/* Columna Derecha: Título + Card + Hotbar */}
                <div className="flex flex-col items-center lg:items-start gap-8 order-1 lg:order-2">

                    {/* Título */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
                        className="text-center lg:text-left w-full"
                    >
                        <h2 className="text-3xl md:text-5xl font-black text-white drop-shadow-lg tracking-tight">
                            Todo lo que ofrecemos para ti
                        </h2>
                    </motion.div>

                    {/* Card de Información */}
                    <div className="w-full flex items-center justify-center min-h-[360px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeItem}
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="relative w-full"
                            >
                                {/* Layer 1: Bloque de Color */}
                                <motion.div
                                    variants={colorBlockVariants}
                                    className="absolute inset-0 rounded-2xl md:rounded-[32px]"
                                    style={{ backgroundColor: INVENTORY_ITEMS[activeItem].bgColor }}
                                />

                                {/* Layer 2: Tarjeta Blanca */}
                                <motion.div
                                    variants={cardVariants}
                                    className="relative bg-[#ffffff] rounded-2xl md:rounded-[32px] p-8 md:p-10 border-0 flex flex-col items-start text-left shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
                                >
                                    <div className="flex items-center gap-5 mb-5">
                                        <div className="w-14 h-14 md:w-16 md:h-16 shrink-0">
                                            <img
                                                src={INVENTORY_ITEMS[activeItem].iconSrc}
                                                alt={INVENTORY_ITEMS[activeItem].title}
                                                className="w-full h-full object-contain drop-shadow-md"
                                            />
                                        </div>
                                        <h3 className="text-2xl md:text-4xl font-black tracking-tight text-[#222222]">
                                            {INVENTORY_ITEMS[activeItem].title}
                                        </h3>
                                    </div>

                                    <p className="text-base md:text-lg text-[#333333] leading-relaxed w-full text-left font-normal">
                                        {INVENTORY_ITEMS[activeItem].description}
                                    </p>
                                </motion.div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Hotbar de Minecraft */}
                    <div className="w-full flex justify-center">
                        <div className="bg-[#c6c6c6] p-3 md:p-4 inline-block rounded-md shadow-inner border-t-[4px] border-l-[4px] border-white border-b-[4px] border-r-[4px] border-b-[#555] border-r-[#555]">
                            <div className="flex flex-row justify-center gap-2 md:gap-3">
                                {INVENTORY_ITEMS.map((item, index) => {
                                    const isActive = activeItem === index;

                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => setActiveItem(index)}
                                            className={`
                                                relative w-14 h-14 md:w-16 md:h-16 flex flex-col items-center justify-center p-2
                                                transition-all duration-200
                                                bg-[#8b8b8b] border-t-[4px] border-l-[4px] border-b-[4px] border-r-[4px]
                                                ${isActive
                                                    ? 'border-t-[#373737] border-l-[#373737] border-b-[#fff] border-r-[#fff] bg-[#7a7a7a]'
                                                    : 'border-t-[#555] border-l-[#555] border-b-[#fff] border-r-[#fff] hover:bg-[#9e9e9e] shadow-[inset_-2px_-2px_0_rgba(0,0,0,0.1)]'
                                                }
                                            `}
                                        >
                                            <img src={item.iconSrc} alt={item.title} className="w-9 h-9 md:w-10 md:h-10 object-contain drop-shadow-md" />

                                            {isActive && (
                                                <motion.div
                                                    layoutId="inventory_highlight"
                                                    className="absolute inset-0 border-[4px] border-white pointer-events-none"
                                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                                />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}
