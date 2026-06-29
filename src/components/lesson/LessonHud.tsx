'use client';

// HUD superior del player de lección — tematizado Minecraft (T1.2).
// Autocontenido y demo-able con props mock (no depende del player integrado).
//
// Render:
//  - Barra de XP SEGMENTADA en bloques (uno por ejercicio); el bloque actual "late".
//  - Corazones opcionales (ocultos si !livesEnabled → no estresar en bandas bajas).
//  - Contador de esmeraldas en vivo (economía Aldea).
//  - Botón X = "Volver a la aldea".
//  - Fondo del bioma a baja opacidad (color de cielo del bioma).
//  - Respeta prefers-reduced-motion (sin latido del bloque actual).

import React from 'react';
import { X, Heart, Gem } from 'lucide-react';
import type { LessonSection } from '@/lib/lessonContent';
import { allBiomes, type BiomeKey } from '@/lib/minecraft/biomes';
import { t } from '@/lib/minecraft/copy';

// Hook local: detecta prefers-reduced-motion (autocontenido, sin dependencias).
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

export interface LessonHudProps {
    /** índice del ejercicio actual (0-based). */
    index: number;
    /** total de ejercicios (nº de bloques de la barra). */
    total: number;
    /** momento de la lección (tematiza el color del bloque actual). */
    phaseSection?: LessonSection;
    /** esmeraldas (monedas) en vivo. */
    emeralds?: number;
    /** corazones restantes (sólo si livesEnabled). */
    hearts?: number;
    /** máximo de corazones a dibujar (default 3). */
    maxHearts?: number;
    /** activa los corazones (off en bandas bajas → no estresar). */
    livesEnabled?: boolean;
    /** bioma para el fondo a baja opacidad. */
    biomeKey?: BiomeKey;
    /** "Volver a la aldea" (X). */
    onExit?: () => void;
    className?: string;
}

// Color del bloque actual según la fase (madera→piedra→diamante, paralelo a PhaseRibbon).
const SECTION_COLOR: Record<LessonSection, string> = {
    recognize: 'var(--mc-wood)',
    produce: 'var(--mc-stone)',
    apply: 'var(--mc-diamond)',
};

// Color de cielo del bioma (para el fondo). Tolerante a clave desconocida.
function biomeSky(key?: BiomeKey): string {
    if (!key) return 'var(--mc-biome-pradera)';
    const b = allBiomes().find((x) => x.key === key);
    return b ? b.skyColor : 'var(--mc-biome-pradera)';
}

export default function LessonHud({
    index,
    total,
    phaseSection,
    emeralds,
    hearts = 0,
    maxHearts = 3,
    livesEnabled = false,
    biomeKey,
    onExit,
    className = '',
}: LessonHudProps) {
    const reduced = usePrefersReducedMotion();
    const n = Math.max(1, Math.floor(total) || 1);
    const cur = Math.max(0, Math.min(n - 1, Math.floor(index) || 0));
    const currentColor = phaseSection ? SECTION_COLOR[phaseSection] : 'var(--mc-grass)';
    const sky = biomeSky(biomeKey);

    return (
        <div className={`relative w-full ${className}`}>
            {/* Fondo de bioma a baja opacidad (no captura eventos). */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10"
                style={{ background: `linear-gradient(180deg, ${sky} 0%, transparent 100%)`, opacity: 0.18 }}
            />
            <div className="flex items-center gap-3 px-4 py-3 max-w-xl mx-auto">
                {/* X = Volver a la aldea */}
                <button
                    type="button"
                    onClick={onExit}
                    aria-label={t('backToVillage')}
                    title={t('backToVillage')}
                    className="shrink-0 grid place-items-center w-9 h-9 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-black/5 active:scale-95 transition"
                >
                    <X className="w-6 h-6" strokeWidth={3} />
                </button>

                {/* Barra de XP segmentada en bloques (uno por ejercicio). */}
                <div className="flex-1 flex items-center gap-1" role="progressbar" aria-valuemin={0} aria-valuemax={n} aria-valuenow={cur} aria-label="Progreso de la lección">
                    {Array.from({ length: n }).map((_, i) => {
                        const done = i < cur;
                        const isCurrent = i === cur;
                        const bg = done ? 'var(--mc-xp)' : isCurrent ? currentColor : 'rgba(0,0,0,0.10)';
                        const pulse = isCurrent && !reduced ? 'animate-pulse' : '';
                        return (
                            <span
                                key={i}
                                className={`h-3 flex-1 rounded-[4px] transition-colors ${pulse}`}
                                style={{
                                    background: bg,
                                    boxShadow: done || isCurrent
                                        ? 'inset 2px 2px 0 rgba(255,255,255,0.45), inset -2px -2px 0 rgba(0,0,0,0.22)'
                                        : 'none',
                                }}
                            />
                        );
                    })}
                </div>

                {/* Corazones (opcionales). */}
                {livesEnabled && (
                    <div className="shrink-0 flex items-center gap-0.5" aria-label={`${hearts} corazones`}>
                        {Array.from({ length: Math.max(0, Math.floor(maxHearts) || 0) }).map((_, i) => {
                            const filled = i < Math.max(0, Math.floor(hearts) || 0);
                            return (
                                <Heart
                                    key={i}
                                    className={`w-5 h-5 ${filled ? 'text-[var(--mc-redstone)]' : 'text-gray-300'}`}
                                    fill={filled ? 'var(--mc-redstone)' : 'transparent'}
                                    strokeWidth={2.5}
                                />
                            );
                        })}
                    </div>
                )}

                {/* Contador de esmeraldas. */}
                <div className="shrink-0 flex items-center gap-1 font-black text-[var(--mc-emerald-d)]" aria-label={`${emeralds ?? 0} ${t('emeralds')}`}>
                    <Gem className="w-5 h-5 text-[var(--mc-emerald)]" fill="var(--mc-emerald)" strokeWidth={2} />
                    <span className="tabular-nums">{emeralds ?? 0}</span>
                </div>
            </div>
        </div>
    );
}
