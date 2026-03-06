"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { FrozenRoute } from "./FrozenRoute";

export default function PageTransition({ children }: { children: ReactNode }) {
    const pathname = usePathname();

    return (
        // Es crítico establecer un grid aquí para que los elementos hijos compartan la
        // misma celda y se dibujen uno sobre otro durante la animación.
        <div className="grid grid-cols-1 grid-rows-1">
            <AnimatePresence initial={false} mode="sync">
                <motion.div
                    key={pathname}
                    // Todos los motion div se ubican en la misma celda de la grilla
                    className="col-start-1 row-start-1 h-full w-full"
                    style={{ transformOrigin: "top center" }}
                    initial={{
                        y: "100vh", // Entra deslizándose desde abajo
                        scale: 1,
                        filter: "brightness(1)",
                        zIndex: 20, // Queda por delante del de salida
                    }}
                    animate={{
                        y: "0vh",
                        scale: 1,
                        filter: "brightness(1)",
                        zIndex: 10, // Cuando termina vuelve a su zIndex normal para no bloquear
                    }}
                    exit={{
                        y: "0vh",
                        scale: 0.92, // Se achica un poco hacia el fondo
                        filter: "brightness(0.5)", // Se oscurece
                        zIndex: 0, // Se queda por detrás del entrante
                    }}
                    transition={{
                        duration: 0.8,
                        ease: [0.22, 1, 0.36, 1], // Animación curva premium y suave
                    }}
                >
                    {/* 
            Congelamos la ruta saliente para que su Virtual DOM no desaparezca 
            y Framer Motion pueda aplicar el fade/scale down sobre ella 
          */}
                    <FrozenRoute>{children}</FrozenRoute>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
