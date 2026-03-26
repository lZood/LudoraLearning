import React from "react";
import { BookOpen, ChevronRight, Zap, Medal, Star, Type, GraduationCap, Trophy } from "lucide-react";
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import CourseMap from "@/components/dashboard/CourseMap";
import MobileDashboardContent from "@/components/dashboard/MobileDashboardContent";

export default async function DashboardIndex() {
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

    const isPremium = !!(subsData && subsData.length > 0);

    const bandaNumber = userData.english_level.replace('Banda ', '');
    const bandaTitle = bandaNumber === '1' ? 'Iniciación Inmersiva' : bandaNumber === '2' ? 'Básico Funcional' : 'Aventurero Independiente';

    return (
        <div className="w-full bg-white min-h-screen">
            {/* MOBILE VIEW (vistas pequeñas) */}
            <div className="md:hidden">
              <MobileDashboardContent 
                bandaNumber={bandaNumber} 
                bandaTitle={bandaTitle} 
                isPremium={isPremium} 
              />
            </div>

            {/* DESKTOP VIEW (vistas medianas/grandes) */}
            <div className="hidden md:flex flex-col gap-8 pb-12 w-full max-w-[1600px] mx-auto px-10 pt-10">
                {/* Header / Premium Banner if Free Tier */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                            Hola de nuevo, Aventurero
                        </h1>
                        <p className="mt-2 text-gray-500 font-bold">
                            Listo para continuar tu aprendizaje en <span className="text-[#632EB0] underline decoration-2 underline-offset-4">{bandaTitle} (Banda {bandaNumber})</span>.
                        </p>
                    </div>

                    {!isPremium && (
                        <div className="bg-[#632EB0] rounded-3xl p-5 flex items-center gap-5 shadow-xl shadow-purple-200 animate-in fade-in slide-in-from-right-4 group cursor-pointer hover:scale-[1.02] transition-transform">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0 border border-white/20">
                                <Star className="w-6 h-6 text-yellow-300 fill-yellow-300" />
                            </div>
                            <div>
                                <p className="text-sm font-black text-white">Estás en la Prueba Gratuita</p>
                                <p className="text-xs text-purple-200 font-bold">Desbloquea todo el contenido y sesiones en vivo.</p>
                            </div>
                            <Link href="/portal-alumno/dashboard/suscripcion" className="ml-4 text-xs font-black bg-white text-[#632EB0] px-5 py-3 rounded-xl hover:bg-purple-50 transition-all shadow-lg">
                                MEJORAR AHORA
                            </Link>
                        </div>
                    )}
                </div>

                {/* Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    
                    {/* LEFT COLUMN: Activity & Progress */}
                    <div className="col-span-1 lg:col-span-4 flex flex-col gap-8">
                        {/* Streak Card */}
                        <div className="bg-[#F8F9FB] rounded-[2.5rem] p-8 shadow-sm border border-gray-100 flex flex-col items-center">
                            <div className="flex items-center gap-3 mb-8">
                                <span className="text-5xl font-black text-gray-900">1</span>
                                <Zap className="w-10 h-10 text-orange-500 fill-orange-500 drop-shadow-sm" />
                            </div>
                            <div className="flex justify-between w-full text-center gap-2">
                                {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, i) => (
                                    <div key={i} className="flex flex-col items-center gap-3">
                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all shadow-sm ${
                                            i === 0 ? "bg-orange-500 text-white shadow-orange-100" : "bg-white text-gray-300 border border-gray-100"
                                        }`}>
                                            <Zap className={`w-5 h-5 ${i === 0 ? "fill-white" : ""}`} />
                                        </div>
                                        <span className={`text-[11px] font-black uppercase tracking-widest ${i === 0 ? "text-gray-900" : "text-gray-400"}`}>{day}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Progress Card */}
                        <div className="bg-[#F8F9FB] rounded-[2.5rem] p-8 shadow-sm border border-gray-100 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                <Trophy className="w-24 h-24 text-[#632EB0]" />
                            </div>
                            <div className="flex flex-col items-center text-center relative z-10">
                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-gray-50">
                                    <Medal className="w-8 h-8 text-[#632EB0]" />
                                </div>
                                <h3 className="text-xl font-black text-gray-900">Progreso Banda {bandaNumber}</h3>
                                <p className="text-xs text-gray-400 mt-2 mb-8 font-bold px-4 leading-relaxed uppercase tracking-wider">
                                    ¡Te falta muy poco para subir de nivel!
                                </p>
                                
                                <div className="w-full bg-white rounded-full h-4 mb-3 p-1 border border-gray-100 shadow-inner overflow-hidden">
                                    <div className="bg-[#632EB0] h-full rounded-full w-[15%] transition-all relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] animate-[shimmer_2s_infinite]"></div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between w-full text-xs text-[#632EB0] font-black uppercase tracking-widest px-1">
                                    <span>15% COMPLETADO</span>
                                    <span>120 / 800 XP</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Action & Tools */}
                    <div className="col-span-1 lg:col-span-8 flex flex-col gap-8">

                        {/* Welcome & Overview: The Big Action */}
                        <div className="bg-[#F8F9FB] rounded-[3rem] p-10 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-10">
                            <div className="w-32 h-32 md:w-48 md:h-48 bg-white rounded-[3rem] flex items-center justify-center flex-shrink-0 shadow-lg border border-gray-50 group">
                                <GraduationCap className="w-16 h-16 md:w-24 md:h-24 text-[#632EB0] group-hover:scale-110 transition-transform" />
                            </div>
                            <div className="flex flex-col items-center md:items-start text-center md:text-left">
                                <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Continuar Aprendiendo</h3>
                                <p className="text-gray-500 font-medium text-lg leading-relaxed mb-8 max-w-lg">
                                    Vas por muy buen camino. Abre tu mapa de niveles para continuar tus unidades de <span className="text-[#632EB0] font-bold">Banda {bandaNumber}</span>.
                                </p>
                                <Link 
                                    href="/portal-alumno/dashboard/cursos"
                                    className="px-10 py-5 bg-[#632EB0] text-white rounded-2xl font-black text-lg hover:bg-[#4E248B] transition-all shadow-xl shadow-purple-200 flex items-center gap-4 active:scale-95 group"
                                >
                                    <BookOpen className="w-7 h-7" />
                                    VER MAPA DE CURSOS
                                    <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>

                        {/* Stats Summary Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-[#F8F9FB] rounded-[2.5rem] p-8 border border-gray-100 flex items-center gap-6 group hover:shadow-md transition-all">
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                    <Zap className="w-8 h-8 text-yellow-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Siguiente Unidad</p>
                                    <p className="text-lg font-black text-gray-800">1. Bienvenido</p>
                                </div>
                            </div>
                            <div className="bg-[#F8F9FB] rounded-[2.5rem] p-8 border border-gray-100 flex items-center gap-6 group hover:shadow-md transition-all">
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                    <Star className="w-8 h-8 text-purple-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Tu Rango Actual</p>
                                    <p className="text-lg font-black text-gray-800">Aventurero {bandaNumber}</p>
                                </div>
                            </div>
                        </div>

                        {/* Quick Tools: Stylized Buttons */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {[
                                { title: "estudio", label: "Estudio Dinámico", sub: "Repasa vocabulario", icon: BookOpen, color: "text-orange-500", bg: "bg-orange-50", href: "/portal-alumno/dashboard/materiales" },
                                { title: "fonetica", label: "Pronunciación", sub: "Ejercicios fonéticos", icon: Type, color: "text-pink-500", bg: "bg-pink-50", href: "/portal-alumno/dashboard/letras" }
                            ].map((tool, i) => (
                                <Link key={i} href={tool.href} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 hover:border-[#632EB0] hover:shadow-xl hover:shadow-purple-200/20 transition-all group flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className={`w-16 h-16 ${tool.bg} rounded-2xl flex items-center justify-center group-hover:rotate-6 transition-all`}>
                                            <tool.icon className={`w-8 h-8 ${tool.color}`} />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black text-gray-900 leading-tight">{tool.label}</h4>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wide mt-1">{tool.sub}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-6 h-6 text-gray-300 group-hover:text-[#632EB0] transition-colors group-hover:translate-x-1 transition-transform" />
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
