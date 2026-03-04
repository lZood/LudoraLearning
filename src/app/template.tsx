"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function Template({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Si estamos en la ruta principal (Home), no hacemos ninguna animación, 
    // simplemente renderizamos los hijos directamente.
    if (pathname === "/") {
        return <>{children}</>;
    }

    return (
        <>
            {/* 
        Telón verde.
        Cambiamos de z-[9999] a z-40 para que se dibuje por debajo del Header (que tiene z-50).
        De esta manera la animación no tapa la navegación principal.
      */}
            <motion.div
                className="fixed top-0 left-0 w-full bg-[#8ED462] z-40 pointer-events-none origin-top"
                initial={{ height: "100vh" }}
                animate={{ height: "0vh" }}
                transition={{
                    duration: 0.8,
                    ease: [0.22, 1, 0.36, 1]
                }}
            />

            {/* 
        Contenido de la página.
      */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                    duration: 0.8,
                    ease: [0.22, 1, 0.36, 1],
                    delay: 0.2,
                }}
            >
                {children}
            </motion.div>
        </>
    );
}
