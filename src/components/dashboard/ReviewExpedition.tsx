"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Pickaxe, Flame, ChevronRight } from "lucide-react";
import { COPY } from "@/lib/minecraft/copy";
import { toolForSkill } from "@/lib/minecraft/skills";

// ReviewExpedition — tarjeta/CTA "Expedición de repaso" (Master Plan §3.6, §5.3, F4·T4.1).
//
// Metáfora Minecraft: las menas (conceptos) se DESGASTAN con el tiempo; esta expedición
// invita a "re-minar / reparar los bloques desgastados de la aldea". Consume
// GET /api/reviews/due y muestra los conceptos due ordenados por strength (lo más
// olvidado arriba). Demo-able: acepta `initialReviews` para previsualizar sin red.
//
// No decide nada: solo lee el due y enlaza a la sesión de repaso (href configurable;
// el orquestador la cablea al player en modo repaso). Degrada con calma a un estado
// "todo afilado" cuando no hay deuda.

export interface DueReview {
    conceptId: string;
    slug: string;
    label: string;
    skill: string | null;
    theta: number;
    band: string | null;
    halfLifeHours: number;
    lastSeenAt: string | null;
    nextReviewAt: string | null;
    strength: number; // 0..1 (0 = mena más desgastada / antorcha apagada)
}

interface ReviewExpeditionProps {
    // Deep-link de la sesión de repaso. Por defecto al mapa de cursos; el orquestador
    // puede pasar la ruta del player en modo repaso (p.ej. /…/leccion/[id]?mode=review).
    href?: string;
    // Datos precargados (Storybook / SSR / demo) — si vienen, se omite el fetch.
    initialReviews?: DueReview[];
    // Cuántas menas listar como máximo en la tarjeta (la API ya ordena por strength).
    maxItems?: number;
    className?: string;
}

// Desgaste visible (0..100): a menor strength, más desgastada la mena. 0 = intacta.
function wearPct(strength: number): number {
    const s = Number.isFinite(strength) ? Math.max(0, Math.min(1, strength)) : 0;
    return Math.round((1 - s) * 100);
}

export default function ReviewExpedition({
    href = "/portal-alumno/dashboard/cursos",
    initialReviews,
    maxItems = 5,
    className = "",
}: ReviewExpeditionProps) {
    const [reviews, setReviews] = useState<DueReview[]>(initialReviews ?? []);
    const [loading, setLoading] = useState(!initialReviews);
    const [errored, setErrored] = useState(false);

    useEffect(() => {
        if (initialReviews) return; // modo demo / SSR: no consultar red
        let cancel = false;
        (async () => {
            try {
                const res = await fetch("/api/reviews/due?limit=20", { cache: "no-store" });
                if (!res.ok) throw new Error(String(res.status));
                const data = await res.json();
                if (!cancel) setReviews(Array.isArray(data.reviews) ? data.reviews : []);
            } catch {
                if (!cancel) setErrored(true);
            } finally {
                if (!cancel) setLoading(false);
            }
        })();
        return () => { cancel = true; };
    }, [initialReviews]);

    // Mientras carga: esqueleto sobrio con el marco de madera.
    if (loading) {
        return (
            <div className={`relative bg-[#c5a676] p-[5px] border-[4px] border-[#1a1a1a] shadow-[0_8px_24px_rgba(0,0,0,0.4)] ${className}`}>
                <div className="border-[3px] border-[#1a1a1a] bg-[#313131] p-5 animate-pulse">
                    <div className="h-5 w-44 bg-[#4a4a4a] mb-3" />
                    <div className="h-3 w-full bg-[#3c3c3c] mb-2" />
                    <div className="h-3 w-2/3 bg-[#3c3c3c]" />
                </div>
            </div>
        );
    }

    const count = reviews.length;
    const hasDebt = count > 0 && !errored;
    const items = reviews.slice(0, Math.max(1, maxItems));

    return (
        <div className={`relative bg-[#c5a676] p-[5px] border-[4px] border-[#1a1a1a] shadow-[0_10px_28px_rgba(0,0,0,0.45)] ${className}`}>
            {/* Esquinas del marco (estilo madera) */}
            <div className="absolute top-0 left-0 w-3 h-3 bg-[#6e4e31] border-2 border-[#1a1a1a] z-20" />
            <div className="absolute top-0 right-0 w-3 h-3 bg-[#6e4e31] border-2 border-[#1a1a1a] z-20" />
            <div className="absolute bottom-0 left-0 w-3 h-3 bg-[#6e4e31] border-2 border-[#1a1a1a] z-20" />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#6e4e31] border-2 border-[#1a1a1a] z-20" />

            <div className="relative border-[3px] border-[#1a1a1a] bg-[#313131] p-5">
                <div className="absolute inset-0 border-t-[3px] border-l-[3px] border-[#5a5a5a] pointer-events-none" />
                <div className="absolute inset-0 border-b-[3px] border-r-[3px] border-[#181818] pointer-events-none" />

                <div className="relative z-10">
                    {/* Encabezado */}
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-[#46a035] border-2 border-[#1a1a1a] p-1.5 shadow-[inset_1px_1px_0_#98d654]">
                            <Pickaxe className="w-5 h-5 text-white drop-shadow-[1px_1px_0_rgba(0,0,0,0.8)]" strokeWidth={2.5} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-white tracking-wide drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">
                                {COPY.reviewExpedition}
                            </h3>
                            <p className="text-xs text-[#bdbdbd] drop-shadow-[1px_1px_0_rgba(0,0,0,1)]">
                                {hasDebt
                                    ? `Tienes ${count} mena${count === 1 ? "" : "s"} por reparar`
                                    : "Tus menas siguen afiladas"}
                            </p>
                        </div>
                        {hasDebt && (
                            <span className="bg-[#1a1a1a] text-[#ffd34d] text-sm font-bold px-2.5 py-1 border-2 border-[#000] min-w-[34px] text-center">
                                {count}
                            </span>
                        )}
                    </div>

                    {/* Estado sin deuda: invitación calmada, sin presión (no punitivo). */}
                    {!hasDebt && (
                        <p className="text-sm text-[#d0d0d0] leading-snug drop-shadow-[1px_1px_0_rgba(0,0,0,0.9)]">
                            No hay bloques desgastados ahora mismo. Sigue craftiando y vuelve cuando
                            alguna mena necesite repararse.
                        </p>
                    )}

                    {/* Lista de menas desgastadas (la más olvidada primero). */}
                    {hasDebt && (
                        <ul className="space-y-2 mb-4">
                            {items.map((r) => {
                                const wear = wearPct(r.strength);
                                const tool = toolForSkill(r.skill);
                                return (
                                    <li key={r.conceptId} className="bg-[#262626] border-2 border-[#111] p-2.5">
                                        <div className="flex items-center justify-between gap-2 mb-1.5">
                                            <span className="text-sm font-semibold text-white truncate drop-shadow-[1px_1px_0_rgba(0,0,0,1)]">
                                                {r.label}
                                            </span>
                                            <span className="flex items-center gap-1 text-[11px] text-[#9e9e9e] shrink-0">
                                                <Flame className="w-3.5 h-3.5 text-[#ff8c2e]" strokeWidth={2.5} />
                                                {tool.label}
                                            </span>
                                        </div>
                                        {/* Barra de desgaste: a más desgaste, más roja la mena. */}
                                        <div className="h-2 w-full bg-[#111] border border-[#000] overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-[#d83a2e] to-[#ffa733]"
                                                style={{ width: `${wear}%` }}
                                                aria-label={`Desgaste ${wear}%`}
                                            />
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}

                    {/* CTA: arrancar la expedición (enlaza a la sesión de repaso). */}
                    {hasDebt && (
                        <Link
                            href={href}
                            className="group flex items-center justify-center gap-2 w-full bg-[#59ab38] hover:bg-[#6bd642] active:scale-[0.98] transition-all py-2.5 border-[3px] border-[#111] border-t-[#81d85d] border-l-[#81d85d]"
                        >
                            <span className="text-white font-bold tracking-wide drop-shadow-[2px_2px_0_rgba(0,0,0,0.85)]">
                                {COPY.review}
                            </span>
                            <ChevronRight className="w-5 h-5 text-white group-hover:translate-x-0.5 transition-transform drop-shadow-[1px_1px_0_rgba(0,0,0,0.8)]" strokeWidth={3} />
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
