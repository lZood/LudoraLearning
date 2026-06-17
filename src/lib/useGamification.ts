'use client';

// Hook cliente para leer la gamificación del alumno (XP, nivel, monedas, racha) una sola vez.
// Cachea a nivel de módulo para que las siguientes pantallas la muestren al instante mientras
// revalida en segundo plano. RLS permite la lectura propia (user_gamification self read).
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export type Gami = { xp: number; level: number; coins: number; streak: number };

let cache: Gami | null = null;

// XP por nivel (coincide con grant_progress: level = floor(xp/100)+1).
export const XP_PER_LEVEL = 100;
export const xpIntoLevel = (xp: number) => xp % XP_PER_LEVEL;
export const xpToNextLevel = (xp: number) => XP_PER_LEVEL - (xp % XP_PER_LEVEL);
export const levelProgressPct = (xp: number) => Math.round((xpIntoLevel(xp) / XP_PER_LEVEL) * 100);

export function useGamification(): Gami | null {
    const [g, setG] = useState<Gami | null>(cache);
    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();
                if (!active || !user) return;
                const { data } = await supabase
                    .from('user_gamification')
                    .select('xp_total, level_number, coins, current_streak')
                    .eq('user_id', user.id)
                    .maybeSingle();
                if (!active || !data) return;
                cache = { xp: data.xp_total ?? 0, level: data.level_number ?? 1, coins: data.coins ?? 0, streak: data.current_streak ?? 0 };
                setG(cache);
            } catch { /* silencioso: el header tolera no tener datos aún */ }
        })();
        return () => { active = false; };
    }, []);
    return g;
}
