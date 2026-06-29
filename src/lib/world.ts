// Helpers de RUTA / MUNDO (capa pura, sin efectos). Combina las filas reales de
// `levels` / `units` / `user_progress` (migración 0030) con la biblia de
// tematización Minecraft (src/lib/minecraft/*) para producir el modelo que pinta
// el WorldMap (biomas → estructuras → estado por alumno). Ver §5.1–5.3 del plan.
//
// Diseño: TODO degrada con datos vacíos. Si las columnas nuevas vienen null, la
// biblia las deriva de `band`/`icon`/`title` (mismo resultado que seed-world-map),
// así que funciona aunque el seed aún no se haya corrido (cero acoplamiento duro).

import { bandToBiome, type Biome } from '@/lib/minecraft/biomes';
import { structureFor, type Structure, type StructureKey } from '@/lib/minecraft/structures';

// ── Filas de entrada (subconjunto laxo de las tablas; todo opcional/null-safe) ──
export interface LevelRow {
    id: string;
    title?: string | null;
    order_index?: number | null;
    band?: number | null;
    biome_key?: string | null;
    theme_key?: string | null;
    world_order?: number | null;
    danger?: number | null;
    map_color?: string | null;
}

export interface UnitRow {
    id: string;
    level_id?: string | null;
    title?: string | null;
    icon?: string | null;
    order_index?: number | null;
    structure_key?: string | null;
    kind?: string | null;
    est_minutes?: number | null;
}

export interface ProgressRow {
    unit_id?: string | null;
    status?: string | null; // 'locked' | 'in_progress' | 'completed'
    mastery_pct?: number | null;
    stars?: number | null;
    unlocked_at?: string | null;
    tested_out?: boolean | null;
}

// ── Modelo de salida (lo consume el WorldMap / la ruta) ───────────────────────
export type UnitProgressStatus = 'locked' | 'in_progress' | 'completed';
export type UnitKind = 'standard' | 'keystone';

export interface WorldUnit {
    id: string;
    title: string;
    order: number;
    structure: Structure;
    kind: UnitKind; // 'keystone' = cierre de bioma (Cofre del Bioma)
    estMinutes: number | null;
    status: UnitProgressStatus;
    masteryPct: number; // 0–100
    stars: number; // 0–3
    testedOut: boolean;
}

export interface WorldBiome {
    levelId: string;
    title: string;
    band: number;
    biome: Biome;
    worldOrder: number;
    mapColor: string;
    danger: number;
    themeKey: string;
    units: WorldUnit[];
}

// Claves de estructura válidas (espejo de StructureKey en structures.ts).
const STRUCTURE_KEYS: ReadonlySet<string> = new Set<StructureKey>([
    'casa', 'granja', 'mina', 'pozo', 'torre', 'faro', 'mercado', 'portal',
]);

function clamp(n: number, lo: number, hi: number): number {
    if (!Number.isFinite(n)) return lo;
    return Math.max(lo, Math.min(hi, Math.round(n)));
}

// Bioma resuelto de un nivel: deriva de `band` (biblia) y deja que las columnas
// persistidas (map_color/danger) tengan prioridad si existen.
export function biomeForLevel(level: LevelRow): Biome {
    const base = bandToBiome(level.band ?? 1);
    return {
        ...base,
        mapColor: level.map_color ?? base.mapColor,
        danger: level.danger ?? base.danger,
    };
}

// Estructura resuelta de una unidad: prioriza `structure_key` persistido (override
// del seed/admin) y si no, la deriva de icono/título con la biblia.
export function structureForUnit(unit: UnitRow): Structure {
    const derived = structureFor({ icon: unit.icon, title: unit.title });
    const key = unit.structure_key;
    if (key && STRUCTURE_KEYS.has(key)) {
        // Etiqueta consistente con la biblia cuando coincide; respaldo capitalizado.
        const label = key === derived.key
            ? derived.label
            : key.charAt(0).toUpperCase() + key.slice(1);
        return { key: key as StructureKey, label };
    }
    return derived;
}

// Estado de ruta de una unidad a partir de su fila de progreso (default 'locked').
export function unitStatus(progress?: ProgressRow | null): UnitProgressStatus {
    const s = progress?.status;
    return s === 'in_progress' || s === 'completed' ? s : 'locked';
}

export function unitMasteryPct(progress?: ProgressRow | null): number {
    return clamp(progress?.mastery_pct ?? 0, 0, 100);
}

export function unitStars(progress?: ProgressRow | null): number {
    return clamp(progress?.stars ?? 0, 0, 3);
}

export function isUnitUnlocked(progress?: ProgressRow | null): boolean {
    return unitStatus(progress) !== 'locked';
}

// Orden de un nivel en el mundo: world_order > order_index > band (todo defensivo).
function levelWorldOrder(level: LevelRow): number {
    return level.world_order ?? level.order_index ?? level.band ?? 0;
}

// Construye el mundo: biomas ordenados, cada uno con sus estructuras (unidades) y
// el estado del alumno. `progress` es opcional => sin progreso todo queda 'locked'.
export function worldFromLevels(
    levels: LevelRow[],
    units: UnitRow[],
    progress: ProgressRow[] = [],
): WorldBiome[] {
    const progByUnit = new Map<string, ProgressRow>();
    for (const p of progress) if (p.unit_id) progByUnit.set(p.unit_id, p);

    const unitsByLevel = new Map<string, UnitRow[]>();
    for (const u of units) {
        if (!u.level_id) continue;
        const arr = unitsByLevel.get(u.level_id) ?? [];
        arr.push(u);
        unitsByLevel.set(u.level_id, arr);
    }

    const sortedLevels = [...levels].sort((a, b) => levelWorldOrder(a) - levelWorldOrder(b));

    return sortedLevels.map((level) => {
        const biome = biomeForLevel(level);
        const lvlUnits = (unitsByLevel.get(level.id) ?? [])
            .slice()
            .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));

        const worldUnits: WorldUnit[] = lvlUnits.map((u, i) => {
            const prog = progByUnit.get(u.id) ?? null;
            const structure = structureForUnit(u);
            // La última unidad del bioma es keystone por defecto (Cofre del Bioma),
            // salvo override explícito en `kind`.
            const isLast = i === lvlUnits.length - 1;
            const kind: UnitKind = u.kind === 'keystone'
                ? 'keystone'
                : u.kind === 'standard'
                    ? 'standard'
                    : isLast ? 'keystone' : 'standard';
            return {
                id: u.id,
                title: u.title ?? structure.label,
                order: u.order_index ?? i,
                structure,
                kind,
                estMinutes: u.est_minutes ?? null,
                status: unitStatus(prog),
                masteryPct: unitMasteryPct(prog),
                stars: unitStars(prog),
                testedOut: !!prog?.tested_out,
            };
        });

        return {
            levelId: level.id,
            title: level.title ?? biome.label,
            band: level.band ?? 1,
            biome,
            worldOrder: levelWorldOrder(level),
            mapColor: level.map_color ?? biome.mapColor,
            danger: level.danger ?? biome.danger,
            themeKey: level.theme_key ?? 'overworld',
            units: worldUnits,
        };
    });
}
