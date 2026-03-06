"use client";

import { ReactNode, useContext, useRef, useState, useLayoutEffect, useEffect } from "react";
import { LayoutRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { usePathname } from "next/navigation";

// Este componente "congela" el estado del enrutador de Next.js en el momento
// en que se monta. Esencial para AnimatePresence ya que le permite a Framer Motion
// renderizar la página *anterior* mientras ejecuta su animación de salida (`exit`),
// incluso si Next.js ya ha desmontado esa ruta en el Virtual DOM.
export function FrozenRoute({ children }: { children: ReactNode }) {
    const context = useContext(LayoutRouterContext);
    const frozen = useRef(context).current;

    const pathname = usePathname();
    const originalPathname = useRef(pathname);

    const [isExiting, setIsExiting] = useState(false);
    const [exitScroll, setExitScroll] = useState(0);
    const savedScrollY = useRef(0);

    // Mantenemos track del scroll real antes del cambio de ruta
    useEffect(() => {
        const handleScroll = () => { savedScrollY.current = window.scrollY; };
        handleScroll();
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useLayoutEffect(() => {
        if (pathname !== originalPathname.current && !isExiting) {
            setIsExiting(true);
            setExitScroll(savedScrollY.current);
        }
    }, [pathname, isExiting]);

    return (
        <LayoutRouterContext.Provider value={frozen}>
            {isExiting ? (
                // Al salir, simulamos un viewport de pantalla estática.
                // El padre motion.div está en absolute/grid por lo que anclamos al top
                <div className="absolute top-0 left-0 w-full h-[100vh] overflow-hidden pointer-events-none">
                    <div style={{ transform: `translateY(-${exitScroll}px)` }}>
                        {children}
                    </div>
                </div>
            ) : (
                <div className="h-full w-full">
                    {children}
                </div>
            )}
        </LayoutRouterContext.Provider>
    );
}
