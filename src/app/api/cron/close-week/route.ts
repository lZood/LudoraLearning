import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { resend, EMAIL_FROM } from '@/lib/resend';

export const dynamic = 'force-dynamic';

// Avisa por correo si el cierre semanal falla (proceso que reparte economía real).
// Destinatario en app_config.cron_alert_email (o env CRON_ALERT_EMAIL); si no hay, solo loguea.
async function alertFailure(admin: ReturnType<typeof createAdminClient>, detail: string) {
    try {
        let to = process.env.CRON_ALERT_EMAIL ?? null;
        const { data } = await admin.from('app_config').select('value').eq('key', 'cron_alert_email').maybeSingle();
        if (data?.value) to = data.value;
        if (!to) { console.error('[cron/close-week] sin destinatario de alerta; detalle:', detail); return; }
        await resend.emails.send({
            from: EMAIL_FROM,
            to,
            subject: '⚠️ Falló el cierre semanal del ranking (Ludora)',
            text: `El cron de close-week falló.\n\nDetalle: ${detail}\n\nRevisa /api/cron/close-week y la BD. La función close_due_weeks es idempotente: puedes reintentar.`,
        });
    } catch (e) {
        console.error('[cron/close-week] no se pudo enviar la alerta:', e instanceof Error ? e.message : e);
    }
}

// Cierre semanal del ranking. Lo dispara el cron del VPS cada día (06:00 UTC).
// close_due_weeks() cierra TODAS las semanas pasadas aún no cerradas (catch-up
// idempotente), así un lunes perdido se recupera en la siguiente corrida.
export async function POST(req: NextRequest) {
    // 401 inmediato si falta el header, ANTES de tocar la BD (evita queries anónimas).
    const provided = req.headers.get('x-cron-secret');
    if (!provided) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const admin = createAdminClient();
    try {
        // El secreto vive en la BD (app_config.cron_secret) con fallback a env.
        let secret = process.env.CRON_SECRET ?? null;
        const { data: cfg } = await admin.from('app_config').select('value').eq('key', 'cron_secret').maybeSingle();
        if (cfg?.value) secret = cfg.value;
        if (!secret) {
            console.error('[cron/close-week] Falta el secreto (app_config.cron_secret / CRON_SECRET)');
            return NextResponse.json({ error: 'Cron not configured' }, { status: 500 });
        }
        if (provided !== secret) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

        // Cierra todas las semanas pendientes (catch-up). Devuelve las que cerró.
        const { data, error } = await admin.rpc('close_due_weeks');
        if (error) {
            console.error('[cron/close-week] Error en close_due_weeks:', error.message);
            await alertFailure(admin, `close_due_weeks: ${error.message}`);
            return NextResponse.json({ error: 'close_due_weeks failed' }, { status: 500 });
        }

        const closed = ((data as { closed_week: string }[] | null) ?? []).map((r) => r.closed_week);
        console.log(`[cron/close-week] OK · semanas cerradas: ${closed.length ? closed.join(', ') : 'ninguna pendiente'}`);
        return NextResponse.json({ ok: true, closed });
    } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error('[cron/close-week]', msg);
        await alertFailure(admin, msg);
        return NextResponse.json({ error: 'Error' }, { status: 500 });
    }
}
