'use client';

// Biblia de tematización Minecraft — componente visual BLOQUE (reutilizable).
// Un "bloque" con dureza 1–3 (borde/sombra biselada estilo Minecraft propio).
// Identidad propia (sin assets de Mojang). Respeta prefers-reduced-motion vía CSS.
//
// Props:
//  - hardness: 1–3 (dureza del bloque: borde/sombra más gruesos = más difícil).
//  - selected: resalta el bloque (estado elegido).
//  - children: contenido (texto/icono).
//  - onClick / disabled: si hay onClick, el bloque se comporta como botón.

import React from 'react';

export interface BlockProps {
    hardness?: 1 | 2 | 3;
    selected?: boolean;
    children?: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
    /** color base del bloque (CSS color). Por defecto un tono "piedra". */
    color?: string;
    /** etiqueta accesible cuando el contenido no es texto. */
    ariaLabel?: string;
}

// Dureza -> grosor del bisel/sombra (px). Más dureza = bloque más "macizo".
const BEVEL: Record<number, number> = { 1: 3, 2: 5, 3: 7 };

export default function Block({
    hardness = 1,
    selected = false,
    children,
    onClick,
    disabled = false,
    className = '',
    color = '#cdd2da',
    ariaLabel,
}: BlockProps) {
    const h = (hardness === 2 || hardness === 3) ? hardness : 1;
    const bevel = BEVEL[h];

    // Bisel estilo Minecraft propio: luz arriba/izquierda, sombra abajo/derecha.
    const style: React.CSSProperties = {
        background: color,
        // borde superior/izquierdo claro, inferior/derecho oscuro (inset bevel).
        boxShadow: [
            `inset ${bevel}px ${bevel}px 0 rgba(255,255,255,0.45)`,
            `inset -${bevel}px -${bevel}px 0 rgba(0,0,0,0.28)`,
            selected ? '0 0 0 4px #88e04f' : `0 ${bevel}px 0 rgba(0,0,0,0.22)`,
        ].join(', '),
    };

    const base =
        'relative inline-flex items-center justify-center text-center font-black select-none ' +
        'rounded-[6px] px-4 py-3 transition-transform active:translate-y-[2px] ' +
        (disabled ? 'opacity-50 cursor-not-allowed ' : onClick ? 'cursor-pointer ' : '');

    if (onClick) {
        return (
            <button
                type="button"
                onClick={onClick}
                disabled={disabled}
                aria-pressed={selected}
                aria-label={ariaLabel}
                className={`${base} ${className}`}
                style={style}
            >
                {children}
            </button>
        );
    }

    return (
        <div role="img" aria-label={ariaLabel} className={`${base} ${className}`} style={style}>
            {children}
        </div>
    );
}
