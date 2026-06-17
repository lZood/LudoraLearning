import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

export const dynamic = 'force-dynamic';

// Lunes (ISO) de la semana indicada por `ref`, en formato YYYY-MM-DD.
// getUTCDay(): 0=domingo … 6=sábado. Para ISO el lunes es el inicio de semana.
function isoMonday(ref: Date): string {
    const d = new Date(Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth(), ref.getUTCDate()));
    const day = d.getUTCDay();
    const diff = day === 0 ? -6 : 1 - day; // domingo retrocede 6, resto al lunes
    d.setUTCDate(d.getUTCDate() + diff);
    return d.toISOString().slice(0, 10);
}

// Cierre semanal del ranking. Lo dispara el cron (Dokploy / scheduler externo) cada
// lunes de madrugada. Cierra la semana que ACABA de terminar: el lunes anterior.
// Usa service_role (createAdminClient) porque close_week es SECURITY DEFINER y solo
// está concedida a service_role. Es idempotente: reintentos no duplican efectos.
export async function POST(req: NextRequest) {
    try {
        const admin = createAdminClient();

        // El secreto compartido vive en la BD (app_config.cron_secret) para sobrevivir
        // redeploys sin depender del panel de deploy; con fallback a la variable de entorno.
        let secret = process.env.CRON_SECRET ?? null;
        const { data: cfg } = await admin
            .from('app_config')
            .select('value')
            .eq('key', 'cron_secret')
            .maybeSingle();
        if (cfg?.value) secret = cfg.value;

        if (!secret) {
            console.error('[cron/close-week] Falta el secreto (app_config.cron_secret / CRON_SECRET)');
            return NextResponse.json({ error: 'Cron not configured' }, { status: 500 });
        }

        // Validación del secreto compartido (header 'x-cron-secret').
        if (req.headers.get('x-cron-secret') !== secret) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        // El lunes de la semana que cierra = el lunes de hace 7 días.
        const lastWeekRef = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const pWeekStart = isoMonday(lastWeekRef);

        const { error } = await admin.rpc('close_week', { p_week_start: pWeekStart });

        if (error) {
            console.error('[cron/close-week] Error en close_week:', error.message);
            return NextResponse.json({ error: 'close_week failed' }, { status: 500 });
        }

        return NextResponse.json({ ok: true, week_start: pWeekStart });
    } catch (e) {
        console.error('[cron/close-week]', e instanceof Error ? e.message : e);
        return NextResponse.json({ error: 'Error' }, { status: 500 });
    }
}
