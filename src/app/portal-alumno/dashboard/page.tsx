import React from "react";
import { CheckCircle2, Lock, PlayCircle, BookOpen } from "lucide-react";
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardIndex() {
    const supabase = await createClient();

    // 1. Validate Auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect('/portal-alumno');
    }

    // 2. Validate Level
    const { data: userData } = await supabase
        .from('users')
        .select('english_level')
        .eq('id', user.id)
        .single();

    if (!userData || !userData.english_level) {
        redirect('/portal-alumno/evaluacion');
    }

    // 3. Validate Subscription
    const { data: subsData } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', user.id)
        .in('status', ['active', 'trialing']);

    if (!subsData || subsData.length === 0) {
        // Redirige a evaluación, donde se mostrará la pantalla de pago (o a una ruta de pago dedicada si la hubiese)
        redirect('/portal-alumno/evaluacion');
    }

    const bandaNumber = userData.english_level.replace('Banda ', '');
    const bandaTitle = bandaNumber === '1' ? 'Comenzando con Inglés Básico' : bandaNumber === '2' ? 'Inglés Intermedio y Rutinas' : 'Discurso Conectado B1+';
    const bandaDesc = bandaNumber === '1' ? 'Descubre los conceptos básicos del idioma inglés, incluyendo vocabularios clave, gramática esencial y conversaciones diarias.' : bandaNumber === '2' ? 'Aprende a comunicarte en tareas cotidianas y mejora tu fluidez.' : 'Negociación y discurso conectado para expresarte con naturalidad en inglés.';

    return (
        <div className="flex flex-col gap-8 pb-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-bold tracking-widest text-gray-500 uppercase mb-1">
                        Nivel {bandaNumber}
                    </p>
                    <h1 className="text-3xl font-extrabold text-gray-900">
                        {bandaTitle}
                    </h1>
                    <p className="mt-2 text-gray-600 max-w-3xl">
                        {bandaDesc}
                    </p>
                </div>
                <button className="bg-[#5B4FE0] hover:bg-[#4a3fcc] text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-[#5B4FE0]/30">
                    Continuar aprendiendo
                </button>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Course List */}
                <div className="lg:col-span-2 flex flex-col gap-4">

                    {/* Completed Lesson */}
                    <div className="flex items-center justify-between p-5 bg-white border border-gray-200 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                                <span className="text-2xl font-bold text-[#5B4FE0]">A</span>
                            </div>
                            <span className="text-lg font-bold text-gray-900">¿Qué es el Alfabeto?</span>
                        </div>
                        <CheckCircle2 className="w-6 h-6 text-green-500 text-xl" />
                    </div>

                    {/* Active Lesson */}
                    <div className="flex items-center justify-between p-5 bg-white border-2 border-[#5B4FE0] rounded-2xl shadow-md relative">
                        {/* Tooltip-like Start Badge */}
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#5B4FE0] text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                            Start
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                                <span className="text-2xl font-bold text-blue-500">B</span>
                            </div>
                            <span className="text-lg font-bold text-gray-900">Pronombres y Saludos</span>
                        </div>
                        <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
                            J
                        </div>
                    </div>

                    {/* Locked Lesson 1 */}
                    <div className="flex items-center justify-between p-5 bg-white border border-gray-200 rounded-2xl shadow-sm opacity-60">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                                <span className="text-2xl font-bold text-green-500">C</span>
                            </div>
                            <span className="text-lg font-bold text-gray-900">Verbo To Be</span>
                        </div>
                        <CheckCircle2 className="w-6 h-6 text-gray-300" />
                    </div>

                    {/* Locked Lesson 2 */}
                    <div className="flex items-center justify-between p-5 bg-gray-50 border border-gray-200 rounded-2xl">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gray-200 flex items-center justify-center">
                                <Lock className="w-6 h-6 text-gray-400" />
                            </div>
                            <span className="text-lg font-bold text-gray-500">Prueba de Nivel 1</span>
                        </div>
                        <Lock className="w-5 h-5 text-gray-400" />
                    </div>

                </div>

                {/* Right Sidebar (Certificate & Quick Links) */}
                <div className="flex flex-col gap-6">

                    {/* Certificate Widget */}
                    <div className="bg-white border-2 border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
                        <div className="w-24 h-24 mb-4 relative">
                            <img src="/images/certificate.png" alt="Certificate" className="opacity-80" />
                            {/* Fallback Icon if certificate image doesn't exist */}
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-full">
                                <Lock className="w-8 h-8 text-yellow-400 mb-2" />
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Gana tu certificado de curso</h3>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <div className="bg-[#5B4FE0] h-2 rounded-full w-[3%]"></div>
                        </div>
                        <div className="flex items-center justify-between w-full text-xs text-gray-500 font-bold">
                            <span>3% completado</span>
                            <span>6 horas restantes</span>
                        </div>
                        <button className="mt-6 w-full bg-[#5B4FE0] hover:bg-[#4a3fcc] text-white font-bold py-3 rounded-xl transition-colors shadow-md shadow-[#5B4FE0]/20">
                            Continuar aprendiendo
                        </button>
                    </div>

                    {/* Quick Access or Additional info */}
                    <div className="bg-white border rounded-2xl p-6 shadow-sm">
                        <h3 className="text-md font-bold text-gray-900 mb-4">Herramientas Rápidas</h3>
                        <div className="flex flex-col gap-3">
                            <button className="flex items-center gap-3 text-left p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200">
                                <BookOpen className="w-5 h-5 text-purple-600" />
                                <span className="font-semibold text-gray-700 text-sm">Tarjetas de Aprendizaje</span>
                            </button>
                            <button className="flex items-center gap-3 text-left p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200">
                                <PlayCircle className="w-5 h-5 text-blue-500" />
                                <span className="font-semibold text-gray-700 text-sm">Pronunciación (Fonética)</span>
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
