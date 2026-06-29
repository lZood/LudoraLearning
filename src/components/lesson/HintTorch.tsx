'use client';

// "Antorcha" (pista) — Minecraft (T1.2). Autocontenida y demo-able con props mock.
// Al encender la antorcha (🔥) revela un texto de pista en el globo del aldeano.
// La pista NUNCA es spoiler de la respuesta (eso lo garantiza quien provee el texto).
//
// Fuentes de la pista (en orden):
//  1) onRequestHint() si se pasa (puede ser async; p. ej. /api/explain?mode=hint).
//  2) hint estático.
// Si no hay ninguna, muestra un mensaje neutro de andamiaje.

import React from 'react';
import { Flame, Loader2 } from 'lucide-react';
import Mascot, { type MascotCharacter } from '@/components/lesson/Mascot';
import { COPY } from '@/lib/minecraft/copy';

export interface HintTorchProps {
    /** pista estática (andamiaje pre-respuesta, sin spoiler). */
    hint?: string;
    /** proveedor dinámico de pista (puede ser async). Tiene prioridad sobre `hint`. */
    onRequestHint?: () => Promise<string> | string | void;
    /** coste en esmeraldas (decorativo; se oculta si free). */
    costEmeralds?: number;
    /** pista gratuita (oculta el coste). */
    free?: boolean;
    /** personaje que "habla" la pista (aldeano guía). */
    character?: MascotCharacter;
    className?: string;
}

export default function HintTorch({
    hint,
    onRequestHint,
    costEmeralds = 0,
    free = false,
    character = 'granjerita',
    className = '',
}: HintTorchProps) {
    const [lit, setLit] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [text, setText] = React.useState<string>('');

    const showCost = !free && costEmeralds > 0 && !lit;

    const light = async () => {
        if (lit || loading) return;
        setLoading(true);
        try {
            let resolved = '';
            if (onRequestHint) {
                const r = await onRequestHint();
                if (typeof r === 'string') resolved = r;
            }
            if (!resolved) resolved = hint || '';
            if (!resolved) resolved = 'Piensa en lo que viste en la receta: empieza por lo que ya reconoces.';
            setText(resolved);
            setLit(true);
        } catch {
            setText(hint || 'No pude encender la antorcha ahora. Inténtalo de nuevo.');
            setLit(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`flex flex-col items-stretch gap-2 ${className}`}>
            {!lit && (
                <button
                    type="button"
                    onClick={light}
                    disabled={loading}
                    className="self-start inline-flex items-center gap-2 rounded-2xl px-4 py-2 font-black text-sm text-[#7a4a00] bg-[var(--mc-torch)]/25 border-2 border-[var(--mc-torch)] active:scale-95 transition disabled:opacity-60"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flame className="w-4 h-4" fill="var(--mc-torch)" />}
                    {COPY.lightTorch}
                    {showCost && (
                        <span className="ml-1 inline-flex items-center gap-0.5 text-[var(--mc-emerald-d)] text-xs">
                            · {costEmeralds} 💚
                        </span>
                    )}
                </button>
            )}

            {lit && (
                <div className="flex items-end gap-2 animate-in fade-in slide-in-from-bottom-2">
                    <Mascot mood="curious" character={character} className="w-12 h-12 shrink-0" />
                    {/* Globo de diálogo del aldeano con la pista. */}
                    <div className="relative flex-1 rounded-2xl rounded-bl-sm bg-[var(--mc-torch)]/15 border-2 border-[var(--mc-torch)] px-4 py-3">
                        <div className="flex items-center gap-1.5 mb-1 text-[var(--mc-torch)] font-black text-xs uppercase tracking-wide">
                            <Flame className="w-3.5 h-3.5" fill="var(--mc-torch)" /> Pista
                        </div>
                        <p className="text-sm font-bold text-gray-800">{text}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
