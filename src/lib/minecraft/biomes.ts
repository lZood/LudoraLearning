// Biblia de tematización Minecraft — BIOMAS (capa de datos pura).
// Mapea la banda (1–8) de `levels` a un bioma con identidad propia (inspirado en
// Minecraft, sin assets ni nombres registrados de Mojang). Derivado de datos
// existentes (no requiere cambios de DB). Ver §2 y §5.1 del master plan.
//
// Regla: banda 1–8 -> CEFR vía `bandToCefr` (A1≤2, A2≤4, B1≤6, B2). El orden de
// biomas reproduce el arco del mundo: Pradera → … → Portal·Nether.

import { bandToCefr } from '@/lib/diagnostic';

// Clave estable del bioma (identidad propia).
export type BiomeKey =
    | 'pradera'
    | 'bosque'
    | 'ribera'
    | 'colinas'
    | 'cuevas'
    | 'puerto'
    | 'tundra'
    | 'portal';

export interface Biome {
    key: BiomeKey;
    label: string;       // nombre visible (UI)
    cefr: string;        // A1 | A2 | B1 | B2 (derivado de la banda)
    skyColor: string;    // color de cielo para fondos/headers
    mapColor: string;    // color del nodo/camino en el WorldMap
    danger: number;      // 0–3: "peligro" creciente del bioma (decorativo)
}

// Definición ordenada banda 1→8. La banda fija el CEFR de forma consistente con
// `bandToCefr`, así que sólo guardamos color/peligro/etiqueta propios.
const BIOMES: Record<number, Omit<Biome, 'cefr'>> = {
    1: { key: 'pradera', label: 'Pradera', skyColor: '#8fd3ff', mapColor: '#7fc24a', danger: 0 },
    2: { key: 'bosque', label: 'Bosque', skyColor: '#7ec0e8', mapColor: '#3f8f3a', danger: 0 },
    3: { key: 'ribera', label: 'Aldea de la Ribera', skyColor: '#9fd8e6', mapColor: '#c7a86b', danger: 1 },
    4: { key: 'colinas', label: 'Colinas', skyColor: '#a8d2e0', mapColor: '#6f9b57', danger: 1 },
    5: { key: 'cuevas', label: 'Cuevas de Cristal', skyColor: '#3a3550', mapColor: '#5b6e8c', danger: 2 },
    6: { key: 'puerto', label: 'Río y Puerto', skyColor: '#6fb6cf', mapColor: '#4a90b8', danger: 2 },
    7: { key: 'tundra', label: 'Tundra', skyColor: '#cfe6f0', mapColor: '#a9c6d6', danger: 3 },
    8: { key: 'portal', label: 'Portal · Nether', skyColor: '#5a2230', mapColor: '#8c2f2f', danger: 3 },
};

// Limita la banda al rango válido 1–8 (defensivo ante datos sucios).
function clampBand(band: number): number {
    if (!Number.isFinite(band)) return 1;
    return Math.max(1, Math.min(8, Math.round(band)));
}

// Devuelve el bioma propio para una banda (1–8). Siempre retorna un bioma válido.
export function bandToBiome(band: number): Biome {
    const b = clampBand(band);
    const base = BIOMES[b];
    return { ...base, cefr: bandToCefr(b) };
}

// Lista completa ordenada (útil para el WorldMap / leyendas).
export function allBiomes(): Biome[] {
    return Object.keys(BIOMES)
        .map((k) => Number(k))
        .sort((a, b) => a - b)
        .map((b) => bandToBiome(b));
}
