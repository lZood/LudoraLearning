'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Headphones,
  Video,
  Map,
  Image as ImageIcon,
  Gamepad2,
  Puzzle,
  CheckSquare,
  MousePointer2,
  FileText,
  BookOpen,
  PlayCircle,
  Type,
  Mic,
  ChevronLeft,
  Volume2,
  Loader2,
  type LucideIcon
} from 'lucide-react';

import { createClient } from '@/utils/supabase/client';
import MobileSubHeader from '@/components/dashboard/MobileSubHeader';
import HapticTrigger, { HapticHandle } from '@/components/ui/HapticTrigger';

// Mapa simple de string (columna materials.icon) → ícono lucide. Fallback: BookOpen.
const ICON_MAP: Record<string, LucideIcon> = {
    Headphones,
    Video,
    Map,
    Image: ImageIcon,
    ImageIcon,
    Gamepad2,
    Puzzle,
    CheckSquare,
    FileText,
    BookOpen,
    PlayCircle,
    Type,
    Mic,
    Volume2,
};

const resolveIcon = (name: string | null | undefined): LucideIcon =>
    (name && ICON_MAP[name]) || BookOpen;

// Metadatos visuales por categoría (conserva títulos, ícono de sección y paleta del diseño original).
const CATEGORY_META: Record<
    string,
    { title: string; icon: LucideIcon; palette: { color: string; bg: string }[] }
> = {
    pronunciacion: {
        title: 'Pronunciación y Letras',
        icon: Type,
        palette: [
            { color: 'text-pink-500', bg: 'bg-pink-50' },
            { color: 'text-rose-500', bg: 'bg-rose-50' },
            { color: 'text-indigo-500', bg: 'bg-indigo-50' },
        ],
    },
    listening: {
        title: 'Listening e Inmersión',
        icon: PlayCircle,
        palette: [
            { color: 'text-blue-500', bg: 'bg-blue-50' },
            { color: 'text-indigo-500', bg: 'bg-indigo-50' },
            { color: 'text-teal-500', bg: 'bg-teal-50' },
        ],
    },
    gramatica: {
        title: 'Gramática Visual',
        icon: ImageIcon,
        palette: [
            { color: 'text-purple-500', bg: 'bg-purple-50' },
            { color: 'text-fuchsia-500', bg: 'bg-fuchsia-50' },
        ],
    },
    juegos: {
        title: 'Práctica y Juegos',
        icon: Gamepad2,
        palette: [
            { color: 'text-orange-500', bg: 'bg-orange-50' },
            { color: 'text-yellow-500', bg: 'bg-yellow-50' },
            { color: 'text-green-500', bg: 'bg-green-50' },
        ],
    },
};

// Orden de las secciones tal como aparecían en el diseño original.
const CATEGORY_ORDER = ['pronunciacion', 'listening', 'gramatica', 'juegos'];

type MaterialRow = {
    id: string;
    category: string | null;
    title: string;
    type: string | null;
    required_level: string | null;
    url: string | null;
    icon: string | null;
    order_index: number;
};

type SectionItem = {
    id: string;
    title: string;
    icon: LucideIcon;
    href: string | null;
    color: string;
    bg: string;
};

type Section = {
    key: string;
    title: string;
    icon: LucideIcon;
    items: SectionItem[];
};

const parseBanda = (level: string | null | undefined): number => {
    if (!level) return 0;
    const n = parseInt(level.replace('Banda ', ''), 10);
    return Number.isNaN(n) ? 0 : n;
};

export default function MaterialesPage() {
    const hapticRef = useRef<HapticHandle>(null);

    const [sections, setSections] = useState<Section[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        const supabase = createClient();

        const load = async () => {
            // Nivel del alumno (para no mostrar materiales por encima de su banda).
            const { data: { user } } = await supabase.auth.getUser();
            let userBanda = 0;
            if (user) {
                const { data: userData } = await supabase
                    .from('users')
                    .select('english_level')
                    .eq('id', user.id)
                    .maybeSingle();
                userBanda = parseBanda(userData?.english_level);
            }

            const { data, error } = await supabase
                .from('materials')
                .select('*')
                .order('order_index');

            if (!active) return;

            if (error || !data) {
                setSections([]);
                setLoading(false);
                return;
            }

            const rows = (data as MaterialRow[]).filter((m) => {
                const req = parseBanda(m.required_level);
                // Sin requisito de nivel, o el alumno ya alcanzó la banda requerida.
                return req === 0 || userBanda >= req;
            });

            // Agrupar por categoría conservando el orden y la estética del diseño.
            const built: Section[] = CATEGORY_ORDER.map((key) => {
                const meta = CATEGORY_META[key];
                const items = rows
                    .filter((m) => m.category === key)
                    .map((m, idx): SectionItem => {
                        const palette = meta.palette[idx % meta.palette.length];
                        return {
                            id: m.id,
                            title: m.title,
                            icon: resolveIcon(m.icon),
                            href: m.url,
                            color: palette.color,
                            bg: palette.bg,
                        };
                    });
                return { key, title: meta.title, icon: meta.icon, items };
            }).filter((s) => s.items.length > 0);

            setSections(built);
            setLoading(false);
        };

        load();
        return () => { active = false; };
    }, []);

    const triggerHaptic = () => {
        hapticRef.current?.trigger();
    };

    return (
        <div className="flex flex-col w-full pb-32 bg-white">
            <HapticTrigger ref={hapticRef} />
            <MobileSubHeader />

            <div className="flex flex-col gap-12 px-4 pt-8 max-w-7xl mx-auto md:px-8">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                        <Loader2 className="w-10 h-10 text-[#632EB0] animate-spin mb-4" />
                        <p className="text-sm font-bold text-gray-400">Cargando materiales...</p>
                    </div>
                ) : sections.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                        <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 border border-purple-100">
                            <BookOpen className="w-8 h-8 text-[#632EB0]" />
                        </div>
                        <h3 className="text-lg font-black text-gray-900 mb-2">Aún no hay materiales disponibles</h3>
                        <p className="text-[14px] text-gray-400 font-bold max-w-sm">
                            Pronto encontrarás aquí recursos para practicar. Nuestro equipo académico está preparando contenido nuevo.
                        </p>
                    </div>
                ) : (
                    sections.map((section, idx) => (
                    <div key={section.key} data-tour={idx === 0 ? 'materiales' : undefined} className="flex flex-col gap-8">
                        {/* Title Section (Desktop Enhanced) */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-50 pb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center border border-purple-100 shadow-sm md:w-14 md:h-14">
                                    <section.icon className="w-6 h-6 text-[#632EB0]" />
                                </div>
                                <div className="flex flex-col">
                                    <h2 className="text-xl md:text-2xl font-black text-gray-900 uppercase tracking-tight">
                                        {section.title}
                                    </h2>
                                    <p className="hidden md:block text-sm text-gray-400 font-bold">
                                        {section.items.length} Recursos disponibles
                                    </p>
                                </div>
                            </div>

                            <Link href="#" className="hidden md:flex items-center gap-1 text-[#632EB0] font-black text-xs uppercase tracking-widest hover:underline">
                                Ver todos los recursos
                                <MousePointer2 className="w-3 h-3" />
                            </Link>
                        </div>

                        {/* RESPONSIVE LAYOUTS */}

                        {/* 1. MOBILE LAYOUT: Cubitos (2 Columns) */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:hidden">
                            {section.items.map((item) => {
                                const Icon = item.icon;
                                const tileClasses = "group w-full aspect-square bg-white border-2 border-[#e5e5e5] border-b-[8px] rounded-[2.5rem] flex items-center justify-center relative active:border-b-2 active:translate-y-1.5 transition-all shadow-sm active:bg-[#632EB0] active:border-[#632EB0] overflow-hidden";
                                const tileInner = (
                                    <>
                                        <div className={`w-16 h-16 ${item.bg} rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-active:scale-95 group-active:bg-white/20`}>
                                            <Icon className={`w-8 h-8 ${item.color} group-active:text-white transition-colors`} />
                                        </div>
                                        <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
                                    </>
                                );
                                return (
                                    <div key={item.id} className="flex flex-col items-center gap-4">
                                        {item.href ? (
                                            <Link
                                                href={item.href}
                                                onClick={triggerHaptic}
                                                className={tileClasses}
                                            >
                                                {tileInner}
                                            </Link>
                                        ) : (
                                            <div className={`${tileClasses} cursor-default`}>
                                                {tileInner}
                                            </div>
                                        )}
                                        <span className="text-[15px] font-black text-gray-700 text-center leading-tight px-2">
                                            {item.title}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* 2. PC LAYOUT: Modern Gallery Cards (4 Columns) */}
                        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {section.items.map((item) => {
                                const Icon = item.icon;
                                const cardClasses = "group relative flex flex-col p-6 bg-white border border-gray-100 rounded-[2rem] shadow-[0_10px_30px_rgba(0,0,0,0.02)] transition-all hover:shadow-[0_20px_60px_rgba(99,46,176,0.08)] hover:border-[#632EB0]/20 hover:-translate-y-1 overflow-hidden";
                                const cardInner = (
                                    <>
                                        <div className={`w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                            <Icon className={`w-6 h-6 ${item.color}`} />
                                        </div>

                                        <h3 className="text-[17px] font-black text-gray-900 mb-2 leading-tight">
                                            {item.title}
                                        </h3>
                                        <p className="text-xs text-gray-400 font-bold mb-6">
                                            Material interactivo para práctica individual.
                                        </p>

                                        <div className="mt-auto flex items-center gap-2 text-[#632EB0] text-xs font-black uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                                            Explorar
                                            <ChevronLeft className="w-3 h-3 rotate-180" />
                                        </div>

                                        {/* Background accent */}
                                        <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-[0.03] transition-transform group-hover:scale-150 ${item.bg}`}></div>
                                    </>
                                );
                                return item.href ? (
                                    <Link
                                        key={item.id}
                                        href={item.href}
                                        onClick={triggerHaptic}
                                        className={cardClasses}
                                    >
                                        {cardInner}
                                    </Link>
                                ) : (
                                    <div key={item.id} className={`${cardClasses} cursor-default`}>
                                        {cardInner}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    ))
                )}

                {/* Footer Informativo (Desktop Centered) */}
                {!loading && (
                <div className="mt-20 px-4">
                    <div className="max-w-xl mx-auto p-8 bg-purple-50 rounded-[2.5rem] border border-purple-100 text-center shadow-sm">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <BookOpen className="w-7 h-7 text-[#632EB0]" />
                        </div>
                        <h4 className="text-lg font-black text-purple-900 mb-2">Biblioteca en crecimiento</h4>
                        <p className="text-[14px] text-purple-800 font-bold opacity-70 leading-relaxed">
                            Nuestro equipo académico añade nuevos materiales interactivos todas las semanas.
                        </p>
                    </div>
                </div>
                )}
            </div>
        </div>
    );
}
