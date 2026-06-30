import React from "react";
import { GraduationCap, Star } from "lucide-react";
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import WorldMap from "@/components/dashboard/WorldMap";
import { worldFromLevels, type LevelRow, type UnitRow, type ProgressRow } from "@/lib/world";
import MobileSubHeader from "@/components/dashboard/MobileSubHeader";
import CursosSubNav from "@/components/dashboard/CursosSubNav";

export default async function CursosPage() {
    const supabase = await createClient();

    // 1. Validate Auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/portal-alumno');

    // 2. Validate Level
    const { data: userData } = await supabase
        .from('users')
        .select('english_level')
        .eq('id', user.id)
        .maybeSingle();

    if (!userData || !userData.english_level) {
        redirect('/portal-alumno/evaluacion');
    }

    // 3. Subscription Status
    const { data: subsData } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', user.id)
        .in('status', ['active', 'trialing']);

    const isPremium = subsData && subsData.length > 0;

    // 4. Mundo (biomas→estructuras) + progreso real del alumno. Reemplaza CourseMap por
    //    el WorldMap Minecraft (migración 0030 + seed-world-map): biomas por banda,
    //    estructuras por unidad, estrellas de encantamiento.
    const [{ data: levelsRows }, { data: unitRows }, { data: progressRows }] = await Promise.all([
        supabase.from('levels').select('id, external_id, title, order_index, band, biome_key, world_order, danger, map_color, theme_key').order('order_index'),
        supabase.from('units').select('id, external_id, level_id, title, icon, order_index, structure_key, kind').order('order_index'),
        supabase.from('user_progress').select('unit_id, status, progress_pct, mastery_pct, stars, tested_out').eq('user_id', user.id),
    ]);

    // El WorldMap enlaza a /unidad/{id} y agrupa por nivel usando el MISMO id, así que
    // toda referencia (level_id de la unidad, unit_id del progreso) se reescribe a
    // external_id — la convención de deep-link de hoy (idéntica a CourseMap).
    const levelExtById = new Map((levelsRows ?? []).map((l) => [l.id as string, (l.external_id as string) ?? (l.id as string)]));
    const realProg = new Map((progressRows ?? []).map((p) => [p.unit_id as string, p]));

    const worldLevels: LevelRow[] = (levelsRows ?? []).map((l) => ({
        id: (l.external_id as string) ?? (l.id as string),
        title: l.title as string | null,
        order_index: l.order_index as number | null,
        band: l.band as number | null,
        biome_key: l.biome_key as string | null,
        world_order: l.world_order as number | null,
        danger: l.danger as number | null,
        map_color: l.map_color as string | null,
        theme_key: l.theme_key as string | null,
    }));

    const worldUnits: UnitRow[] = (unitRows ?? []).map((u) => ({
        id: (u.external_id as string) ?? (u.id as string),
        level_id: levelExtById.get(u.level_id as string) ?? (u.level_id as string),
        title: u.title as string | null,
        icon: u.icon as string | null,
        order_index: u.order_index as number | null,
        structure_key: u.structure_key as string | null,
        kind: u.kind as string | null,
    }));

    // GRANDFATHERING (F7 hará el gating real): hoy CourseMap deja TODAS las unidades
    // navegables; preservamos ese acceso => ninguna unidad se bloquea. Completadas
    // muestran su check; las demás quedan "en progreso" (navegables) con su % real.
    const worldProgress: ProgressRow[] = (unitRows ?? []).map((u) => {
        const p = realProg.get(u.id as string);
        const status: ProgressRow['status'] = p?.status === 'completed' ? 'completed' : 'in_progress';
        const mastery = (p?.mastery_pct as number | null) ?? (p?.progress_pct as number | null) ?? 0;
        return {
            unit_id: (u.external_id as string) ?? (u.id as string),
            status,
            mastery_pct: mastery,
            stars: (p?.stars as number | null) ?? 0,
            tested_out: (p?.tested_out as boolean | null) ?? false,
        };
    });

    const biomes = worldFromLevels(worldLevels, worldUnits, worldProgress);

    return (
        <div className="flex flex-col w-full min-h-screen bg-white">
            {/* Top Bar (Mobile Only) */}
            <MobileSubHeader hideNav={true} />

            {/* Desktop Header */}
            <div data-tour="ruta" className="hidden md:flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 p-8 max-w-7xl mx-auto w-full">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center">
                        <GraduationCap className="w-8 h-8 text-[#632EB0]" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            Tu Mundo
                        </h1>
                        <p className="text-gray-500 font-medium">Explora los biomas y construye tu ruta de aprendizaje.</p>
                    </div>
                </div>

                {!isPremium && (
                    <div className="bg-orange-50 border-2 border-orange-100 rounded-2xl p-4 flex items-center gap-4 animate-in fade-in slide-in-from-right-4">
                        <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shrink-0">
                            <Star className="w-6 h-6 text-white fill-white" />
                        </div>
                        <div>
                            <p className="text-sm font-black text-orange-800">Acceso Limitado</p>
                            <p className="text-xs text-orange-600 font-medium whitespace-nowrap">Suscríbete para desbloquear todos los biomas.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Main Content (World Map) */}
            <main className="flex-1 w-full max-w-7xl mx-auto pb-40 md:py-8">
                <WorldMap biomes={biomes} />
            </main>

            {/* Floating Navigation (Mobile Only) */}
            <CursosSubNav />
        </div>
    );
}
