"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Gamepad2, Key, MonitorPlay, Shapes } from "lucide-react";

// Agregamos bgColor para usarlo en la animación estilo LudoraCard
const INVENTORY_ITEMS = [
    {
        id: "server",
        title: "Servidor Privado",
        icon: Gamepad2,
        color: "text-emerald-500",
        bgColor: "#10b981", // emerald-500
        description: "Al inscribirte en tu primer módulo de aprendizaje con Ludora, obtienes acceso a nuestro servidor privado de Minecraft, donde aprenderemos inglés juntos dentro del juego. Las sesiones se realizan una vez por semana, tienen una duración de una hora, y cada módulo está compuesto por 4 sesiones."
    },
    {
        id: "portal",
        title: "Portal de Alumnos",
        icon: Key,
        color: "text-purple-500",
        bgColor: "#a855f7", // purple-500
        description: "Desde tu primer módulo también tendrás acceso a nuestro portal exclusivo para alumnos, un espacio diseñado para que puedas repasar, complementar o reforzar lo aprendido durante tus sesiones in-game siempre que lo necesites."
    },
    {
        id: "gameplay",
        title: "Videos Gameplay",
        icon: MonitorPlay,
        color: "text-blue-500",
        bgColor: "#3b82f6", // blue-500
        description: "Dentro del portal podrás desbloquear videos correspondientes a tu nivel y al tema que estés cursando, en los que maestros reales juegan Minecraft mientras explican y refuerzan los contenidos vistos en clase, todo en formato gameplay."
    },
    {
        id: "tools",
        title: "Material Interactivo",
        icon: Shapes,
        color: "text-amber-500",
        bgColor: "#f59e0b", // amber-500
        description: "Este portal es un beneficio adicional para nuestros alumnos, donde además de los videos encontrarás material de apoyo interactivo, como flashcards, cuadros de estudio, quizzes, mini-games dentro del servidor y muchas otras herramientas diseñadas para seguir aprendiendo mientras juegas."
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
            // min-h-screen para todo el alto, fondo que solo abarca el ancho (100% auto) y no se repite
            // Usamos clases de Tailwind para alternar la imagen según el breakpoint
            className="w-full min-h-screen py-24 bg-[#86d2fb] text-white relative overflow-hidden flex flex-col justify-center bg-no-repeat bg-[length:100%_auto] bg-bottom bg-[url('/images/service-page/fondoTierrosoMovil.png')] md:bg-[url('/images/service-page/fondotierrosoPC.png')] rounded-b-[48px] md:rounded-b-[80px]"
        >

            <div className="max-w-4xl mx-auto px-6 relative z-10 flex flex-col items-center justify-between w-full h-full gap-12">

                {/* Lado Superior: Descripción del Ítem (La Card de Información Estilo LudoraCard) */}
                <div className="w-full flex-grow flex items-center justify-center min-h-[400px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeItem}
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="relative w-full max-w-3xl"
                        >
                            {/* Layer 1: Bloque de Color (Color Reveal) */}
                            <motion.div
                                variants={colorBlockVariants}
                                className="absolute inset-0 rounded-2xl md:rounded-[32px]"
                                style={{ backgroundColor: INVENTORY_ITEMS[activeItem].bgColor }}
                            />

                            {/* Layer 2: Tarjeta Blanca (Content Bounce) con ícono a la izquierda del título */}
                            <motion.div
                                variants={cardVariants}
                                className="relative bg-[#ffffff] rounded-2xl md:rounded-[32px] p-10 md:p-14 border-0 flex flex-col items-start text-left shadow-[0_8px_30px_rgb(0,0,0,0.06)]"
                            >
                                <div className="flex items-center gap-4 mb-6">
                                    {React.createElement(INVENTORY_ITEMS[activeItem].icon, {
                                        className: `w-12 h-12 md:w-14 md:h-14 ${INVENTORY_ITEMS[activeItem].color}`
                                    })}
                                    <h3 className="text-3xl md:text-[2.75rem] font-medium tracking-tight text-[#222222]">
                                        {INVENTORY_ITEMS[activeItem].title}
                                    </h3>
                                </div>

                                <p className="text-xl md:text-[22px] text-[#333333] leading-snug w-full text-left font-normal">
                                    {INVENTORY_ITEMS[activeItem].description}
                                </p>
                            </motion.div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Lado Inferior: El UI de Inventario (Estilo Hotbar de Minecraft) */}
                <div className="w-full flex flex-col items-center pb-8">
                    <div className="bg-[#c6c6c6] p-4 mx-auto inline-block rounded-md shadow-inner border-t-[4px] border-l-[4px] border-white border-b-[4px] border-r-[4px] border-b-[#555] border-r-[#555]">
                        <div className="flex flex-row justify-center gap-2 md:gap-4">
                            {INVENTORY_ITEMS.map((item, index) => {
                                const isActive = activeItem === index;
                                const Icon = item.icon;

                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveItem(index)}
                                        className={`
                                            relative w-16 h-16 md:w-20 md:h-20 flex flex-col items-center justify-center p-2 
                                            transition-all duration-200
                                            bg-[#8b8b8b] border-t-[4px] border-l-[4px] border-b-[4px] border-r-[4px]
                                            ${isActive
                                                ? 'border-t-[#373737] border-l-[#373737] border-b-[#fff] border-r-[#fff] bg-[#7a7a7a]' // Presionado
                                                : 'border-t-[#555] border-l-[#555] border-b-[#fff] border-r-[#fff] hover:bg-[#9e9e9e] shadow-[inset_-2px_-2px_0_rgba(0,0,0,0.1)]' // Normal
                                            }
                                        `}
                                    >
                                        <Icon className={`w-8 h-8 md:w-10 md:h-10 drop-shadow-md ${isActive ? item.color : 'text-[#333]'}`} />

                                        {/* Highlight verde al seleccionarse como inventario activo de MC */}
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
        </section>
    );
}
