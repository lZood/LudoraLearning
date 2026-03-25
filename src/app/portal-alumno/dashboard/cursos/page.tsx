import React from "react";
import { BookOpen, GraduationCap, Star } from "lucide-react";
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import CourseMap from "@/components/dashboard/CourseMap";

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
        .single();

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

    return (
        <div className="flex flex-col gap-8 pb-12 w-full max-w-7xl mx-auto">
            
            {/* Header Section */}
            <div className="hidden md:flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-8">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center">
                        <GraduationCap className="w-8 h-8 text-[#632EB0]" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            Mis Cursos
                        </h1>
                        <p className="text-gray-500 font-medium">Explora tu ruta de aprendizaje personalizada.</p>
                    </div>
                </div>

                {!isPremium && (
                    <div className="bg-orange-50 border-2 border-orange-100 rounded-2xl p-4 flex items-center gap-4 animate-in fade-in slide-in-from-right-4">
                        <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shrink-0">
                            <Star className="w-6 h-6 text-white fill-white" />
                        </div>
                        <div>
                            <p className="text-sm font-black text-orange-800">Acceso Limitado</p>
                            <p className="text-xs text-orange-600 font-medium whitespace-nowrap">Suscríbete para desbloquear todos los niveles.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Course Map Section */}
            <CourseMap />
        </div>
    );
}
