'use client';

// Microcelebración de acierto — "bloque roto" / ráfaga de partículas (T1.2).
// Autocontenida y demo-able con props mock. Reusa el patrón de confeti existente
// (framer-motion, ver LevelUpModal) tematizado como esquirlas de bloque Minecraft.
//
// Uso: <Celebrate trigger={n} /> — cada cambio de `trigger` (a un valor nuevo y
// "truthy") dispara una ráfaga que se limpia sola. Respeta prefers-reduced-motion
// (si el usuario lo pide, no anima: muestra un destello breve y estático).

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface CelebrateProps {
    /** clave de disparo: al cambiar a un valor nuevo (truthy), lanza la ráfaga. */
    trigger: number | string | boolean;
    /** intensidad relativa (escala el nº de esquirlas). Default 1. */
    intensity?: number;
    className?: string;
}

// Colores de esquirla (tokens --mc-*): esmeralda/diamante/piedra/hierba (acierto).
const SHARD_COLORS = [
    'var(--mc-emerald)',
    'var(--mc-diamond)',
    'var(--mc-grass)',
    'var(--mc-xp)',
    'var(--mc-stone-l)',
];

const BASE_COUNT = 14;

// Hook local: prefers-reduced-motion (autocontenido).
function usePrefersReducedMotion(): boolean {
    const [reduced, setReduced] = React.useState(false);
    React.useEffect(() => {
        if (typeof window === 'undefined' || !window.matchMedia) return;
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        const update = () => setReduced(mq.matches);
        update();
        mq.addEventListener?.('change', update);
        return () => mq.removeEventListener?.('change', update);
    }, []);
    return reduced;
}

interface Shard { x: number; y: number; rotate: number; color: string; size: number; }

function makeShards(count: number): Shard[] {
    return Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
        const distance = 60 + Math.random() * 70;
        return {
            x: Math.cos(angle) * distance,
            y: Math.sin(angle) * distance,
            rotate: Math.random() * 360,
            color: SHARD_COLORS[i % SHARD_COLORS.length],
            size: 6 + Math.random() * 8,
        };
    });
}

export default function Celebrate({ trigger, intensity = 1, className = '' }: CelebrateProps) {
    const reduced = usePrefersReducedMotion();
    // burst guarda un id incremental + las esquirlas; null = nada en pantalla.
    const [burst, setBurst] = React.useState<{ id: number; shards: Shard[] } | null>(null);
    const lastTrigger = React.useRef<typeof trigger>(false);
    const idRef = React.useRef(0);

    React.useEffect(() => {
        // Sólo dispara cuando el valor cambia y es "truthy" (ignora el montaje en false/0).
        if (trigger === lastTrigger.current) return;
        lastTrigger.current = trigger;
        if (!trigger) return;

        idRef.current += 1;
        const id = idRef.current;
        const count = Math.max(4, Math.round(BASE_COUNT * Math.max(0.2, intensity)));
        setBurst({ id, shards: reduced ? [] : makeShards(count) });

        const ms = reduced ? 300 : 1100;
        const timer = setTimeout(() => {
            // Sólo limpia si seguimos en la misma ráfaga (evita cortar una posterior).
            setBurst((b) => (b && b.id === id ? null : b));
        }, ms);
        return () => clearTimeout(timer);
    }, [trigger, intensity, reduced]);

    return (
        <div className={`pointer-events-none absolute inset-0 overflow-visible grid place-items-center ${className}`} aria-hidden>
            <AnimatePresence>
                {burst && (
                    <motion.div
                        key={burst.id}
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="relative"
                    >
                        {/* Destello central (también visible en reduced-motion). */}
                        <motion.span
                            initial={{ scale: reduced ? 1 : 0, opacity: 0.8 }}
                            animate={{ scale: reduced ? 1 : 1.6, opacity: 0 }}
                            transition={{ duration: reduced ? 0.25 : 0.5, ease: 'easeOut' } as never}
                            className="absolute top-0 left-0 w-12 h-12 -translate-x-1/2 -translate-y-1/2 rounded-md"
                            style={{ background: 'var(--mc-xp)', filter: 'blur(2px)' }}
                        />
                        {/* Esquirlas del bloque roto (omitidas si reduced-motion). */}
                        {burst.shards.map((s, i) => (
                            <motion.span
                                key={i}
                                initial={{ x: 0, y: 0, opacity: 1, scale: 0.4, rotate: 0 }}
                                animate={{ x: s.x, y: s.y, opacity: 0, scale: 1, rotate: s.rotate }}
                                transition={{ duration: 1, ease: 'easeOut' } as never}
                                className="absolute top-0 left-0"
                                style={{
                                    width: s.size,
                                    height: s.size,
                                    background: s.color,
                                    borderRadius: 2,
                                    boxShadow: 'inset 2px 2px 0 rgba(255,255,255,0.45), inset -2px -2px 0 rgba(0,0,0,0.25)',
                                }}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
