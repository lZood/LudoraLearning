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

    // 3. En paralelo: suscripción, gamificación, XP de hoy, TODAS las unidades (en orden) y el
    //    progreso del alumno (para calcular "continuar" y unidades completadas correctamente).
    const [subsRes, gamiRes, todayRes, unitsRes, progRes] = await Promise.all([
        supabase.from('subscriptions').select('status').eq('user_id', user.id).in('status', ['active', 'trialing']),
        supabase.from('user_gamification').select('xp_total, level_number, coins, current_streak').eq('user_id', user.id).maybeSingle(),
        supabase.from('activity_log').select('xp_earned').eq('user_id', user.id).eq('activity_date', today),
        supabase.from('units').select('id, external_id, title, order_index').order('order_index'),
        supabase.from('user_progress').select('unit_id, progress_pct, status, last_accessed_at').eq('user_id', user.id),
    ]);

    const isPremium = !!(subsRes.data && subsRes.data.length > 0);
    const gami = gamiRes.data;
    const todayXp = (todayRes.data ?? []).reduce((s, r) => s + ((r.xp_earned as number) ?? 0), 0);

    const bandaNumber = userData.english_level.replace('Banda ', '');
    const bandaTitle = bandaNumber === '1' ? 'Iniciación Inmersiva' : bandaNumber === '2' ? 'Básico Funcional' : 'Aventurero Independiente';
    const firstName = (userData.full_name as string | null)?.trim().split(/\s+/)[0] || user.email?.split('@')[0] || 'Aventurero';

    // ── "Continuar": retoma una unidad EN PROGRESO; si no, avanza a la siguiente SIN completar ──
    type UnitRow = { id: string; external_id: string; title: string; order_index: number };
    type ProgRow = { unit_id: string; progress_pct: number | null; status: string | null; last_accessed_at: string | null };
    const units = (unitsRes.data ?? []) as UnitRow[];
    const prog = (progRes.data ?? []) as ProgRow[];
    const progByUnit = new Map(prog.map((p) => [p.unit_id, p]));
    const isDone = (p?: ProgRow) => !!p && (p.status === 'completed' || (p.progress_pct ?? 0) >= 100);
    const completedIds = new Set(units.filter((u) => isDone(progByUnit.get(u.id))).map((u) => u.id));

    // 1) la más reciente EN PROGRESO (no completada) -> retomar donde quedó
    const inProgress = prog
        .filter((p) => !isDone(p) && p.last_accessed_at)
        .sort((a, b) => (b.last_accessed_at || '').localeCompare(a.last_accessed_at || ''));
    let contUnit: UnitRow | undefined = inProgress.length ? units.find((u) => u.id === inProgress[0].unit_id) : undefined;
    // 2) si no hay nada en progreso, la PRIMERA unidad sin completar (la siguiente del curso)
    if (!contUnit) contUnit = units.find((u) => !completedIds.has(u.id)) || units[units.length - 1];

    const lastUnit = contUnit
        ? { id: contUnit.external_id, title: contUnit.title, progress: progByUnit.get(contUnit.id)?.progress_pct ?? 0 }
        : { id: 'u1-1', title: 'Bienvenido', progress: 0 };

    const stats: DashboardStats = {
        name: firstName,
        xp: gami?.xp_total ?? 0,
        level: gami?.level_number ?? 1,
        coins: gami?.coins ?? 0,
        streak: gami?.current_streak ?? 0,
        todayXp,
        unitsCompleted: completedIds.size,
    };

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
