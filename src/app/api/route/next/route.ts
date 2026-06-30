import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';

export const dynamic = 'force-dynamic';

// GET /api/route/next  →  "siguiente mejor misión" del alumno (CTA "Continuar tu aventura").
//
// Combina la heurística de dominio (recommend_next, 0031: deuda de repaso → destreza
// débil → avance) con el GATING de ruta (user_progress.status + unit_prerequisites, 0030)
// para devolver una misión ACCIONABLE:
//   { kind:'lesson'|'review'|'test_out', activityId?, unitId?, reason, deepLink }
//
// Resolución de la misión (todo null-safe, degrada al orden lineal de hoy):
//   1) Unidades ACCESIBLES = las que el alumno tiene en user_progress como
//      in_progress|completed (gating ya aplicado por unlock_next_units). Si el alumno
//      no tiene progreso aún (recién llegado), la PRIMERA unidad del mundo es accesible
//      (fallback lineal idéntico a unlock_next_units para la primera unidad).
//   2) Primera actividad SIN completar (por order_index) recorriendo esas unidades en
//      orden global (bioma → unidad). Ése es el destino del deep link.
//   3) `kind` lo matiza recommend_next: si hay deuda de repaso ⇒ 'review' (el repaso se
//      intercala dentro de la propia lección vía /api/lessons/plan); si no ⇒ 'lesson'.
//   4) Si todo está completado, devuelve un deep link seguro al mapa de cursos.
//
// Lectura con service_role (admin): recommend_next y las RPC de dominio están
// concedidas a service_role y, bajo service_role, auth.uid() es NULL ⇒ la guarda
// `auth.uid() <> p_user` no aplica. El gating se lee directamente de las tablas.

const CURSOS = '/portal-alumno/dashboard/cursos';

type UnitRow = { id: string; external_id: string | null; order_index: number | null; level: { order_index: number | null } | { order_index: number | null }[] | null };
type ActRow = { id: string; type: string | null; unit_id: string; order_index: number | null };

// order_index del nivel embebido (PostgREST puede entregar objeto o array de 1).
function levelOrder(u: UnitRow): number {
    const lvl = Array.isArray(u.level) ? u.level[0] : u.level;
    return lvl?.order_index ?? 0;
}

// Deep link real según el tipo de actividad (las lecciones tienen player dedicado;
// el resto vive bajo la unidad). Espeja hrefFor() de la página de unidad.
function deepLinkFor(act: ActRow, unitExternal: string | null): string {
    if (act.type === 'lesson') return `/portal-alumno/dashboard/leccion/${act.id}`;
    return `/portal-alumno/dashboard/unidad/${unitExternal ?? act.unit_id}/actividad/${act.id}`;
}

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

        const admin = createAdminClient();

        // 1) Pista de dominio (no falla la ruta si la RPC no está): kind + reason.
        let recKind: string | undefined;
        let recReason: string | undefined;
        try {
            const { data: rec } = await admin.rpc('recommend_next', { p_user: user.id });
            const r = (rec ?? null) as { kind?: string; reason?: string } | null;
            recKind = r?.kind;
            recReason = r?.reason;
        } catch (e) {
            console.error('[route/next] recommend_next', e instanceof Error ? e.message : e);
        }

        // 2) Mundo en orden global (bioma → unidad) + estado de ruta del alumno.
        const [{ data: unitsRaw }, { data: prog }] = await Promise.all([
            admin.from('units').select('id, external_id, order_index, level:levels(order_index)'),
            admin.from('user_progress').select('unit_id, status').eq('user_id', user.id),
        ]);

        const units = ((unitsRaw ?? []) as UnitRow[])
            .slice()
            .sort((a, b) => (levelOrder(a) - levelOrder(b)) || ((a.order_index ?? 0) - (b.order_index ?? 0)));

        const statusByUnit = new Map<string, string>();
        for (const p of (prog ?? []) as Array<{ unit_id: string; status: string | null }>) {
            if (p.unit_id) statusByUnit.set(p.unit_id, p.status ?? 'locked');
        }

        // Unidades accesibles (gating ya materializado por unlock_next_units). Si el
        // alumno no tiene ninguna iniciada, la PRIMERA del mundo queda accesible.
        let accessible = units.filter((u) => {
            const s = statusByUnit.get(u.id);
            return s === 'in_progress' || s === 'completed';
        });
        if (accessible.length === 0 && units.length > 0) accessible = [units[0]];

        const accessibleIds = accessible.map((u) => u.id);

        // 3) Actividades de las unidades accesibles + completadas del alumno.
        let mission: { kind: 'lesson' | 'review' | 'test_out'; activityId?: string; unitId?: string; reason: string; deepLink: string } | null = null;

        if (accessibleIds.length > 0) {
            const { data: actsRaw } = await admin
                .from('activities')
                .select('id, type, unit_id, order_index')
                .in('unit_id', accessibleIds)
                .order('order_index');
            const acts = (actsRaw ?? []) as ActRow[];

            let doneSet = new Set<string>();
            if (acts.length > 0) {
                const { data: done } = await admin
                    .from('user_activity_progress')
                    .select('activity_id')
                    .eq('user_id', user.id)
                    .not('completed_at', 'is', null)
                    .in('activity_id', acts.map((a) => a.id));
                doneSet = new Set((done ?? []).map((d) => d.activity_id as string));
            }

            // Agrupar actividades por unidad (ya vienen ordenadas por order_index).
            const actsByUnit = new Map<string, ActRow[]>();
            for (const a of acts) {
                const arr = actsByUnit.get(a.unit_id) ?? [];
                arr.push(a);
                actsByUnit.set(a.unit_id, arr);
            }

            // Recorrer las unidades accesibles EN ORDEN GLOBAL y tomar la primera
            // actividad sin completar => destino lineal seguro.
            const externalByUnit = new Map(units.map((u) => [u.id, u.external_id]));
            outer: for (const u of accessible) {
                for (const a of (actsByUnit.get(u.id) ?? [])) {
                    if (!doneSet.has(a.id)) {
                        const kind: 'lesson' | 'review' = recKind === 'review' ? 'review' : 'lesson';
                        mission = {
                            kind,
                            activityId: a.id,
                            unitId: u.id,
                            reason: recReason ?? 'Continúa tu aventura',
                            deepLink: deepLinkFor(a, externalByUnit.get(u.id) ?? null),
                        };
                        break outer;
                    }
                }
            }
        }

        // 4) Todo completado (o sin datos): CTA segura al mapa de cursos.
        if (!mission) {
            mission = {
                kind: 'lesson',
                reason: recReason ?? '¡Has completado todo lo disponible! Explora el mapa.',
                deepLink: CURSOS,
            };
        }

        return NextResponse.json(mission);
    } catch (e) {
        console.error('[route/next]', e instanceof Error ? e.message : e);
        // Degradación dura: nunca dejar al alumno sin CTA.
        return NextResponse.json({ kind: 'lesson', reason: 'Continúa tu aventura', deepLink: CURSOS });
    }
}
