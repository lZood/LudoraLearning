import React from "react";
import { CheckCircle2, Lock, PlayCircle, BookOpen, ChevronRight, Zap, Trophy, Medal, Star, Type } from "lucide-react";
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

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

    const isPremium = subsData && subsData.length > 0;

    const bandaNumber = userData.english_level.replace('Banda ', '');
    const bandaTitle = bandaNumber === '1' ? 'Iniciación Inmersiva' : bandaNumber === '2' ? 'Básico Funcional' : 'Aventurero Independiente';

    // Simulated Learning Path based on Banda
    const LEARNING_PATH = [
        { id: 1, title: 'El Alfabeto', description: 'Conceptos fundamentales.', status: 'completed' },
        { id: 2, title: 'Pronombres y Saludos', description: 'En progreso — 0/4 Misiones', status: 'current' },
        { id: 3, title: 'Verbo To Be', description: 'Fundamentos del ser.', status: 'upcoming' },
        { id: 4, title: 'Vocabulario de Casa', description: 'Tu entorno inmediato.', status: 'upcoming' },
        { id: 5, title: 'Presente Simple', description: 'Rutinas diarias.', status: 'upcoming' },
        { id: 6, title: 'Prueba de Banda', description: 'Evalúa tu conocimiento.', status: 'test' },
    ];

    return (
        <div className="flex flex-col gap-8 pb-12 w-full max-w-7xl mx-auto">
            
            {/* Header / Premium Banner if Free Tier */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                        Hola de nuevo, Aventurero
                    </h1>
                    <p className="mt-2 text-gray-500 font-medium">
                        Listo para continuar tu aprendizaje en <span className="text-[#815a9b] font-bold">{bandaTitle} (Banda {bandaNumber})</span>.
                    </p>
                </div>

                {!isPremium && (
                    <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-4 flex items-center gap-4 animate-in fade-in slide-in-from-right-4">
                        <div className="w-10 h-10 bg-[#815a9b] rounded-xl flex items-center justify-center shrink-0">
                            <Star className="w-6 h-6 text-white fill-white" />
                        </div>
                        <div>
                            <p className="text-sm font-black text-[#5e4171]">Estás en la Prueba Gratuita</p>
                            <p className="text-xs text-purple-600 font-medium">Desbloquea todo el contenido y sesiones en vivo.</p>
                        </div>
                        <Link href="/portal-alumno/dashboard/suscripcion" className="ml-2 text-xs font-black bg-[#815a9b] text-white px-3 py-2 rounded-lg hover:bg-[#6a4a7f] transition-all">
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
                                <Medal className="w-8 h-8 text-[#815a9b]" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Progreso Banda {bandaNumber}</h3>
                            <p className="text-sm text-gray-500 mt-1 mb-4 font-medium px-4">
                                Completa las misiones para avanzar a la siguiente banda.
                            </p>
                            
                            <div className="w-full bg-white rounded-full h-3 mb-2 p-0.5 border border-gray-100 shadow-inner overflow-hidden">
                                <div className="bg-[#815a9b] h-full rounded-full w-[15%] transition-all"></div>
                            </div>
                            <div className="flex items-center justify-between w-full text-xs text-gray-500 font-bold px-1">
                                <span>15% completado</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="col-span-1 lg:col-span-8 flex flex-col gap-6">

                    {/* Next Lesson Hero */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center relative overflow-hidden">
                        <div className="inline-block bg-purple-50 text-[#815a9b] font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-widest mb-6">
                            Misión Recomendada
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">
                            Pronombres y Saludos Básicos
                        </h2>
                        <p className="text-gray-500 font-medium mb-8 max-w-lg">
                            Aprende a presentarte y saludar formal e informalmente. Un paso vital para interactuar en Ludora.
                        </p>
                        
                        <div className="w-40 h-40 mb-8 relative">
                            <div className="absolute inset-0 bg-[#815a9b] rounded-3xl rotate-6 opacity-5"></div>
                            <div className="absolute inset-0 bg-[#815a9b] rounded-3xl -rotate-3 opacity-10"></div>
                            <div className="absolute inset-0 bg-white border-4 border-[#815a9b] rounded-3xl flex items-center justify-center shadow-xl">
                                <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center">
                                    <BookOpen className="w-10 h-10 text-[#815a9b]" />
                                </div>
                            </div>
                        </div>

                        <button className="w-full sm:w-auto bg-[#815a9b] hover:bg-[#6a4a7f] text-white px-12 py-4 rounded-2xl font-black text-lg transition-all shadow-lg shadow-purple-500/20 hover:-translate-y-1 active:scale-95">
                            Comenzar Misión
                        </button>
                    </div>

                    {/* Learning Path */}
                    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-[#815a9b]" />
                                Ruta de Aprendizaje
                            </h3>
                            {!isPremium && (
                                <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded-lg uppercase tracking-wider">
                                    Trial: Niveles 1-3
                                </span>
                            )}
                        </div>

                        <div className="flex flex-col relative px-2">
                            <div className="absolute left-[39px] sm:left-[47px] top-8 bottom-8 w-1 bg-gray-50 rounded-full z-0"></div>

                            {LEARNING_PATH.map((node, index) => {
                                const isLocked = !isPremium && index >= 3;
                                return (
                                    <div key={node.id} className={`flex items-start gap-4 sm:gap-6 relative z-10 mb-8 ${node.status === 'completed' ? 'opacity-50' : ''}`}>
                                        <div className={`w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-2xl flex items-center justify-center border-2 transition-all ${
                                            isLocked 
                                                ? 'bg-gray-50 border-gray-200' 
                                                : node.status === 'completed' 
                                                    ? 'bg-green-50 border-green-500' 
                                                    : node.status === 'current'
                                                        ? 'bg-white border-4 border-[#815a9b] shadow-lg shadow-purple-200'
                                                        : 'bg-white border-gray-200'
                                        }`}>
                                            {isLocked ? (
                                                <Lock className="w-5 h-5 text-gray-400" />
                                            ) : node.status === 'completed' ? (
                                                <CheckCircle2 className="w-6 h-6 text-green-600" />
                                            ) : node.status === 'test' ? (
                                                <Star className="w-6 h-6 text-orange-400" />
                                            ) : (
                                                <div className={`w-5 h-5 rounded-full ${node.status === 'current' ? 'bg-[#815a9b]' : 'bg-gray-200'}`}></div>
                                            )}
                                        </div>
                                        <div className="flex-1 pt-2">
                                            <div className="flex items-center gap-2">
                                                <h4 className={`text-base sm:text-lg font-bold ${isLocked ? 'text-gray-400' : 'text-gray-900'}`}>
                                                    {node.title}
                                                </h4>
                                                {isLocked && (
                                                    <span className="text-[10px] font-black text-white bg-[#815a9b] px-1.5 py-0.5 rounded uppercase tracking-tighter">Premium</span>
                                                )}
                                            </div>
                                            <p className={`text-xs sm:text-sm font-medium ${isLocked ? 'text-gray-300' : 'text-gray-500'}`}>
                                                {isLocked ? 'Desbloquea para acceder' : node.description}
                                            </p>
                                            
                                            {node.status === 'current' && !isLocked && (
                                                <button className="mt-3 bg-purple-50 text-[#815a9b] hover:bg-purple-100 font-bold px-4 py-2 rounded-xl text-xs sm:text-sm transition-colors">
                                                    Continuar
                                                </button>
                                            )}
                                            {isLocked && (
                                                <Link href="/portal-alumno/dashboard/suscripcion" className="mt-3 inline-block text-[#815a9b] text-xs font-bold hover:underline">
                                                    Obtener Membresía Ludora ➜
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Quick Tools */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Link href="/portal-alumno/dashboard/materiales" className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:border-[#815a9b] hover:shadow-md transition-all group flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                                    <BookOpen className="w-6 h-6 text-orange-500" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">Tarjetas de Estudio</h4>
                                    <p className="text-xs text-gray-500 font-medium">Repasa vocabulario</p>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#815a9b] transition-colors" />
                        </Link>

                        <Link href="/portal-alumno/dashboard/letras" className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:border-[#815a9b] hover:shadow-md transition-all group flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center group-hover:bg-pink-100 transition-colors">
                                    <Type className="w-6 h-6 text-pink-500" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">Pronunciación</h4>
                                    <p className="text-xs text-gray-500 font-medium">Ejercicios fonéticos</p>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#815a9b] transition-colors" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
