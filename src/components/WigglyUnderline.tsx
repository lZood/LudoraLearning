import React from "react";

interface WigglyUnderlineProps {
    children: React.ReactNode;
    text?: string;
    color?: string;
    speed?: string;
    thickness?: string;
    scaleX?: string | number;
    hoverOnly?: boolean;
    className?: string;
}

/**
 * COMPONENTE REUTILIZABLE: WigglyUnderline
 */
export function WigglyUnderline({
    children,
    text, // mantenemos el prop aunque no se use en el SVG para evitar errores de tipo si se pasa
    color = "#ffc823",
    speed = "3s",
    thickness = "6px",
    scaleX = "2.5",
    hoverOnly = false,
    className = "",
}: WigglyUnderlineProps) {
    // Cálculos matemáticos para generar el SVG basado en tus props
    const numScaleX = typeof scaleX === "string" ? parseFloat(scaleX) : scaleX;
    const cycleWidth = 40 * (numScaleX || 2.5);
    const numThickness = typeof thickness === "string" ? parseFloat(thickness) : parseFloat(thickness || "6");

    const amplitude = 12; // Altura de la curva
    const centerY = 20;   // Centro vertical
    const svgHeight = 40; // Altura del lienzo SVG

    // Generamos el SVG dinámico con curvas perfectas
    const svgString = `<svg width="${cycleWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg"><path d="M 0 ${centerY} Q ${cycleWidth / 4} ${centerY - amplitude} ${cycleWidth / 2} ${centerY} T ${cycleWidth} ${centerY}" fill="none" stroke="${color}" stroke-width="${numThickness || 6}" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    const encodedSvg = `url("data:image/svg+xml;utf8,${encodeURIComponent(svgString)}")`;

    return (
        <>
            {/* ESTILOS INYECTADOS: Hacen que el componente no dependa de archivos CSS externos */}
            <style>{`
                .reusable-wiggly-underline {
                    text-decoration: none;
                    position: relative;
                    display: inline-block;
                    padding-bottom: 0.2em; 
                    color: inherit;
                }
                
                .reusable-wiggly-underline::after {
                    content: "";
                    position: absolute;
                    left: 0;
                    right: 0;
                    bottom: -15px; 
                    height: 40px; 
                    
                    background-image: var(--wiggly-svg);
                    background-repeat: repeat-x;
                    background-position: 0 center;
                    pointer-events: none;
                    
                    animation: wavy-bg-slide var(--wiggly-speed) linear infinite;
                }

                .reusable-wiggly-underline.hover-only::after {
                    animation-play-state: paused;
                }
                .reusable-wiggly-underline.hover-only:hover::after {
                    animation-play-state: running;
                }
                
                @keyframes wavy-bg-slide {
                    from { background-position: 0 center; }
                    to { background-position: calc(-1 * var(--cycle-width)) center; }
                }
            `}</style>

            <span
                className={`reusable-wiggly-underline ${hoverOnly ? "hover-only" : ""} ${className}`}
                style={{
                    "--wiggly-svg": encodedSvg,
                    "--wiggly-speed": speed,
                    "--cycle-width": `${cycleWidth}px`,
                } as React.CSSProperties}
            >
                {children}
            </span>
        </>
    );
}
