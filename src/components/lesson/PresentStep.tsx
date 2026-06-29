'use client';

// Paso "TE MUESTRO" (liberación gradual — ejemplos primero). Es la "fase 0" de la
// lección v2: el aldeano dueño abre el Libro de Recetas y muestra 3–5 átomos como
// bloques-ingrediente. EXPOSICIÓN PURA: no califica ni paga XP. Ver §3.3 y §4.1 del
// master plan.
//
// Interacción:
//  - Al tocar un bloque-ingrediente, se "coloca" (sfx de bloque) y suena su audio EN
//    (ElevenLabs vía playAudio; TTS solo fallback). Tocar de nuevo lo vuelve a sonar.
//  - Contador "Toca cada bloque (n/total)".
//  - Botón "¡A craftear!" se habilita al tocar >= 1 bloque y llama onContinue().
//
// Autocontenido y demo-able con props mock (no depende del player integrado).
// Tematización Minecraft propia (tokens --mc-*), sin assets/nombres de Mojang.

import React, { useCallback, useState } from 'react';
import { Volume2, Check } from 'lucide-react';
import Block from '@/components/minecraft/Block';
import Mascot from '@/components/lesson/Mascot';
import RecipeBook from '@/components/lesson/RecipeBook';
import { charForSkill, characterForSkill } from '@/lib/minecraft/characters';
import { COPY } from '@/lib/minecraft/copy';
import { sfxUrl, SFX_VOLUME, type SfxKey } from '@/lib/minecraft/sfx';
import { playAudio } from '@/lib/lessonAudio';
import type { PresentStep as PresentStepData, PresentItem, Skill } from '@/lib/lessonContent';

export interface PresentStepProps {
    /** Datos del paso "TE MUESTRO" (3–5 items). */
    present: PresentStepData;
    /** Destreza de la lección: decide el aldeano dueño y su voz. */
    skill?: Skill | string;
    /** Se llama al pulsar "¡A craftear!" (transición a la fase de práctica). */
    onContinue: () => void;
}

// Reproduce un sfx de bloque de la biblia (sfx.ts) de forma autocontenida, sin depender
// de que lessonAudio.playSfx ya soporte las claves de bloque (otro track lo amplía).
function playBlockSfx(key: SfxKey) {
    try {
        const url = sfxUrl(key);
        if (!url) return;
        const a = new Audio(url);
        a.volume = SFX_VOLUME[key] ?? 0.5;
        a.play().catch(() => { /* autoplay bloqueado: silencioso */ });
    } catch { /* noop */ }
}

// Color de bloque por posición (ciclo de menas propias, tokens --mc-*).
const BLOCK_COLORS = [
    'var(--mc-grass)',
    'var(--mc-plank)',
    'var(--mc-stone)',
    'var(--mc-gold)',
    'var(--mc-diamond)',
];
// Dureza creciente: los primeros ingredientes "más blandos", los últimos "más macizos".
const hardnessFor = (i: number, total: number): 1 | 2 | 3 => {
    if (total <= 2) return 1;
    const r = i / Math.max(1, total - 1); // 0..1
    return r < 0.34 ? 1 : r < 0.67 ? 2 : 3;
};

export default function PresentStep({ present, skill, onContinue }: PresentStepProps) {
    const items: PresentItem[] = Array.isArray(present?.items) ? present.items : [];
    const total = items.length;

    const mascotChar = charForSkill(skill);            // 'granjerita' | 'apicultor'
    const character = characterForSkill(skill);         // nombre + voz del dueño
    const defaultVoice = character.voiceRole;

    // Índices ya "colocados" (tocados al menos una vez).
    const [tapped, setTapped] = useState<Set<number>>(() => new Set());

    const tapItem = useCallback((i: number, item: PresentItem) => {
        playBlockSfx('block_place');                    // "se coloca"
        const role = item.audioRole || defaultVoice;
        const text = item.en || item.headline || item.es || '';
        if (text) playAudio(text, role);                // suena su audio EN (ElevenLabs)
        setTapped((prev) => {
            if (prev.has(i)) return prev;
            const next = new Set(prev);
            next.add(i);
            return next;
        });
    }, [defaultVoice]);

    const tappedCount = tapped.size;
    const canCraft = tappedCount >= 1;
    const allTapped = total > 0 && tappedCount >= total;

    const title = present?.title || COPY.recipeBookTitle;
    const intro = present?.intro;

    // Globo del aldeano: anima a tocar; celebra al completar.
    const ownerLine = allTapped
        ? `¡Listo! Ya conoces los ingredientes. ${COPY.startCrafting}`
        : `¡Mira la receta! ${COPY.tapEachBlock}.`;

    return (
        <div className="flex flex-col min-h-[100dvh] w-full" style={{ background: 'color-mix(in srgb, var(--mc-grass-l) 35%, white)' }}>
            {/* Cabecera: el aldeano dueño abre el Libro de Recetas */}
            <div className="flex items-end gap-3 px-4 pt-4 pb-2 max-w-xl mx-auto w-full">
                <Mascot mood={allTapped ? 'happy' : 'curious'} character={mascotChar} className="w-16 h-16 shrink-0 drop-shadow" />
                <div className="relative mb-1 flex-1 rounded-2xl bg-white px-4 py-2 shadow-[0_3px_0_rgba(0,0,0,0.12)]">
                    <p className="text-[11px] font-black uppercase tracking-wider text-[var(--mc-brand-green-d)] leading-none">{character.name}</p>
                    <p className="text-sm font-bold text-gray-800 leading-snug">{ownerLine}</p>
                </div>
            </div>

            {/* Cuerpo: el Libro de Recetas con los bloques-ingrediente */}
            <div className="flex-1 overflow-y-auto px-3 pb-40 pt-1">
                <RecipeBook theme={present?.theme} title={title} intro={intro}>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {items.map((item, i) => {
                            const isTapped = tapped.has(i);
                            const main = item.headline || item.en || item.es || '';
                            const showEs = item.es && item.es !== main;
                            return (
                                <Block
                                    key={`${item.conceptId || 'item'}-${i}`}
                                    hardness={hardnessFor(i, total)}
                                    selected={isTapped}
                                    color={BLOCK_COLORS[i % BLOCK_COLORS.length]}
                                    onClick={() => tapItem(i, item)}
                                    ariaLabel={main}
                                    className={`!px-3 !py-3 w-full ${isTapped ? '' : 'motion-safe:animate-pulse'}`}
                                >
                                    <span className="relative flex w-full flex-col items-center gap-1 text-[#1f2937]">
                                        {/* Insignia "colocado" */}
                                        {isTapped && (
                                            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--mc-correct)] text-white shadow">
                                                <Check className="h-3.5 w-3.5" strokeWidth={3} />
                                            </span>
                                        )}
                                        <span className="text-3xl leading-none" aria-hidden>{item.icon || '🟩'}</span>
                                        <span className="text-[15px] font-black leading-tight">{main}</span>
                                        {showEs && <span className="text-[11px] font-bold opacity-75">{item.es}</span>}
                                        {item.ipa && <span className="text-[10px] font-semibold opacity-60">/{item.ipa}/</span>}
                                        <span className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-bold opacity-70">
                                            <Volume2 className="h-3 w-3" /> {isTapped ? 'Otra vez' : 'Tócame'}
                                        </span>
                                    </span>
                                </Block>
                            );
                        })}
                    </div>
                </RecipeBook>
            </div>

            {/* Pie fijo: contador + botón "¡A craftear!" */}
            <div className="fixed inset-x-0 bottom-0 z-30 border-t border-black/5 bg-white/95 px-4 py-3 backdrop-blur">
                <div className="mx-auto flex max-w-xl items-center gap-3">
                    <div className="flex-1">
                        <p className="text-[11px] font-black uppercase tracking-wider text-gray-500">{COPY.tapEachBlock}</p>
                        <p className="text-sm font-black text-gray-800">{tappedCount}/{total}</p>
                        {/* Barra de progreso de exposición (segmentada por bloque) */}
                        <div className="mt-1 flex gap-1">
                            {items.map((_, i) => (
                                <span
                                    key={i}
                                    className="h-1.5 flex-1 rounded-full transition-colors"
                                    style={{ background: tapped.has(i) ? 'var(--mc-correct)' : 'rgba(0,0,0,0.10)' }}
                                />
                            ))}
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onContinue}
                        disabled={!canCraft}
                        className={`shrink-0 rounded-2xl px-6 py-4 font-black uppercase tracking-wide transition-all active:scale-[0.98] ${
                            canCraft
                                ? 'bg-[var(--mc-brand-green)] text-[#1a1a1a] shadow-[0_4px_0_var(--mc-brand-green-d)]'
                                : 'cursor-not-allowed bg-gray-100 text-gray-300'
                        }`}
                    >
                        {COPY.startCrafting}
                    </button>
                </div>
            </div>
        </div>
    );
}
