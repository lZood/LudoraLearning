'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  Calendar as CalendarIcon,
  Users,
  Clock,
  ChevronRight,
  AlertCircle,
  Info,
  CheckCircle2,
  Loader2,
  CalendarX,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import MobileSubHeader from '@/components/dashboard/MobileSubHeader';
import CursosSubNav from '@/components/dashboard/CursosSubNav';
import HapticTrigger, { HapticHandle } from '@/components/ui/HapticTrigger';
import { createClient } from '@/utils/supabase/client';

// Tipo de clase ya procesada para la vista (conserva la forma del antiguo MOCK_CLASSES)
type LiveClass = {
    id: string;
    title: string;
    teacher: string;
    date: string;       // "Hoy, 25 Mar"
    time: string;       // "17:00 - 18:00"
    slots: number;      // cupos disponibles (capacity - reservados)
    level: string;      // "Banda 1"
    status: 'available' | 'full' | 'booked';
    coinCost: number;
    scheduledAt: string;
};

const MAX_CLASSES_PER_MONTH = 4;

// ── Helpers de formato (Español) ──────────────────────────────────────────────
const WEEKDAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MONTHS_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function isSameDay(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatDateLabel(d: Date): string {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);

    const dayNum = d.getDate();
    const monthLabel = MONTHS_SHORT[d.getMonth()];

    if (isSameDay(d, now)) return `Hoy, ${dayNum} ${monthLabel}`;
    if (isSameDay(d, tomorrow)) return `Mañana, ${dayNum} ${monthLabel}`;
    return `${WEEKDAYS[d.getDay()]}, ${dayNum} ${monthLabel}`;
}

function formatTimeRange(start: Date, durationMin: number): string {
    const end = new Date(start.getTime() + durationMin * 60_000);
    const fmt = (x: Date) =>
        `${x.getHours().toString().padStart(2, '0')}:${x.getMinutes().toString().padStart(2, '0')}`;
    return `${fmt(start)} - ${fmt(end)}`;
}

export default function CalendarioPage() {
    const supabase = createClient();
    const hapticRef = useRef<HapticHandle>(null);

    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [classes, setClasses] = useState<LiveClass[]>([]);
    const [coins, setCoins] = useState(0);
    const [monthlyClasses, setMonthlyClasses] = useState(0); // reservas usadas este mes
    const [bookingId, setBookingId] = useState<string | null>(null); // clase reservándose ahora
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const triggerHaptic = () => {
        hapticRef.current?.trigger();
    };

    // ── Carga / Recarga de datos reales ───────────────────────────────────────
    const fetchData = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setLoading(false);
            return;
        }

        const [{ data: liveClasses }, { data: myBookings }, { data: gamification }, { data: bookingCounts }] = await Promise.all([
            supabase
                .from('live_classes')
                .select('*')
                .eq('status', 'scheduled')
                .order('scheduled_at', { ascending: true }),
            supabase
                .from('class_bookings')
                .select('class_id, status')
                .eq('student_id', user.id),
            supabase
                .from('user_gamification')
                .select('coins')
                .eq('user_id', user.id)
                .maybeSingle(),
            // Conteo GLOBAL de reservas activas por clase (RPC agregada; no limitado por RLS).
            supabase.rpc('class_booking_counts'),
        ]);

        const takenByClass = new Map<string, number>();
        const bookedByMe = new Set<string>();
        ((myBookings as Array<{ class_id: string; status: string }> | null) ?? []).forEach((b) => {
            if (b.status === 'booked') bookedByMe.add(b.class_id);
        });
        ((bookingCounts as Array<{ class_id: string; taken: number }> | null) ?? []).forEach((b) => {
            takenByClass.set(b.class_id, Number(b.taken));
        });

        const processed: LiveClass[] = ((liveClasses as Array<{
            id: string;
            title: string;
            scheduled_at: string;
            duration_min: number;
            capacity: number;
            level: string | null;
            status: string;
            coin_cost: number;
        }> | null) ?? []).map((c) => {
            const start = new Date(c.scheduled_at);
            const taken = takenByClass.get(c.id) ?? 0;
            const slots = Math.max(0, c.capacity - taken);
            const mine = bookedByMe.has(c.id);
            return {
                id: c.id,
                title: c.title,
                teacher: 'Profesor Ludora',
                date: formatDateLabel(start),
                time: formatTimeRange(start, c.duration_min ?? 45),
                slots,
                level: c.level || 'Todas las bandas',
                status: mine ? 'booked' : slots <= 0 ? 'full' : 'available',
                coinCost: c.coin_cost ?? 1,
                scheduledAt: c.scheduled_at,
            };
        });

        // Reservas usadas este mes (calendario actual) para el contador X/4.
        const now = new Date();
        const usedThisMonth = processed.filter(
            (c) => c.status === 'booked' &&
                (() => {
                    const d = new Date(c.scheduledAt);
                    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
                })()
        ).length;

        setClasses(processed);
        setCoins(gamification?.coins ?? 0);
        setMonthlyClasses(usedThisMonth);
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        setMounted(true);
        fetchData();
    }, [fetchData]);

    // ── Reservar clase vía RPC book_class ──────────────────────────────────────
    const handleReservar = async (clase: LiveClass) => {
        triggerHaptic();
        setErrorMsg(null);
        setBookingId(clase.id);
        try {
            const { data, error } = await supabase.rpc('book_class', { p_class_id: clase.id });
            if (error) {
                // Mensaje de la excepción de la BD (p.ej. "cupo lleno" / "monedas insuficientes")
                const raw = error.message || 'No se pudo reservar la clase.';
                let friendly = raw;
                if (raw.includes('cupo lleno')) friendly = 'Esta clase ya no tiene cupos disponibles.';
                else if (raw.includes('monedas insuficientes')) friendly = 'No tienes suficientes Monedas Ludora.';
                else if (raw.includes('clase no disponible')) friendly = 'Esta clase ya no está disponible.';
                setErrorMsg(friendly);
            } else if (data === 'ok' || data === 'already') {
                await fetchData(); // re-fetch para reflejar reservado, cupos y monedas
            }
        } catch (e) {
            setErrorMsg('Ocurrió un error al reservar. Inténtalo de nuevo.');
        } finally {
            setBookingId(null);
        }
    };

    const monthLimitReached = monthlyClasses >= MAX_CLASSES_PER_MONTH;

    if (!mounted) return null;

    return (
        <div className="flex flex-col w-full min-h-screen bg-[#F8F9FB] pb-40">
            <HapticTrigger ref={hapticRef} />
            <MobileSubHeader hideNav={true} />

            <div className="flex flex-col gap-6 px-4 pt-6 max-w-7xl mx-auto w-full">

                {/* 1. WALLET CARD (Premium Hero) */}
                <div className="relative overflow-hidden bg-gradient-to-br from-[#632EB0] to-[#4E248B] rounded-[2.5rem] p-6 shadow-xl shadow-purple-200">
                    <div className="relative z-10 flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                            <span className="text-purple-200 text-xs font-black uppercase tracking-widest">Tus Monedas Ludora</span>
                            <div className="flex items-center gap-3">
                                <span className="text-4xl font-black text-white">{coins}</span>
                                <div className="w-10 h-10 relative">
                                    <Image
                                        src="/moneda_ludora_3d_icon_1774482917879.png"
                                        alt="Moneda"
                                        fill
                                        className="object-contain animate-bounce-slow"
                                    />
                                </div>
                            </div>
                            <p className="text-purple-200/70 text-[11px] font-bold mt-2">
                                Gana más monedas completando unidades en tu curso.
                            </p>
                        </div>

                        <div className="flex flex-col items-center bg-white/10 backdrop-blur-md rounded-3xl p-4 border border-white/20">
                            <span className="text-[10px] text-white/60 font-black uppercase ">Clases este mes</span>
                            <span className="text-2xl font-black text-white">{monthlyClasses}/{MAX_CLASSES_PER_MONTH}</span>
                            <div className="h-1.5 w-16 bg-white/20 rounded-full mt-2 overflow-hidden">
                                <div className="h-full bg-green-400 rounded-full" style={{ width: `${(monthlyClasses/MAX_CLASSES_PER_MONTH)*100}%` }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Background decorations */}
                    <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
                    <div className="absolute -left-10 -top-10 w-32 h-32 bg-purple-400/20 rounded-full blur-2xl"></div>
                </div>

                {/* 2. SECTION TITLE */}
                <div className="flex items-center justify-between px-2">
                    <div className="flex flex-col">
                        <h2 className="text-xl font-black text-gray-900 leading-tight">Clases Disponibles</h2>
                        <span className="text-xs text-gray-400 font-bold tracking-wide">Basado en tu Nivel y Unidades</span>
                    </div>
                    <button className="p-2 bg-white rounded-2xl border border-gray-100 shadow-sm text-gray-400">
                        <History className="w-5 h-5" />
                    </button>
                </div>

                {/* 3. CLASS LIST */}
                {loading ? (
                    /* Loading skeleton (conserva la estructura de la lista) */
                    <div className="flex flex-col gap-4">
                        {[0, 1, 2].map((i) => (
                            <div key={i} className="relative bg-white border border-gray-100 rounded-[2rem] p-5 shadow-sm animate-pulse">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-gray-100 border border-gray-100"></div>
                                        <div className="flex flex-col gap-2">
                                            <div className="h-4 w-40 bg-gray-100 rounded-full"></div>
                                            <div className="h-3 w-24 bg-gray-100 rounded-full"></div>
                                        </div>
                                    </div>
                                    <div className="h-6 w-16 bg-gray-100 rounded-full"></div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 mb-5">
                                    <div className="h-10 bg-gray-50 rounded-2xl border border-gray-50"></div>
                                    <div className="h-10 bg-gray-50 rounded-2xl border border-gray-50"></div>
                                </div>
                                <div className="h-12 w-full bg-gray-100 rounded-2xl"></div>
                            </div>
                        ))}
                    </div>
                ) : classes.length === 0 ? (
                    /* Estado vacío amigable */
                    <div className="bg-white border border-gray-100 rounded-[2rem] p-10 shadow-sm flex flex-col items-center text-center gap-3">
                        <div className="w-16 h-16 rounded-3xl bg-purple-50 border border-purple-100 flex items-center justify-center">
                            <CalendarX className="w-8 h-8 text-[#632EB0]" />
                        </div>
                        <h3 className="text-lg font-black text-gray-900">No hay clases programadas</h3>
                        <p className="text-sm text-gray-400 font-medium max-w-xs leading-relaxed">
                            Por ahora no tenemos clases en vivo disponibles. Vuelve pronto, ¡estamos preparando nuevas aventuras!
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {classes.map((clase) => {
                            const isFull = clase.status === 'full';
                            const isBooked = clase.status === 'booked';
                            const isBookingThis = bookingId === clase.id;
                            const cannotBook = isFull || isBooked || coins < clase.coinCost || monthLimitReached;
                            return (
                                <motion.div
                                    key={clase.id}
                                    whileTap={{ scale: 0.98 }}
                                    className={`relative bg-white border rounded-[2rem] p-5 shadow-sm transition-all ${
                                        isBooked ? 'border-green-200' : 'border-gray-100'
                                    } ${isFull ? 'opacity-70' : 'hover:shadow-md'}`}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${
                                                isFull ? 'bg-gray-50 border-gray-100' : 'bg-purple-50 border-purple-100'
                                            }`}>
                                                <Users className={`w-6 h-6 ${isFull ? 'text-gray-300' : 'text-[#632EB0]'}`} />
                                            </div>
                                            <div className="flex flex-col">
                                                <h3 className="font-black text-gray-900 text-[17px] leading-tight mb-1">{clase.title}</h3>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-gray-400">{clase.teacher}</span>
                                                    <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                                                    <span className="text-[10px] font-black tracking-widest text-[#632EB0] uppercase">{clase.level}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                            isBooked ? 'bg-green-50 text-green-600'
                                                : clase.slots === 0 ? 'bg-gray-100 text-gray-400'
                                                : 'bg-green-50 text-green-600'
                                        }`}>
                                            {isBooked ? 'Reservado' : clase.slots === 0 ? 'Lleno' : `${clase.slots} Cupos`}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mb-5">
                                        <div className="flex items-center gap-2 bg-gray-50/50 rounded-2xl p-2.5 px-4 border border-gray-50">
                                            <CalendarIcon className="w-4 h-4 text-gray-400" />
                                            <span className="text-[13px] font-bold text-gray-700">{clase.date}</span>
                                        </div>
                                        <div className="flex items-center gap-2 bg-gray-50/50 rounded-2xl p-2.5 px-4 border border-gray-50">
                                            <Clock className="w-4 h-4 text-gray-400" />
                                            <span className="text-[13px] font-bold text-gray-700">{clase.time}</span>
                                        </div>
                                    </div>

                                    <button
                                        disabled={cannotBook || isBookingThis}
                                        onClick={() => handleReservar(clase)}
                                        className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 ${
                                            isBooked
                                                ? 'bg-green-50 text-green-600 shadow-none border-2 border-green-200 cursor-default'
                                                : cannotBook
                                                    ? 'bg-gray-100 text-gray-300 shadow-none cursor-not-allowed'
                                                    : 'bg-white border-2 border-[#632EB0] text-[#632EB0] hover:bg-purple-50 active:scale-95 shadow-purple-50'
                                        }`}
                                    >
                                        {isBookingThis ? (
                                            <>
                                                Reservando...
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            </>
                                        ) : isBooked ? (
                                            <>
                                                Reservado
                                                <CheckCircle2 className="w-4 h-4" />
                                            </>
                                        ) : isFull ? (
                                            'Sin Cupos'
                                        ) : monthLimitReached ? (
                                            'Límite mensual alcanzado'
                                        ) : coins < clase.coinCost ? (
                                            'Monedas insuficientes'
                                        ) : (
                                            <>
                                                {`Agendar con ${clase.coinCost} ${clase.coinCost === 1 ? 'Moneda' : 'Monedas'}`}
                                                <ChevronRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* 4. HELP BOX */}
                <div className="bg-blue-50/50 border border-blue-100/50 rounded-[2rem] p-6 mt-4 mb-8">
                   <div className="flex gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                            <Info className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <h4 className="text-sm font-black text-blue-900">¿Cómo funcionan las clases?</h4>
                            <p className="text-xs text-blue-800 font-medium leading-relaxed opacity-70">
                                Las clases son grupales (máx. 8 alumnos) y se realizan en nuestro servidor privado de Minecraft. Necesitas 1 Moneda Ludora por cada reserva. Puedes agendar hasta 4 clases al mes.
                            </p>
                        </div>
                   </div>
                </div>

            </div>

            <CursosSubNav />

            {/* Floating Info: error de reserva (cupo lleno / monedas insuficientes / etc.) */}
            <AnimatePresence>
                {errorMsg && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        onClick={() => setErrorMsg(null)}
                        className="fixed bottom-32 left-4 right-4 z-[200] bg-orange-500 text-white p-4 rounded-2xl shadow-xl flex items-center gap-3 cursor-pointer"
                    >
                        <AlertCircle className="w-6 h-6 shrink-0" />
                        <div className="flex flex-col">
                            <p className="text-[13px] font-black">No se pudo reservar</p>
                            <p className="text-[11px] font-bold opacity-80">{errorMsg}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Info (Monedas Insuficientes) */}
            <AnimatePresence>
                {!loading && !errorMsg && coins === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-32 left-4 right-4 z-[200] bg-orange-500 text-white p-4 rounded-2xl shadow-xl flex items-center gap-3"
                    >
                        <AlertCircle className="w-6 h-6 shrink-0" />
                        <div className="flex flex-col">
                            <p className="text-[13px] font-black">Te has quedado sin monedas</p>
                            <p className="text-[11px] font-bold opacity-80">Completa la siguiente unidad del curso para ganar otra.</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
