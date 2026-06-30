'use client';

// WorldMap — Mapa de MUNDO estilo Minecraft (Track B / F3, §5.3 del master plan).
//
// Reemplaza CONCEPTUALMENTE a CourseMap (el orquestador hace el swap en
// cursos/page.tsx; este archivo NO toca CourseMap). Pinta:
//   - caminos serpenteantes por BIOMAS (biblia src/lib/minecraft/biomes).
//   - nodos = ESTRUCTURAS (casa/granja/mina/...) con estado:
//        locked = niebla + candado, in_progress, completed.
//   - ESTRELLAS de encantamiento (0–3) de user_progress.stars.
//   - bioma bloqueado = niebla + cofre con candado.
//
// Datos: acepta `biomes` ya construido con worldFromLevels(@/lib/world) — la vía
// preferida del orquestador y de los mocks de demo —, o las filas crudas
// (`levels`/`units`/`progress`) y los construye aquí. TODO degrada con datos vacíos.
//
// Mobile: tabs sticky por bioma con IntersectionObserver, conservando los ids
// `level-section-{levelId}` / `tab-{levelId}` y el ancla `data-tour='ruta'` para
// NO romper el onboarding tour. Estética propia inspirada en Minecraft (tokens --mc-*).

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
    Lock, Star, Check, Crown, Gift, Sprout, Pickaxe, Droplets, Castle,
    Compass, Store, Flame, Home, type LucideIcon,
} from 'lucide-react';
import {
    worldFromLevels,
    type WorldBiome,
    type WorldUnit,
    type LevelRow,
    type UnitRow,
    type ProgressRow,
} from '@/lib/world';
import type { StructureKey } from '@/lib/minecraft/structures';

// ── Props ─────────────────────────────────────────────────────────────────────
// El orquestador puede pasar `biomes` (preferido) o las filas crudas. Cada unidad
// enlaza a /portal-alumno/dashboard/unidad/{id}, por lo que las filas/biomas deben
// llevar el external_id como `id` (misma convención que CourseMap hoy).
export interface WorldMapProps {
    /** Mundo ya construido (worldFromLevels). Tiene prioridad si viene. */
    biomes?: WorldBiome[];
    /** Filas crudas (fallback): se construye el mundo internamente. */
    levels?: LevelRow[];
    units?: UnitRow[];
    progress?: ProgressRow[];
}

// Estructura -> icono lucide (identidad propia inspirada en Minecraft).
const STRUCTURE_ICON: Record<StructureKey, LucideIcon> = {
    casa: Home,
    granja: Sprout,
    mina: Pickaxe,
    pozo: Droplets,
    torre: Castle,
    faro: Compass,
    mercado: Store,
    portal: Flame,
};

// Etiqueta CEFR -> texto de banda amable (sin números crudos).
function biomeSubtitle(b: WorldBiome): string {
    const cefr = b.biome.cefr ? ` · ${b.biome.cefr}` : '';
    return `Bioma ${b.worldOrder}${cefr}`;
}

// Un bioma está bloqueado si NINGUNA de sus estructuras está abierta.
function isBiomeLocked(b: WorldBiome): boolean {
    return b.units.length > 0 && b.units.every((u) => u.status === 'locked');
}

export default function WorldMap(props: WorldMapProps) {
    const { biomes, levels, units, progress } = props;

    // Construye (o recibe) el mundo. Degrada a [] sin datos.
    const world = useMemo<WorldBiome[]>(() => {
        if (biomes && biomes.length) return biomes;
        if (levels && levels.length) return worldFromLevels(levels, units ?? [], progress ?? []);
        return biomes ?? [];
    }, [biomes, levels, units, progress]);

    const [activeLevelId, setActiveLevelId] = useState<string>(world[0]?.levelId ?? '');
    const observerRef = useRef<IntersectionObserver | null>(null);

    // IntersectionObserver mobile (mismo patrón/umbral que CourseMap).
    useEffect(() => {
        const initObserver = () => {
            if (observerRef.current) observerRef.current.disconnect();

            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            const levelId = entry.target.id.replace('level-section-', '');
                            setActiveLevelId(levelId);
                            const tabEl = document.getElementById(`tab-${levelId}`);
                            if (tabEl) tabEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                        }
                    });
                },
                { rootMargin: '-180px 0px -81% 0px', threshold: 0 }
            );

            world.forEach((b) => {
                const el = document.getElementById(`level-section-${b.levelId}`);
                if (el) observer.observe(el);
            });

            observerRef.current = observer;
        };

        if (window.innerWidth <= 1024) initObserver();

        const handleResize = () => {
            if (window.innerWidth <= 1024) {
                if (!observerRef.current) initObserver();
            } else if (observerRef.current) {
                observerRef.current.disconnect();
                observerRef.current = null;
            }
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            if (observerRef.current) observerRef.current.disconnect();
        };
    }, [world]);

    const scrollToLevel = (id: string) => {
        setActiveLevelId(id);
        const el = document.getElementById(`level-section-${id}`);
        if (el) {
            const yOffset = -120;
            const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    if (world.length === 0) {
        return (
            <div className="text-center py-20 text-gray-500 font-medium">
                Tu mundo se está generando. Vuelve pronto.
            </div>
        );
    }

    return (
        <>
            {/* Tabs sticky por bioma (mobile). Conserva data-tour='ruta' + tab-{id}. */}
            <div
                data-tour="ruta"
                className="lg:hidden sticky top-[52px] z-40 bg-white/95 backdrop-blur-xl border-b border-gray-100 pt-1 pb-2 px-4 shadow-sm w-full mx-auto"
            >
                <div
                    className="flex overflow-x-auto gap-4 snap-x pb-2"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {world.map((b) => {
                        const Icon = STRUCTURE_ICON[b.units[0]?.structure.key ?? 'casa'] ?? Home;
                        const isActive = activeLevelId === b.levelId;
                        const locked = isBiomeLocked(b);
                        return (
                            <div
                                key={b.levelId}
                                id={`tab-${b.levelId}`}
                                className="snap-center shrink-0 flex flex-col items-center gap-2"
                            >
                                <button
                                    onClick={() => scrollToLevel(b.levelId)}
                                    aria-label={`Ir al bioma ${b.biome.label}`}
                                    className="flex items-center justify-center w-[76px] h-[76px] rounded-[14px] transition-all relative outline-none"
                                    style={{
                                        border: isActive ? '3px solid var(--mc-brand-purple, #7c4dff)' : '2px solid transparent',
                                        background: isActive ? b.biome.mapColor : '#f4f5f7',
                                        opacity: isActive ? 1 : 0.7,
                                        transform: isActive ? 'scale(1)' : 'scale(0.95)',
                                        boxShadow: 'inset 3px 3px 0 rgba(255,255,255,0.35), inset -3px -3px 0 rgba(0,0,0,0.22)',
                                    }}
                                >
                                    {locked ? (
                                        <Lock className="w-9 h-9 text-gray-500/80" strokeWidth={2} />
                                    ) : (
                                        <Icon
                                            className="w-9 h-9"
                                            style={{ color: isActive ? '#fff' : '#9aa0aa' }}
                                            strokeWidth={isActive ? 2.2 : 1.6}
                                        />
                                    )}
                                </button>
                                <span
                                    className="text-[12px] font-extrabold tracking-wide"
                                    style={{ color: isActive ? 'var(--mc-brand-purple, #7c4dff)' : '#6b7280' }}
                                >
                                    {b.biome.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="flex flex-col gap-10 lg:gap-16 py-4 md:py-8 w-full overflow-x-hidden">
                {world.map((b) => (
                    <div key={b.levelId} id={`level-section-${b.levelId}`}>
                        <BiomeSection biome={b} />
                    </div>
                ))}
            </div>
        </>
    );
}

// ── Sección de un bioma ─────────────────────────────────────────────────────────
function BiomeSection({ biome }: { biome: WorldBiome }) {
    const locked = isBiomeLocked(biome);
    const amplitude = 84; // px de zigzag del camino serpenteante

    return (
        <section className="relative flex flex-col items-center px-4">
            {/* Cabecera del bioma */}
            <header className="w-full max-w-2xl mb-6 md:mb-10">
                <div
                    className="relative rounded-[20px] overflow-hidden px-6 py-5 md:px-8 md:py-6"
                    style={{
                        background: `linear-gradient(135deg, ${biome.biome.skyColor}, ${biome.mapColor})`,
                        boxShadow: 'inset 4px 4px 0 rgba(255,255,255,0.25), inset -4px -4px 0 rgba(0,0,0,0.18)',
                    }}
                >
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-white/90 text-[12px] font-black uppercase tracking-[0.15em] drop-shadow">
                                {biomeSubtitle(biome)}
                            </p>
                            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight drop-shadow-[0_2px_0_rgba(0,0,0,0.25)]">
                                {biome.biome.label}
                            </h2>
                        </div>
                        <DangerPips danger={biome.danger} />
                    </div>
                </div>
            </header>

            {/* Camino serpenteante con sus estructuras */}
            <div className="relative w-full max-w-[420px] mx-auto">
                {/* Espina central (camino blocky, color del bioma a baja opacidad) */}
                <div
                    aria-hidden
                    className="absolute top-6 bottom-6 left-1/2 -ml-[4px] w-[8px] rounded-full"
                    style={{
                        background: `repeating-linear-gradient(to bottom, ${biome.mapColor} 0 10px, transparent 10px 20px)`,
                        opacity: locked ? 0.18 : 0.4,
                    }}
                />

                <div className="relative flex flex-col gap-7 md:gap-9 py-2">
                    {biome.units.map((unit, i) => {
                        const offset = Math.round(Math.sin(i * 1.05) * amplitude);
                        return (
                            <div
                                key={unit.id}
                                className="flex justify-center"
                                style={{ transform: `translateX(${offset}px)` }}
                            >
                                <StructureNode unit={unit} biomeColor={biome.mapColor} />
                            </div>
                        );
                    })}
                </div>

                {/* Niebla + cofre con candado cuando el bioma entero está bloqueado */}
                {locked && <BiomeFog biome={biome} />}
            </div>
        </section>
    );
}

// Peligro del bioma (0–3) como "picos" decorativos (nunca números crudos).
function DangerPips({ danger }: { danger: number }) {
    const n = Math.max(0, Math.min(3, danger));
    return (
        <div className="flex items-center gap-1" aria-label={`Peligro ${n} de 3`}>
            {[0, 1, 2].map((d) => (
                <span
                    key={d}
                    className="w-2.5 h-2.5 rounded-[2px]"
                    style={{
                        background: d < n ? 'var(--mc-redstone, #d6473c)' : 'rgba(255,255,255,0.35)',
                        boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.4), inset -1px -1px 0 rgba(0,0,0,0.25)',
                    }}
                />
            ))}
        </div>
    );
}

// Velo de niebla + Cofre con candado para un bioma bloqueado.
function BiomeFog({ biome }: { biome: WorldBiome }) {
    return (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-[20px] backdrop-blur-[3px] bg-white/55">
            <div
                className="flex flex-col items-center gap-3 px-6 py-5 rounded-[16px]"
                style={{
                    background: 'rgba(255,255,255,0.85)',
                    boxShadow: 'inset 3px 3px 0 rgba(255,255,255,0.6), inset -3px -3px 0 rgba(0,0,0,0.12)',
                }}
            >
                <div
                    className="relative w-16 h-16 rounded-[10px] flex items-center justify-center"
                    style={{
                        background: 'var(--mc-chest, #b5793b)',
                        boxShadow: 'inset 4px 4px 0 rgba(255,255,255,0.35), inset -4px -4px 0 rgba(0,0,0,0.3)',
                    }}
                >
                    <Gift className="w-8 h-8 text-white drop-shadow" strokeWidth={2.2} />
                    <span className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center border-2 border-white">
                        <Lock className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                    </span>
                </div>
                <p className="text-center text-[13px] font-bold text-gray-700 max-w-[220px] leading-snug">
                    Completa el bioma anterior para entrar a{' '}
                    <span style={{ color: biome.mapColor }} className="font-black">
                        {biome.biome.label}
                    </span>
                    .
                </p>
            </div>
        </div>
    );
}

// ── Nodo = ESTRUCTURA ───────────────────────────────────────────────────────────
function StructureNode({ unit, biomeColor }: { unit: WorldUnit; biomeColor: string }) {
    const Icon = STRUCTURE_ICON[unit.structure.key] ?? Home;
    const locked = unit.status === 'locked';
    const completed = unit.status === 'completed';
    const keystone = unit.kind === 'keystone';

    // Color/relleno del nodo por estado.
    const nodeColor = locked
        ? '#d4d7dd'
        : completed
            ? 'var(--mc-emerald, #2ecc71)'
            : biomeColor;

    const bevel = keystone ? 6 : 5;
    const sizeCls = keystone ? 'w-24 h-24' : 'w-20 h-20';

    const nodeStyle: React.CSSProperties = {
        background: nodeColor,
        boxShadow: [
            `inset ${bevel}px ${bevel}px 0 rgba(255,255,255,0.4)`,
            `inset -${bevel}px -${bevel}px 0 rgba(0,0,0,0.28)`,
            keystone && !locked ? '0 0 0 4px var(--mc-gold, #e8c14f)' : `0 ${bevel}px 0 rgba(0,0,0,0.2)`,
        ].join(', '),
    };

    const inner = (
        <>
            {/* Corona del keystone (Cofre del Bioma) */}
            {keystone && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                    <Crown
                        className="w-6 h-6"
                        style={{ color: locked ? '#b9bcc3' : 'var(--mc-gold, #e8c14f)' }}
                        fill={locked ? '#cfd2d8' : 'var(--mc-gold, #e8c14f)'}
                        strokeWidth={1.5}
                    />
                </span>
            )}

            <div
                className={`relative ${sizeCls} rounded-[16px] flex items-center justify-center transition-transform duration-300 ${
                    !locked ? 'group-hover:scale-105 group-active:translate-y-1' : ''
                }`}
                style={nodeStyle}
            >
                {locked ? (
                    <Lock className="w-8 h-8 text-gray-500/90" strokeWidth={2.4} />
                ) : (
                    <Icon className="w-9 h-9 text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.2)]" strokeWidth={2} />
                )}

                {/* Check de completado */}
                {completed && (
                    <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white flex items-center justify-center shadow">
                        <Check className="w-4 h-4" style={{ color: 'var(--mc-emerald-d, #1f9d57)' }} strokeWidth={3.5} />
                    </span>
                )}

                {/* Barra de maestría para estructuras en progreso */}
                {unit.status === 'in_progress' && unit.masteryPct > 0 && (
                    <div className="absolute -bottom-2 left-3 right-3 h-2 rounded-full bg-black/15 overflow-hidden">
                        <div
                            className="h-full rounded-full"
                            style={{ width: `${unit.masteryPct}%`, background: 'var(--mc-xp, #7ed957)' }}
                        />
                    </div>
                )}
            </div>

            {/* Estrellas de encantamiento (0–3) */}
            <EnchantStars stars={unit.stars} dim={locked} />

            {/* Etiqueta de la estructura */}
            <span
                className={`text-center text-[13px] font-extrabold leading-tight max-w-[150px] line-clamp-2 ${
                    locked ? 'text-gray-400' : 'text-gray-700'
                }`}
            >
                {unit.title}
            </span>
        </>
    );

    // Locked = no navegable (estructura cerrada). El resto enlaza a la unidad.
    if (locked) {
        return (
            <div
                className="relative flex flex-col items-center gap-2"
                aria-disabled="true"
                title="Estructura bloqueada"
            >
                {inner}
            </div>
        );
    }

    return (
        <Link
            href={`/portal-alumno/dashboard/unidad/${unit.id}`}
            className="group relative flex flex-col items-center gap-2 outline-none"
            aria-label={`${unit.title} — ${completed ? 'completada' : 'en progreso'}, ${unit.stars} de 3 encantamientos`}
        >
            {inner}
        </Link>
    );
}

// Estrellas de encantamiento (0–3) — oro encendido / piedra apagada.
function EnchantStars({ stars, dim }: { stars: number; dim?: boolean }) {
    const n = Math.max(0, Math.min(3, stars));
    return (
        <div className="flex items-center gap-1" aria-hidden>
            {[0, 1, 2].map((s) => {
                const on = s < n;
                return (
                    <Star
                        key={s}
                        className="w-4 h-4"
                        strokeWidth={1.5}
                        style={{
                            color: on && !dim ? 'var(--mc-gold, #e8c14f)' : '#c7cad1',
                            fill: on && !dim ? 'var(--mc-gold, #e8c14f)' : '#dde0e5',
                        }}
                    />
                );
            })}
        </div>
    );
}
