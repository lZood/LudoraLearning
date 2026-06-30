import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';

export const dynamic = 'force-dynamic';

// GET /api/reviews/due — "Expedición de re-minado" (Master Plan §3.6, §5.3, F4·T4.1).
//
// Devuelve los conceptos cuyo repaso espaciado está DUE (next_review_at <= now),
// ordenados por `strength` ASCENDENTE (lo más olvidado primero = la mena más
// desgastada / la antorcha más apagada). Backing: RPC get_due_reviews (0031), que
// ya calcula strength = 2^(-elapsed_horas/half_life) y aplica el guard de RLS.
//
// Patrón idéntico a /api/lessons/complete: createClient para validar la sesión por
// cookie, createAdminClient (service_role) para ejecutar el RPC. get_due_reviews es
// SECURITY DEFINER y, llamada con service_role (auth.uid() NULL), pasa el guard;
// nosotros forzamos p_user = user.id para que cada quien solo lea lo suyo.
//
// Querystring: ?limit=<1..50> (default 20).
export async function GET(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

        // Límite saneado (1..50).
        const raw = Number(req.nextUrl.searchParams.get('limit'));
        const limit = Number.isFinite(raw) ? Math.max(1, Math.min(50, Math.trunc(raw))) : 20;

        const admin = createAdminClient();
        const { data, error } = await admin.rpc('get_due_reviews', { p_user: user.id, p_limit: limit });
        if (error) {
            console.error('[reviews/due]', error.message);
            // Degradación elegante: si el motor de dominio aún no tiene datos, no es un
            // error de cara al alumno (simplemente no hay menas que reparar todavía).
            return NextResponse.json({ reviews: [], count: 0 });
        }

        // Normaliza la salida del RPC (TABLE) a un contrato estable para la UI.
        const rows = Array.isArray(data) ? data : [];
        const reviews = rows.map((r: {
            concept_id: string; slug: string; label: string | null; skill: string | null;
            theta: number; band: string | null; half_life_hours: number;
            last_seen_at: string | null; next_review_at: string | null; strength: number;
        }) => ({
            conceptId: r.concept_id,
            slug: r.slug,
            label: r.label ?? r.slug,
            skill: r.skill ?? null,
            theta: r.theta,
            band: r.band ?? null,
            halfLifeHours: r.half_life_hours,
            lastSeenAt: r.last_seen_at,
            nextReviewAt: r.next_review_at,
            strength: typeof r.strength === 'number' ? r.strength : 0, // 0..1 (0 = más olvidado)
        }));

        return NextResponse.json({ reviews, count: reviews.length });
    } catch (e) {
        console.error('[reviews/due]', e instanceof Error ? e.message : e);
        return NextResponse.json({ error: 'Error' }, { status: 500 });
    }
}
