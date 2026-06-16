import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { sanitizeContent } from '@/lib/diagnostic';

export const dynamic = 'force-dynamic';

// Sirve el banco de ítems diagnósticos SANITIZADO (sin respuestas) para que el cliente
// renderice la diagnóstica adaptativa. Público (la prueba corre en modo invitado), con
// rate-limit por IP anti-scraping. El grading/placement ocurre server-side en /finalize.
export async function GET(req: NextRequest) {
    try {
        const admin = createAdminClient();
        const ip = (req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown').trim();
        const { data: rlOk } = await admin.rpc('check_rate_limit', { p_key: `placement-items:${ip}`, p_max: 40, p_window: 600 });
        if (rlOk === false) return NextResponse.json({ error: 'Demasiadas solicitudes.' }, { status: 429 });

        const { data, error } = await admin.from('diagnostic_items').select('id, skill, difficulty, type, content');
        if (error) throw error;
        const items = (data || []).map((it) => ({
            id: it.id, skill: it.skill, difficulty: it.difficulty, type: it.type,
            content: sanitizeContent(it.type as string, it.content),
        }));
        return NextResponse.json({ items });
    } catch (e) {
        console.error('[placement/items]', e instanceof Error ? e.message : e);
        return NextResponse.json({ error: 'Error' }, { status: 500 });
    }
}
