import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import PrintButton from '@/components/dashboard/PrintButton';
import { Flame, Zap, Trophy, Star, GraduationCap, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

// Reporte de progreso imprimible para padres/tutores (datos reales del alumno).
export default async function ReportePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/portal-alumno');

    const [{ data: profile }, { data: evalRow }, { data: gam }, { data: ach }, { data: prog }, { count: totalUnits }, { data: feedback }] = await Promise.all([
        supabase.from('users').select('full_name, email, english_level, has_completed_evaluation').eq('id', user.id).maybeSingle(),
        supabase.from('evaluations').select('calculated_band, category_levels, ai_oracle_verdict, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('user_gamification').select('xp_total, level_number, coins, current_streak, longest_streak').eq('user_id', user.id).maybeSingle(),
        supabase.from('user_achievements').select('unlocked_at, achievement:achievements(name, description)').eq('user_id', user.id),
        supabase.from('user_progress').select('status').eq('user_id', user.id),
        supabase.from('units').select('id', { count: 'exact', head: true }),
        supabase.from('feedback_sessions').select('content, recommendations, created_at').eq('student_id', user.id).in('audience', ['student', 'both']).order('created_at', { ascending: false }).limit(3),
    ]);

    const completedUnits = (prog ?? []).filter((p) => p.status === 'completed').length;
    const inProgressUnits = (prog ?? []).filter((p) => p.status === 'in_progress').length;
    const catLevels = (evalRow?.category_levels ?? {}) as Record<string, string>;
    const achievements = (ach ?? []) as Array<{ unlocked_at: string; achievement: { name?: string; description?: string } | null }>;

    const stat = (label: string, val: string | number, Icon: React.ElementType, color: string) => (
        <div className="border border-gray-200 rounded-2xl p-4 flex flex-col items-center gap-1 print:break-inside-avoid">
            <Icon className={`w-5 h-5 ${color}`} />
            <span className="text-2xl font-black text-gray-900">{val}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</span>
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 bg-white text-gray-900">
            <div className="flex items-center justify-between mb-8 print:hidden">
                <h1 className="text-2xl font-black tracking-tight">Reporte de progreso</h1>
                <PrintButton />
            </div>

            {/* Encabezado del reporte */}
            <div className="flex items-center gap-4 border-b border-gray-200 pb-6 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#632EB0] flex items-center justify-center text-white"><GraduationCap className="w-6 h-6" /></div>
                <div>
                    <p className="text-[11px] font-black uppercase tracking-widest text-[#632EB0]">Ludora Learning · Reporte para tutores</p>
                    <h2 className="text-xl font-black tracking-tight">{profile?.full_name || 'Alumno'}</h2>
                    <p className="text-sm text-gray-500 font-medium">{profile?.email} · Nivel actual: <strong>{profile?.english_level || 'Sin evaluar'}</strong></p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-8">
                {stat('Banda', evalRow?.calculated_band ?? '—', Star, 'text-[#632EB0]')}
                {stat('XP', (gam?.xp_total ?? 0).toLocaleString(), Zap, 'text-yellow-500')}
                {stat('Racha', gam?.current_streak ?? 0, Flame, 'text-orange-500')}
                {stat('Nivel', gam?.level_number ?? 1, Trophy, 'text-[#815a9b]')}
                {stat('Monedas', gam?.coins ?? 0, Sparkles, 'text-yellow-600')}
            </div>

            {/* Progreso de curso */}
            <section className="mb-8">
                <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-3">Avance del curso</h3>
                <p className="text-gray-700 font-medium">
                    Unidades completadas: <strong>{completedUnits}</strong> · en progreso: <strong>{inProgressUnits}</strong> · de <strong>{totalUnits ?? 0}</strong> totales.
                </p>
            </section>

            {/* Niveles por categoría */}
            {Object.keys(catLevels).length > 0 && (
                <section className="mb-8">
                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-3">Nivel por área (última evaluación)</h3>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(catLevels).map(([cat, lvl]) => (
                            <span key={cat} className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-xs font-bold">{cat}: <strong className="text-[#632EB0]">{lvl}</strong></span>
                        ))}
                    </div>
                </section>
            )}

            {/* Veredicto IA */}
            {evalRow?.ai_oracle_verdict && (
                <section className="mb-8">
                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-3">Diagnóstico del Oráculo</h3>
                    <p className="text-gray-700 leading-relaxed bg-purple-50/40 border border-purple-100 rounded-2xl p-4 text-sm">{evalRow.ai_oracle_verdict}</p>
                </section>
            )}

            {/* Feedback del agente IA */}
            {(feedback ?? []).length > 0 && (
                <section className="mb-8">
                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-3">Recomendaciones para el alumno</h3>
                    <div className="space-y-3">
                        {(feedback ?? []).map((f, i) => (
                            <div key={i} className="border border-gray-200 rounded-2xl p-4 text-sm">
                                <p className="text-gray-800 font-medium">{f.content}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Logros */}
            {achievements.length > 0 && (
                <section className="mb-8">
                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-3">Logros desbloqueados ({achievements.length})</h3>
                    <div className="grid sm:grid-cols-2 gap-2">
                        {achievements.map((a, i) => (
                            <div key={i} className="flex items-center gap-3 border border-gray-200 rounded-2xl p-3">
                                <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
                                <div>
                                    <p className="text-sm font-black text-gray-900">{a.achievement?.name}</p>
                                    <p className="text-[11px] text-gray-500 font-medium">{a.achievement?.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <p className="text-[10px] text-gray-400 font-medium border-t border-gray-100 pt-4 mt-8">
                Generado por Ludora Learning. Este reporte refleja el progreso registrado del alumno a la fecha de impresión.
            </p>
        </div>
    );
}
