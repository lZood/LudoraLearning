import React from "react";
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import MobileDashboardContent from "@/components/dashboard/MobileDashboardContent";
import DesktopDashboardContent from "@/components/dashboard/DesktopDashboardContent";

export type DashboardStats = {
    name: string;
    xp: number;
    level: number;       // nivel de gamificación (XP), distinto de la banda de inglés
    coins: number;
    streak: number;
    todayXp: number;
    unitsCompleted: number;
};

export default async function DashboardIndex() {
    const supabase = await createClient();

    // 1. Auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/portal-alumno');

    // 2. Nivel + nombre
    const { data: userData } = await supabase
        .from('users')
        .select('english_level, full_name')
        .eq('id', user.id)
        .maybeSingle();
    if (!userData || !userData.english_level) redirect('/portal-alumno/evaluacion');

    const today = new Date().toISOString().slice(0, 10);

    // 3. En paralelo: suscripción, gamificación, XP de hoy, unidades completadas, última unidad.
    const [subsRes, gamiRes, todayRes, doneRes, lastRes] = await Promise.all([
        supabase.from('subscriptions').select('status').eq('user_id', user.id).in('status', ['active', 'trialing']),
        supabase.from('user_gamification').select('xp_total, level_number, coins, current_streak').eq('user_id', user.id).maybeSingle(),
        supabase.from('activity_log').select('xp_earned').eq('user_id', user.id).eq('activity_date', today),
        supabase.from('user_progress').select('unit_id').eq('user_id', user.id).eq('status', 'completed'),
        supabase.from('user_progress')
            .select('progress_pct, last_accessed_at, unit:units!user_progress_unit_id_fkey(external_id, title)')
            .eq('user_id', user.id)
            .order('last_accessed_at', { ascending: false, nullsFirst: false })
            .limit(1).maybeSingle(),
    ]);

    const isPremium = !!(subsRes.data && subsRes.data.length > 0);
    const gami = gamiRes.data;
    const todayXp = (todayRes.data ?? []).reduce((s, r) => s + ((r.xp_earned as number) ?? 0), 0);

    const bandaNumber = userData.english_level.replace('Banda ', '');
    const bandaTitle = bandaNumber === '1' ? 'Iniciación Inmersiva' : bandaNumber === '2' ? 'Básico Funcional' : 'Aventurero Independiente';
    const firstName = (userData.full_name as string | null)?.trim().split(/\s+/)[0] || user.email?.split('@')[0] || 'Aventurero';

    const stats: DashboardStats = {
        name: firstName,
        xp: gami?.xp_total ?? 0,
        level: gami?.level_number ?? 1,
        coins: gami?.coins ?? 0,
        streak: gami?.current_streak ?? 0,
        todayXp,
        unitsCompleted: (doneRes.data ?? []).length,
    };

    // Unidad para "continuar": la última accedida; si no, la primera del curso.
    const luRaw = lastRes.data?.unit as { external_id?: string; title?: string } | { external_id?: string; title?: string }[] | null;
    const luObj = Array.isArray(luRaw) ? luRaw[0] : luRaw;
    let lastUnit: { id: string; title: string; progress: number };
    if (luObj?.external_id) {
        lastUnit = { id: luObj.external_id, title: luObj.title ?? 'Unidad', progress: (lastRes.data?.progress_pct as number) ?? 0 };
    } else {
        const { data: firstUnit } = await supabase.from('units').select('external_id, title').eq('external_id', 'u1-1').maybeSingle();
        lastUnit = { id: firstUnit?.external_id ?? 'u1-1', title: firstUnit?.title ?? 'Bienvenido', progress: 0 };
    }

    return (
        <div className="w-full">
            <div className="md:hidden">
                <MobileDashboardContent bandaNumber={bandaNumber} bandaTitle={bandaTitle} isPremium={isPremium} lastUnit={lastUnit} stats={stats} />
            </div>
            <div className="hidden md:flex flex-col w-full max-w-7xl mx-auto">
                <DesktopDashboardContent bandaNumber={bandaNumber} bandaTitle={bandaTitle} isPremium={isPremium} lastUnit={lastUnit} stats={stats} />
            </div>
        </div>
    );
}
