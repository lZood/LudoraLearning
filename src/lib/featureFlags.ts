// Feature flags por cohorte para el rollout de lecciones v2 (plan §8).
//
// FUENTE DE VERDAD: la tabla `app_config` (migración 0029, OTRO track) guarda
// `lessons_v2_enabled`, `lessons_v2_cohort_pct`, `present_step_enabled`, y el RPC
// `is_v2_user(uid)` decide la cohorte server-side. Esto es el ESPEJO de cliente:
// un best-effort para que la UI pueda anticipar la decisión sin un round-trip.
// La verdad operativa (kill-switch, ramp 5->25->50->100) se cambia en runtime con
// un UPDATE a `app_config`, sin redeploy. Nunca confíes en esto para seguridad.
import { createClient } from '@/utils/supabase/client';

// Hash entero determinista de 32 bits (FNV-1a). Mismo input => mismo bucket, de
// modo que `hashInt(userId) % 100` reparte usuarios de forma estable. Es el espejo
// del bucketing del RPC `is_v2_user` (plan §8); si el RPC usara otra función hash,
// la verdad sigue siendo el servidor y esto es solo una pista de UI.
export function hashInt(input: string): number {
    let h = 0x811c9dc5; // offset basis FNV-1a 32-bit
    const s = String(input);
    for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        // multiplicación FNV con aritmética de 32 bits sin signo
        h = Math.imul(h, 0x01000193) >>> 0;
    }
    return h >>> 0;
}

// ¿Cae el usuario dentro del `pct`% de la cohorte? Determinista por userId.
// `pct` típicamente viene de `lessons_v2_cohort_pct` (0–100).
export function isV2User(userId: string | null | undefined, pct: number): boolean {
    if (!userId) return false;
    const p = Math.max(0, Math.min(100, Math.floor(pct)));
    if (p <= 0) return false;
    if (p >= 100) return true;
    return (hashInt(userId) % 100) < p;
}

// Lee un flag crudo de `app_config` (string | null). NOTA: según la RLS de
// `app_config`, puede que el cliente authenticated NO pueda leerla; en ese caso
// (o ante cualquier error) devolvemos null y el llamador debe usar su default
// seguro (todas las flags v2 = off => comportamiento v1). La decisión real vive
// en el servidor (RPC `is_v2_user` / route handlers con service_role).
export async function getFlag(key: string): Promise<string | null> {
    try {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('app_config')
            .select('value')
            .eq('key', key)
            .maybeSingle();
        if (error || !data) return null;
        return typeof data.value === 'string' ? data.value : null;
    } catch {
        return null;
    }
}

// Conveniencias tipadas sobre getFlag (mismo contrato de degradación a default).
export async function getFlagBool(key: string, fallback = false): Promise<boolean> {
    const v = await getFlag(key);
    if (v == null) return fallback;
    return v === 'true' || v === '1' || v.toLowerCase() === 't';
}
export async function getFlagNumber(key: string, fallback = 0): Promise<number> {
    const v = await getFlag(key);
    if (v == null) return fallback;
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
}

// Resuelve la decisión de cohorte combinando kill-switch + porcentaje (espejo de
// `is_v2_user`). Falla a `false` (v1) ante cualquier duda. La verdad es el RPC.
export async function isLessonsV2Enabled(userId: string | null | undefined): Promise<boolean> {
    const enabled = await getFlagBool('lessons_v2_enabled', false);
    if (!enabled) return false;
    const pct = await getFlagNumber('lessons_v2_cohort_pct', 0);
    return isV2User(userId, pct);
}
