'use client';

// Componente visual MARCO tipo libro / mesa de crafteo (reutilizable y presentacional).
// Es la "envoltura" estética del paso TE MUESTRO (Libro de Recetas) y de cualquier
// otra superficie que necesite el look de un libro/mesa Minecraft propio.
// No lleva lógica de aprendizaje: solo pinta el marco temático y coloca el contenido.
//
// Identidad propia inspirada en Minecraft (sin assets/nombres de Mojang). Usa tokens
// --mc-* de globals.css. Respeta prefers-reduced-motion (no anima por sí mismo).
//
// Props:
//  - theme:   'recipe_book' | 'crafting_table' | 'enchanting_table' | 'map' (estética del marco).
//  - title:   título mostrado en la "tapa" del libro.
//  - intro:   bajada/instrucción breve bajo el título.
//  - owner:   slot opcional (p. ej. el aldeano dueño/mascota) que "abre" el libro.
//  - footer:  slot opcional al pie (contador, botón, etc.).
//  - children: contenido de la página (los bloques-ingrediente).

import React from 'react';
import type { PresentTheme } from '@/lib/lessonContent';

export interface RecipeBookProps {
    theme?: PresentTheme;
    title?: string;
    intro?: string;
    owner?: React.ReactNode;
    footer?: React.ReactNode;
    children?: React.ReactNode;
    className?: string;
}

// Estética por tema. `cover`/`coverD` = tapa (bisel), `page` = página interior,
// `ink` = color de texto sobre la página, `icon`/`label` = adorno de la pestaña.
interface ThemeStyle { label: string; icon: string; cover: string; coverD: string; page: string; pageEdge: string; ink: string; inkSoft: string; }
const THEME_STYLE: Record<PresentTheme, ThemeStyle> = {
    recipe_book: {
        label: 'Libro de Recetas', icon: '📖',
        cover: 'var(--mc-plank)', coverD: 'var(--mc-plank-d)',
        page: '#f7eecb', pageEdge: '#e6d6a2', ink: '#5a3f22', inkSoft: '#8a6a3f',
    },
    crafting_table: {
        label: 'Mesa de Crafteo', icon: '🧰',
        cover: 'var(--mc-wood)', coverD: 'var(--mc-wood-d)',
        page: '#e9d2ab', pageEdge: '#d3b483', ink: '#5a3f22', inkSoft: '#8a6a3f',
    },
    enchanting_table: {
        label: 'Mesa de Encantamientos', icon: '✨',
        cover: 'var(--mc-obsidian)', coverD: 'var(--mc-obsidian-d)',
        page: '#3a3358', pageEdge: '#2a2440', ink: '#ece7ff', inkSoft: '#b9aee6',
    },
    map: {
        label: 'Mapa', icon: '🗺️',
        cover: 'var(--mc-sand)', coverD: 'var(--mc-sand-d)',
        page: '#f6eccc', pageEdge: '#e3d5a8', ink: '#5a3f22', inkSoft: '#8a6a3f',
    },
};

export default function RecipeBook({
    theme = 'recipe_book',
    title,
    intro,
    owner,
    footer,
    children,
    className = '',
}: RecipeBookProps) {
    const s = THEME_STYLE[theme] ?? THEME_STYLE.recipe_book;

    return (
        <div
            className={`relative w-full max-w-xl mx-auto rounded-[14px] overflow-hidden ${className}`}
            style={{
                background: s.cover,
                // Bisel macizo estilo bloque: luz arriba/izq, sombra abajo/der.
                boxShadow: [
                    'inset 5px 5px 0 rgba(255,255,255,0.30)',
                    'inset -5px -5px 0 rgba(0,0,0,0.30)',
                    '0 8px 0 rgba(0,0,0,0.22)',
                ].join(', '),
            }}
        >
            {/* Pestaña / tapa del libro */}
            <div className="flex items-center gap-3 px-4 pt-3 pb-2">
                <span className="text-2xl drop-shadow-sm" aria-hidden>{s.icon}</span>
                <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-black uppercase tracking-wider text-white/85 leading-none">{s.label}</p>
                    {title && <h2 className="text-lg font-black text-white leading-tight drop-shadow-[0_1px_0_rgba(0,0,0,0.35)] truncate">{title}</h2>}
                </div>
                {owner && <div className="shrink-0">{owner}</div>}
            </div>

            {/* Página interior */}
            <div
                className="mx-2 mb-2 rounded-[10px] px-4 py-4"
                style={{
                    background: s.page,
                    boxShadow: `inset 0 0 0 3px ${s.pageEdge}, inset 0 2px 8px rgba(0,0,0,0.10)`,
                }}
            >
                {intro && (
                    <p className="text-sm font-bold mb-3 leading-snug" style={{ color: s.inkSoft }}>
                        {intro}
                    </p>
                )}
                <div style={{ color: s.ink }}>{children}</div>
            </div>

            {footer && <div className="px-3 pb-3 pt-0">{footer}</div>}
        </div>
    );
}
