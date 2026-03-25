import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { 
    CreditCard, 
    Zap, 
    Star, 
    CheckCircle2, 
    XCircle,
    ShieldCheck, 
    Clock, 
    Calendar,
    ArrowRight,
    ExternalLink,
    Sparkles,
    Check,
    Lock
} from "lucide-react";
import Link from 'next/link';
import UpgradeButton from '@/components/dashboard/UpgradeButton';
import ManageSuscripcionButton from '@/components/dashboard/ManageSuscripcionButton';

export default async function SuscripcionPage() {
    const supabase = await createClient();

    // 1. Validate Auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/portal-alumno');

    // 2. Fetch User Data
    const { data: userData } = await supabase
        .from('users')
        .select('english_level, full_name')
        .eq('id', user.id)
        .single();

    // 3. Subscription Status
    const { data: subsData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['active', 'trialing'])
        .maybeSingle();

    const isPremium = !!subsData;
    const renewalDate = subsData?.current_period_end 
        ? new Date(subsData.current_period_end).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
        : '-';

    return (
        <div className="flex flex-col gap-12 pb-24 w-full max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000">
            
            {/* 1. Header Hero Section */}
            <div className="text-center flex flex-col items-center gap-4 max-w-3xl mx-auto mt-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50 text-[#815a9b] text-xs font-black uppercase tracking-widest border border-purple-100 shadow-sm mb-4">
                    <Sparkles className="w-3.5 h-3.5 fill-purple-400" />
                    Elige tu Destino en Ludora
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-[1.1]">
                    {isPremium ? 'Tu Membresía Maestra' : 'Desbloquea el Potencial de tu Aprendizaje'}
                </h1>
                <p className="text-gray-500 font-medium text-lg leading-relaxed">
                    {isPremium 
                        ? 'Estás en el camino hacia la maestría. Aquí puedes gestionar tu cuenta y ver tus beneficios.' 
                        : 'Pasa de ser un aventurero principiante a un maestro del idioma con acceso total a nuestro mundo interactivo.'}
                </p>
            </div>

            {/* 2. Main Subscription Section (Horizontal Layout) */}
            <div className={`grid grid-cols-1 ${isPremium ? 'lg:grid-cols-2' : 'lg:grid-cols-3'} gap-8 items-stretch`}>
                
                {/* 2A. LEFT: Status / Free Plan (If not premium) */}
                {!isPremium ? (
                    <div className="bg-white rounded-[2rem] p-10 border border-gray-100 shadow-sm flex flex-col justify-between transition-all hover:shadow-md animate-in slide-in-from-left duration-700">
                        <div>
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                                    <Clock className="w-6 h-6 text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Plan Actual</p>
                                    <h2 className="text-xl font-black text-gray-800 tracking-tight">Aventurero Gratuito</h2>
                                </div>
                            </div>
                            
                            <div className="space-y-5 mb-10">
                                <p className="text-gray-500 text-sm font-medium leading-relaxed">
                                    Ideal para explorar el terreno y conocer la metodología de Ludora.
                                </p>
                                <div className="bg-gray-50 p-6 rounded-2xl border border-dashed border-gray-200">
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Límites:</p>
                                    <ul className="space-y-3">
                                        <li className="flex items-center gap-3 text-xs font-bold text-gray-400 italic">
                                            <Lock className="w-3.5 h-3.5" />
                                            Niveles 4 en adelante bloqueados
                                        </li>
                                        <li className="flex items-center gap-3 text-xs font-bold text-gray-400 italic">
                                            <Lock className="w-3.5 h-3.5" />
                                            Sin clases grupales ilimitadas
                                        </li>
                                        <li className="flex items-center gap-3 text-xs font-bold text-gray-400 italic">
                                            <Lock className="w-3.5 h-3.5" />
                                            Sin certificados de banda
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="text-center">
                            <span className="text-gray-400 text-sm font-black uppercase tracking-widest">Activo</span>
                        </div>
                    </div>
                ) : (
                    /* If Premium, show subscription details card */
                    <div className="bg-gradient-to-br from-[#815a9b] to-[#5e4171] rounded-[2rem] p-10 border-4 border-[#a78bbf] text-white shadow-2xl shadow-purple-900/10 flex flex-col justify-between animate-in slide-in-from-left duration-700">
                        <div>
                            <div className="flex items-center justify-between mb-12">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-md">
                                        <ShieldCheck className="w-8 h-8 text-white" />
                                    </div>
                                    <h2 className="text-2xl font-black tracking-tight leading-none">Mi Membresía Pro</h2>
                                </div>
                                <div className="bg-yellow-400 text-[#5e4171] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg animate-pulse">
                                    Vip
                                </div>
                            </div>

                            <div className="space-y-8 mb-10">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
                                        <Calendar className="w-6 h-6 text-purple-200" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-purple-200">Próxima Renovación</p>
                                        <p className="text-xl font-black">{renewalDate}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
                                        <CreditCard className="w-6 h-6 text-purple-200" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-purple-200">Método de Facturación</p>
                                        <p className="text-xl font-black">Suscripción Mensual</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/10">
                            <ManageSuscripcionButton />
                        </div>
                    </div>
                )}

                {/* 2B. CENTER: PRO PLAN (The Upgrade Card) */}
                {!isPremium && (
                    <div className="lg:col-span-2 bg-white rounded-[2rem] p-1 border border-gray-100 shadow-2xl relative animate-in slide-in-from-bottom duration-700">
                        {/* Highlights & Framing */}
                        <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-[#815a9b] text-white px-8 py-2 rounded-full font-black text-xs uppercase tracking-widest shadow-xl border-4 border-white z-20">
                            Mejor Valor
                        </div>

                        <div className="bg-white rounded-[1.8rem] p-10 flex flex-col h-full items-stretch">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                                <div className="flex flex-col gap-2">
                                    <h3 className="text-4xl font-black text-gray-900 tracking-tight leading-none">Ludora Maestro</h3>
                                    <p className="text-gray-500 font-medium">Domina el idioma en tiempo récord.</p>
                                </div>
                                <div className="flex flex-col items-end">
                                    <div className="flex items-baseline gap-2 bg-[#815a9b]/5 px-6 py-4 rounded-3xl border border-[#815a9b]/10">
                                        <span className="text-5xl font-black text-[#5e4171] tracking-tighter">$1,400</span>
                                        <span className="text-sm font-bold text-gray-400 uppercase tracking-widest underline decoration-[#815a9b]/30">MXN / Mes</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-5 mb-12 flex-1">
                                {[
                                    { text: "Acceso total a todos los niveles (4, 5, 6...)", premium: true },
                                    { text: "Clases grupales diarias ilimitadas", premium: true },
                                    { text: "Tutor inteligente AI 24/7", premium: true },
                                    { text: "Material descargable exclusivo", premium: true },
                                    { text: "Certificados avalados por banda", premium: true },
                                    { text: "Soporte priority vía WhatsApp", premium: true },
                                    { text: "Sin anuncios ni distracciones", premium: true },
                                    { text: "Progreso sincronizado en la nube", premium: true }
                                ].map((feature, i) => (
                                    <div key={i} className="flex items-center gap-4 group">
                                        <div className="bg-[#815a9b]/10 rounded-full p-1.5 shrink-0 transition-colors group-hover:bg-[#815a9b]/20">
                                            <Check className="w-4 h-4 text-[#815a9b]" strokeWidth={4} />
                                        </div>
                                        <span className="text-[15px] font-bold text-gray-700 tracking-tight">{feature.text}</span>
                                    </div>
                                ))}
                            </div>

                            <UpgradeButton />
                            
                            <div className="mt-8 flex items-center justify-center gap-8">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-green-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Pago Seguro 256-bit</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Cancela cuando quieras</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* If Premium, show another benefit card on the right */}
                {isPremium && (
                    <div className="bg-white rounded-[2rem] p-10 border border-gray-100 shadow-sm flex flex-col justify-between transition-all hover:shadow-md animate-in slide-in-from-right duration-700">
                        <div>
                            <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-3">
                                <Zap className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                                Historial y Soporte
                            </h3>
                            <p className="text-gray-500 text-sm font-medium leading-relaxed mb-8">
                                Como Aventurero Maestro, tienes acceso a un historial de pagos detallado y soporte prioritario.
                            </p>
                            <div className="space-y-4">
                                <Link 
                                    href="#" 
                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl group hover:bg-purple-50 transition-all border border-transparent hover:border-purple-100"
                                >
                                    <span className="text-sm font-bold text-gray-600 group-hover:text-[#815a9b]">Descargar Recibos</span>
                                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#815a9b]" />
                                </Link>
                                <Link 
                                    href="#" 
                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl group hover:bg-purple-50 transition-all border border-transparent hover:border-purple-100"
                                >
                                    <span className="text-sm font-bold text-gray-600 group-hover:text-[#815a9b]">Contactar Mentor VIP</span>
                                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#815a9b]" />
                                </Link>
                            </div>
                        </div>
                        <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest text-center mt-6">Ludora Support 24/7</p>
                    </div>
                )}
            </div>

            {/* 3. Detailed Comparison Matrix (The "Professional" Look) */}
            <div className="mt-20 flex flex-col gap-10">
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Comparación Detallada de Caminos</h2>
                    <p className="text-gray-500 font-medium">Todo lo que necesitas saber antes de subir de nivel.</p>
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-8 py-6 text-left text-sm font-black text-gray-500 uppercase tracking-widest border-b border-gray-100">Característica</th>
                                    <th className="px-8 py-6 text-center text-sm font-black text-gray-500 uppercase tracking-widest border-b border-gray-100 w-32 md:w-48">Gratis</th>
                                    <th className="px-8 py-6 text-center text-sm font-black text-[#815a9b] uppercase tracking-widest border-b border-gray-100 w-32 md:w-48 bg-purple-50/30">Maestro (Pro)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {[
                                    { feat: "Mapa Niveles 1-3", free: true, pro: true },
                                    { feat: "Mapa Niveles 4 en adelante", free: false, pro: true },
                                    { feat: "Lecciones en Video HD", free: true, pro: true },
                                    { feat: "Ejercicios Interactivos", free: true, pro: true },
                                    { feat: "Clases Grupales en Vivo", free: "1 Mensual", pro: "Ilimitadas" },
                                    { feat: "Tutor AI Personalizado", free: false, pro: true },
                                    { feat: "Descarga de Materiales", free: false, pro: true },
                                    { feat: "Certificación por Banda", free: false, pro: true },
                                    { feat: "Experiencia sin anuncios", free: false, pro: true }
                                ].map((row, i) => (
                                    <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-5 text-sm font-bold text-gray-700">{row.feat}</td>
                                        <td className="px-8 py-5 text-center">
                                            {typeof row.free === 'string' ? (
                                                <span className="text-xs font-black text-gray-400">{row.free}</span>
                                            ) : row.free ? (
                                                <CheckCircle2 className="w-6 h-6 text-green-500 mx-auto" />
                                            ) : (
                                                <XCircle className="w-6 h-6 text-gray-200 mx-auto" />
                                            )}
                                        </td>
                                        <td className="px-8 py-5 text-center bg-purple-50/10">
                                            {typeof row.pro === 'string' ? (
                                                <span className="text-xs font-black text-[#815a9b]">{row.pro}</span>
                                            ) : row.pro ? (
                                                <CheckCircle2 className="w-6 h-6 text-[#815a9b] mx-auto fill-[#815a9b]/10" />
                                            ) : (
                                                <XCircle className="w-6 h-6 text-gray-200 mx-auto" />
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* 4. Final CTA Section */}
            {!isPremium && (
                <div className="mt-16 bg-[#FDF0FF] rounded-[3rem] p-12 flex flex-col md:flex-row items-center justify-between gap-10 border-2 border-purple-100 shadow-inner">
                   <div className="flex flex-col gap-3 max-w-xl">
                        <h2 className="text-3xl font-black text-[#5e4171] leading-tight">¿Listo para comenzar tu verdadera aventura?</h2>
                        <p className="text-gray-600 font-medium">Únete a miles de alumnos que ya están dominando el inglés con la metodología inmersiva de Ludora.</p>
                   </div>
                   <div className="shrink-0">
                        <UpgradeButton />
                   </div>
                </div>
            )}

            {/* 5. Trust Badges */}
            <div className="flex flex-wrap justify-center items-center gap-12 opacity-40 grayscale hover:grayscale-0 transition-all duration-700 mt-8">
                <span className="text-lg font-black text-gray-400">STRIPE SECURE</span>
                <span className="text-lg font-black text-gray-400">AMAZON WEB SERVICES</span>
                <span className="text-lg font-black text-gray-400">GOOGLE CLOUD</span>
                <span className="text-lg font-black text-gray-400">SUPABASE DB</span>
            </div>

        </div>
    );
}
