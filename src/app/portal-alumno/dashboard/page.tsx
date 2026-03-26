import React from "react";
import { BookOpen, ChevronRight, Zap, Medal, Star, Type, GraduationCap } from "lucide-react";
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
        <div className="w-full">
            {/* MOBILE VIEW (vistas pequeñas) */}
            <div className="md:hidden">
              <MobileDashboardContent 
                bandaNumber={bandaNumber} 
                bandaTitle={bandaTitle} 
                isPremium={isPremium} 
              />
            </div>

            {/* DESKTOP VIEW (vistas medianas/grandes) */}
            <div className="hidden md:flex flex-col gap-8 pb-12 w-full max-w-7xl mx-auto">
                {/* Header / Premium Banner if Free Tier */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                            Hola de nuevo, Aventurero
                        </h1>
                        <p className="mt-2 text-gray-500 font-medium">
                            Listo para continuar tu aprendizaje en <span className="text-[#632EB0] font-bold">{bandaTitle} (Banda {bandaNumber})</span>.
                        </p>
                    </div>

                    {!isPremium && (
                        <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-4 flex items-center gap-4 animate-in fade-in slide-in-from-right-4">
                            <div className="w-10 h-10 bg-[#632EB0] rounded-xl flex items-center justify-center shrink-0">
                                <Star className="w-6 h-6 text-white fill-white" />
                            </div>
                            <div>
                                <p className="text-sm font-black text-[#5e4171]">Estás en la Prueba Gratuita</p>
                                <p className="text-xs text-purple-600 font-medium">Desbloquea todo el contenido y sesiones en vivo.</p>
                            </div>
                            <Link href="/portal-alumno/dashboard/suscripcion" className="ml-2 text-xs font-black bg-[#632EB0] text-white px-3 py-2 rounded-lg hover:bg-[#4E248B] transition-all">
                                Mejorar
                            </Link>
                        </div>
                    )}
                </div>

                {/* Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* LEFT COLUMN */}
                    <div className="col-span-1 lg:col-span-4 flex flex-col gap-6">
                        {/* Streak Card */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-center">
                            <div className="flex items-center gap-2 mb-6">
                                <span className="text-4xl font-black text-gray-900">1</span>
                                <Zap className="w-8 h-8 text-yellow-500 fill-yellow-500" />
                            </div>
                            <div className="flex justify-between w-full text-center">
                                {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, i) => (
                                    <div key={i} className="flex flex-col items-center gap-2">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                            i === 0 ? "bg-yellow-100 text-yellow-600" : "bg-gray-50 text-gray-400"
                                        }`}>
                                            {i === 0 ? <Zap className="w-4 h-4 fill-yellow-500" /> : <Zap className="w-4 h-4" />}
                                        </div>
                                        <span className="text-xs font-bold text-gray-400">{day}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Progress Card */}
                        <div className="bg-gradient-to-br from-purple-50 to-[#F8F9FA] rounded-3xl p-6 shadow-sm border border-purple-100">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
                                    <Medal className="w-8 h-8 text-[#632EB0]" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Progreso Banda {bandaNumber}</h3>
                                <p className="text-sm text-gray-500 mt-1 mb-4 font-medium px-4">
                                    Completa las misiones para avanzar a la siguiente banda.
                                </p>
                                
                                <div className="w-full bg-white rounded-full h-3 mb-2 p-0.5 border border-gray-100 shadow-inner overflow-hidden">
                                    <div className="bg-[#632EB0] h-full rounded-full w-[15%] transition-all"></div>
                                </div>
                                <div className="flex items-center justify-between w-full text-xs text-gray-500 font-bold px-1">
                                    <span>15% completado</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="col-span-1 lg:col-span-8 flex flex-col gap-6">

                        {/* Welcome & Overview */}
                        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center gap-6">
                            <div className="w-20 h-20 bg-purple-50 rounded-[2rem] flex items-center justify-center">
                                <GraduationCap className="w-10 h-10 text-[#632EB0]" />
                            </div>
                            <div className="max-w-md">
                                <h3 className="text-2xl font-black text-gray-900 mb-2">Continuar Aprendiendo</h3>
                                <p className="text-gray-500 font-medium">
                                    Vas por muy buen camino. Haz clic abajo para abrir tu mapa de niveles y continuar tus unidades de <span className="text-[#632EB0] font-bold">Banda {bandaNumber}</span>.
                                </p>
                            </div>
                            
                            <Link 
                                href="/portal-alumno/dashboard/cursos"
                                className="w-full sm:w-auto px-8 py-4 bg-[#632EB0] text-white rounded-2xl font-black text-lg hover:bg-[#4E248B] transition-all shadow-lg shadow-purple-200 flex items-center justify-center gap-3 active:scale-95"
                            >
                                <BookOpen className="w-6 h-6" />
                                Ver Mapa de Cursos
                            </Link>
                        </div>

                        {/* Progress Stats Summary (Optional/Compact) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                            <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                    <Zap className="w-6 h-6 text-yellow-500" />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Siguiente Unidad</p>
                                    <p className="font-bold text-gray-800">1. Bienvenido</p>
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                    <Medal className="w-6 h-6 text-purple-500" />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Tu Nivel Actual</p>
                                    <p className="font-bold text-gray-800">{bandaNumber}: {bandaTitle}</p>
                                </div>
                            </div>
                        </div>

                        {/* Quick Tools */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Link href="/portal-alumno/dashboard/materiales" className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:border-[#632EB0] hover:shadow-md transition-all group flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                                        <BookOpen className="w-6 h-6 text-orange-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Tarjetas de Estudio</h4>
                                        <p className="text-xs text-gray-500 font-medium">Repasa vocabulario</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#632EB0] transition-colors" />
                            </Link>

                            <Link href="/portal-alumno/dashboard/letras" className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:border-[#632EB0] hover:shadow-md transition-all group flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center group-hover:bg-pink-100 transition-colors">
                                        <Type className="w-6 h-6 text-pink-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Pronunciación</h4>
                                        <p className="text-xs text-gray-500 font-medium">Ejercicios fonéticos</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#632EB0] transition-colors" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
