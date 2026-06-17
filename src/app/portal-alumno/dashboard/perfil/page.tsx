"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Flame,
    Zap,
    Trophy,
    ShieldCheck,
    Settings,
    ChevronRight,
    Sparkles,
    Clock,
    CreditCard,
    User,
    LogOut,
    Palette,
    Check,
    Loader2
} from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import HapticTrigger, { HapticHandle } from '@/components/ui/HapticTrigger';
import MobileSubHeader from '@/components/dashboard/MobileSubHeader';
import SuscripcionContent from '@/components/dashboard/SuscripcionContent';
import { createClient } from '@/utils/supabase/client';

type TabType = 'cuenta' | 'suscripcion' | 'preferencias';
type RankRow = { name: string; avatar: string; xp: number; rank: number; isUser: boolean };

// Cosméticos equipados que personalizan el perfil (antes hardcodeados a Steve / 'Aventurero Maestro').
type Equipped = {
    skin: string;          // nombre de skin de minotar (default 'Steve')
    frame: string | null;  // color hex del marco
    title: string | null;  // texto del título bajo el nombre
    nameColor: string | null; // color hex del nombre
};

// Una fila del inventario: user_cosmetics ⨝ cosmetic_catalog.
type CosmeticRow = {
    id: string;            // cosmetic_catalog.id (= p_id para equip_cosmetic)
    type: 'frame' | 'title' | 'name_color' | 'banner' | 'skin' | string;
    name: string;
    value: string | null;
};

const DEFAULT_SKIN = 'Steve';
const DEFAULT_TITLE = 'Aventurero Maestro';

// Etiqueta legible por tipo de cosmético (para agrupar la sección "Mis cosméticos").
const TYPE_LABEL: Record<string, string> = {
    skin: 'Skin',
    frame: 'Marco',
    title: 'Título',
    name_color: 'Color de nombre',
    banner: 'Banner',
};

export default function PerfilPage() {
    const supabase = createClient();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    // Cierra la sesión y vuelve al login.
    const handleLogout = async () => {
        setLoggingOut(true);
        try { await supabase.auth.signOut(); } catch { /* aún así navegamos al login */ }
        router.replace('/portal-alumno');
        router.refresh();
    };
    const [activeTab, setActiveTab] = useState<TabType>('cuenta');
    const hapticRef = useRef<HapticHandle>(null);
    const [userData, setUserData] = useState({ name: 'Cargando…', isPremium: false, renewalDate: 'Cargando...' });
    const [stats, setStats] = useState({ streak: 0, xp: 0, coins: 0, level: '—' });
    const [ranking, setRanking] = useState<RankRow[]>([]);
    // Cosméticos: lo equipado (para pintar el perfil) y el inventario (para la sección "Mis cosméticos").
    const [equipped, setEquipped] = useState<Equipped>({ skin: DEFAULT_SKIN, frame: null, title: null, nameColor: null });
    const [cosmetics, setCosmetics] = useState<CosmeticRow[]>([]);
    const [equipping, setEquipping] = useState<string | null>(null);

    // Respeta el ?tab= con el que enlaza el layout (p. ej. "Mi suscripción" -> ?tab=suscripcion).
    useEffect(() => {
        try {
            const t = new URLSearchParams(window.location.search).get('tab');
            if (t === 'cuenta' || t === 'suscripcion' || t === 'preferencias') setActiveTab(t);
        } catch { /* noop */ }
    }, []);

    // Carga el inventario de cosméticos (user_cosmetics ⨝ cosmetic_catalog) ordenado por catálogo.
    const loadCosmetics = useCallback(async (userId: string): Promise<CosmeticRow[]> => {
        const { data } = await supabase
            .from('user_cosmetics')
            .select('cosmetic_id, cosmetic_catalog(id, type, name, value, sort)')
            .eq('user_id', userId);
        type JoinRow = {
            cosmetic_id: string;
            cosmetic_catalog: { id: string; type: string; name: string; value: string | null; sort: number | null } | null;
        };
        const rows = ((data as JoinRow[] | null) ?? [])
            .map((r) => r.cosmetic_catalog)
            .filter((c): c is NonNullable<JoinRow['cosmetic_catalog']> => !!c)
            .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
            .map((c) => ({ id: c.id, type: c.type, name: c.name, value: c.value }));
        setCosmetics(rows);
        return rows;
    }, [supabase]);

    useEffect(() => {
        setMounted(true);
        let active = true;
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!active) return;
            if (!user) { setUserData((d) => ({ ...d, name: 'Estudiante' })); return; }
            // Consultas en paralelo (incluye las columnas de cosméticos equipados de users).
            const [profileR, subR, gR, lbR] = await Promise.all([
                supabase.from('users').select('full_name, english_level, equipped_skin, equipped_frame, equipped_title, equipped_name_color').eq('id', user.id).maybeSingle(),
                supabase.from('subscriptions').select('status, current_period_end').eq('user_id', user.id).in('status', ['active', 'trialing']).maybeSingle(),
                supabase.from('user_gamification').select('xp_total, level_number, coins, current_streak').eq('user_id', user.id).maybeSingle(),
                supabase.rpc('get_leaderboard'),
            ]);
            if (!active) return;
            const profile = profileR.data, sub = subR.data, g = gR.data, lb = lbR.data;
            setUserData({
                name: profile?.full_name || 'Estudiante',
                isPremium: !!sub,
                renewalDate: sub?.current_period_end ? new Date(sub.current_period_end).toLocaleDateString() : 'Proximamente',
            });
            setStats({
                streak: g?.current_streak ?? 0,
                xp: g?.xp_total ?? 0,
                coins: g?.coins ?? 0,
                level: profile?.english_level || `Nv ${g?.level_number ?? 1}`,
            });
            setEquipped({
                skin: profile?.equipped_skin || DEFAULT_SKIN,
                frame: profile?.equipped_frame ?? null,
                title: profile?.equipped_title ?? null,
                nameColor: profile?.equipped_name_color ?? null,
            });
            setRanking(((lb as Array<{ full_name: string; points: number; rank: number; is_me: boolean }> | null) ?? [])
                .slice(0, 5)
                .map((r) => ({
                    name: r.is_me ? `Tú (${r.full_name})` : r.full_name,
                    avatar: r.full_name,
                    xp: r.points,
                    rank: r.rank,
                    isUser: r.is_me,
                })));
            // Inventario de cosméticos (no bloquea el resto del perfil).
            loadCosmetics(user.id);
        };
        fetchData();
        return () => { active = false; };
    }, [supabase, loadCosmetics]);

    // Equipa un cosmético vía RPC y refleja el cambio en el perfil al instante.
    const handleEquip = async (c: CosmeticRow) => {
        if (equipping) return;
        setEquipping(c.id);
        hapticRef.current?.trigger();
        try {
            const { error } = await supabase.rpc('equip_cosmetic', { p_id: c.id });
            if (error) throw error;
            // Optimista: según el tipo, pinta el perfil con el value del cosmético recién equipado.
            setEquipped((prev) => {
                if (c.type === 'skin') return { ...prev, skin: c.value || DEFAULT_SKIN };
                if (c.type === 'frame') return { ...prev, frame: c.value };
                if (c.type === 'title') return { ...prev, title: c.value };
                if (c.type === 'name_color') return { ...prev, nameColor: c.value };
                return prev;
            });
        } catch {
            // Ante un fallo (RLS / no poseído), recarga desde el servidor para no dejar el UI mintiendo.
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase.from('users').select('equipped_skin, equipped_frame, equipped_title, equipped_name_color').eq('id', user.id).maybeSingle();
                if (data) setEquipped({
                    skin: data.equipped_skin || DEFAULT_SKIN,
                    frame: data.equipped_frame ?? null,
                    title: data.equipped_title ?? null,
                    nameColor: data.equipped_name_color ?? null,
                });
            }
        } finally {
            setEquipping(null);
        }
    };

    // ¿Está este cosmético actualmente equipado? (para mostrar el chip "Equipado").
    const isEquipped = (c: CosmeticRow): boolean => {
        if (c.type === 'skin') return (equipped.skin || DEFAULT_SKIN) === (c.value || DEFAULT_SKIN);
        if (c.type === 'frame') return !!c.value && equipped.frame === c.value;
        if (c.type === 'title') return !!c.value && equipped.title === c.value;
        if (c.type === 'name_color') return !!c.value && equipped.nameColor === c.value;
        return false;
    };

    if (!mounted) return null;

    const navItems = [
        { name: "Cuenta", id: 'cuenta' as TabType, icon: User },
        { name: "Suscripcion", id: 'suscripcion' as TabType, icon: CreditCard },
        { name: "Preferencias", id: 'preferencias' as TabType, icon: Settings },
    ];

    // Estilos derivados de lo equipado.
    const frameColor = equipped.frame || '#ffffff';          // color del marco (borde de la tarjeta del avatar)
    const titleText = equipped.title || DEFAULT_TITLE;       // título bajo el nombre
    const nameColorStyle = equipped.nameColor ? { color: equipped.nameColor } : undefined; // color del nombre

    return (
        <div className="w-full min-h-screen bg-white">
            <HapticTrigger ref={hapticRef} />
            <div className="md:hidden"><MobileSubHeader hideNav={true} /></div>

            {/* Layout Wrapper CENTERED */}
            <div className="max-w-[1400px] mx-auto w-full flex flex-col md:flex-row gap-8 lg:gap-20 pt-4 md:pt-14 px-4 md:px-12">

                {/* --- SIDEBAR --- */}
                <aside className="hidden md:flex flex-col gap-4 w-72 shrink-0 sticky top-32 h-fit">
                    <div className="bg-gray-50/50 p-4 rounded-[2.5rem] border border-gray-100 flex flex-col gap-3 shadow-sm">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => { setActiveTab(item.id); hapticRef.current?.trigger(); }}
                                className={`flex items-center gap-4 p-4 rounded-[1.8rem] transition-all duration-300 ${activeTab === item.id ? 'bg-gray-200/80 shadow-inner' : 'hover:bg-gray-100/50'}`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activeTab === item.id ? 'bg-gray-300' : 'bg-gray-200/50'}`}><item.icon className="w-5 h-5" /></div>
                                <span className={`text-[15px] font-black ${activeTab === item.id ? 'text-gray-900' : 'text-gray-500'}`}>{item.name}</span>
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="bg-gray-50/50 p-4 rounded-[2.5rem] border border-gray-100 flex items-center gap-4 hover:bg-red-50 transition-all shadow-sm disabled:opacity-50"
                    >
                        <div className="w-10 h-10 rounded-full bg-red-100/70 flex items-center justify-center"><LogOut className="w-5 h-5 text-red-500" /></div>
                        <span className="text-[15px] font-black text-red-500">{loggingOut ? 'Cerrando sesión…' : 'Cerrar sesión'}</span>
                    </button>
                </aside>

                {/* --- CONTENT CENTERED IN FLEX --- */}
                <div className="flex-1 flex justify-center pb-32">
                    <div className="w-full max-w-3xl">
                        <AnimatePresence mode="wait">
                            {activeTab === 'cuenta' && (
                                <motion.div key="cuenta" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12">
                                    {/* IDENTITY */}
                                    <div className="flex flex-col items-center">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-purple-200/40 rounded-full blur-3xl opacity-50 scale-150"></div>
                                            {/* El MARCO se pinta con equipped_frame (color del borde). */}
                                            <div
                                                className="w-44 h-44 md:w-56 md:h-56 rounded-[4rem] bg-white p-2 shadow-2xl relative z-10 overflow-hidden transition-colors"
                                                style={{ borderWidth: 4, borderStyle: 'solid', borderColor: frameColor }}
                                            >
                                                {/* El AVATAR usa equipped_skin (skin de minotar; default 'Steve'). */}
                                                <div className="w-full h-full bg-gradient-to-b from-gray-50 to-white rounded-[3.5rem] flex items-center justify-center p-6">
                                                    <img
                                                        src={`https://minotar.net/armor/bust/${encodeURIComponent(equipped.skin || DEFAULT_SKIN)}/300.png`}
                                                        alt="Avatar"
                                                        className="w-full h-full drop-shadow-2xl"
                                                    />
                                                </div>
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 z-20"><div className="bg-yellow-400 p-2.5 rounded-2xl border-4 border-white"><ShieldCheck className="w-6 h-6 text-[#5e4171]" /></div></div>
                                        </div>
                                        <div className="mt-8 text-center space-y-1">
                                            {/* El COLOR del nombre usa equipped_name_color. */}
                                            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter uppercase" style={nameColorStyle}>{userData.name}</h1>
                                            {/* El TÍTULO usa equipped_title (default 'Aventurero Maestro'). */}
                                            <span className="px-5 py-1.5 rounded-full bg-purple-100/60 text-[#815a9b] text-[11px] font-black uppercase tracking-widest">{titleText}</span>
                                        </div>
                                    </div>

                                    {/* STATS */}
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                        {[{ label: "Racha", val: String(stats.streak), icon: Flame, color: "text-orange-500" }, { label: "XP", val: stats.xp.toLocaleString(), icon: Zap, color: "text-yellow-500" }, { label: "Nivel", val: stats.level, icon: Trophy, color: "text-[#815a9b]" }, { label: "Monedas", val: String(stats.coins), icon: Sparkles, color: "text-yellow-600" }].map((s, i) => (
                                            <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col items-center gap-2">
                                                <s.icon className={`w-6 h-6 ${s.color}`} />
                                                <span className="text-2xl font-black text-gray-900 tracking-tighter">{s.val}</span>
                                                <span className="text-[9px] font-black uppercase text-gray-300 tracking-widest">{s.label}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* MIS COSMÉTICOS — inventario equipable (user_cosmetics ⨝ cosmetic_catalog). */}
                                    <div className="bg-white rounded-[3.5rem] p-8 md:p-10 border border-gray-100 shadow-sm">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#815a9b] to-[#5e4171] flex items-center justify-center shadow-lg"><Palette className="w-6 h-6 text-white" /></div>
                                            <div>
                                                <span className="text-[10px] font-black text-[#815a9b] uppercase tracking-widest">Personaliza tu perfil</span>
                                                <h3 className="text-2xl font-black text-gray-900 tracking-tighter">Mis cosméticos</h3>
                                            </div>
                                        </div>

                                        {cosmetics.length === 0 ? (
                                            <p className="text-center text-gray-400 font-bold py-8 text-sm">Aún no tienes cosméticos. ¡Sube de liga y visita la tienda para conseguirlos! 🎨</p>
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {cosmetics.map((c) => {
                                                    const active = isEquipped(c);
                                                    const busy = equipping === c.id;
                                                    return (
                                                        <div
                                                            key={c.id}
                                                            className={`flex items-center justify-between gap-3 p-4 rounded-[2rem] border transition-all ${active ? 'border-[#815a9b] bg-purple-50/40' : 'border-gray-100 bg-white'}`}
                                                        >
                                                            <div className="flex items-center gap-3 min-w-0">
                                                                {/* Vista previa: muestra el color para frame/name_color; icono para el resto. */}
                                                                {(c.type === 'frame' || c.type === 'name_color') && c.value ? (
                                                                    <span
                                                                        className="w-9 h-9 rounded-xl shrink-0 border-2 border-white shadow-inner"
                                                                        style={{ backgroundColor: c.value }}
                                                                    />
                                                                ) : c.type === 'skin' ? (
                                                                    <img
                                                                        src={`https://minotar.net/avatar/${encodeURIComponent(c.value || DEFAULT_SKIN)}/60.png`}
                                                                        alt={c.name}
                                                                        className="w-9 h-9 rounded-xl shrink-0 bg-gray-100 p-0.5"
                                                                    />
                                                                ) : (
                                                                    <span className="w-9 h-9 rounded-xl shrink-0 bg-gray-100 flex items-center justify-center"><Sparkles className="w-4 h-4 text-[#815a9b]" /></span>
                                                                )}
                                                                <div className="min-w-0">
                                                                    <p className="text-[14px] font-black text-gray-900 tracking-tight truncate">{c.name}</p>
                                                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-300">{TYPE_LABEL[c.type] ?? c.type}</p>
                                                                </div>
                                                            </div>

                                                            {active ? (
                                                                <span className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#815a9b] text-white text-[11px] font-black uppercase tracking-widest">
                                                                    <Check className="w-3.5 h-3.5" /> Equipado
                                                                </span>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleEquip(c)}
                                                                    disabled={busy}
                                                                    className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#88e04f] text-[#1f3d12] text-[11px] font-black uppercase tracking-widest hover:brightness-105 active:scale-95 transition-all disabled:opacity-60"
                                                                >
                                                                    {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                                                                    {busy ? 'Equipando…' : 'Equipar'}
                                                                </button>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    {/* REPORTE PARA PADRES */}
                                    <a href="/portal-alumno/dashboard/reporte" className="bg-white rounded-[3rem] p-8 border border-gray-100 shadow-sm flex items-center justify-between cursor-pointer group">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 bg-gradient-to-br from-[#88e04f] to-[#5bbf2e] rounded-3xl flex items-center justify-center shadow-lg"><Trophy className="w-8 h-8 text-white" /></div>
                                            <div>
                                                <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">Para tutores</span>
                                                <h3 className="text-xl font-black text-gray-900 tracking-tight">Reporte de progreso</h3>
                                                <p className="text-[11px] text-gray-400 font-bold mt-1">Resumen imprimible del avance del alumno</p>
                                            </div>
                                        </div>
                                        <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-green-50 transition-all"><ChevronRight className="w-5 h-5 text-gray-300" /></div>
                                    </a>

                                    {/* SUB CARD */}
                                    <div onClick={() => setActiveTab('suscripcion')} className="bg-white rounded-[3rem] p-8 border border-gray-100 shadow-sm flex items-center justify-between cursor-pointer group">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 bg-gradient-to-br from-[#815a9b] to-[#5e4171] rounded-3xl flex items-center justify-center shadow-lg"><ShieldCheck className="w-8 h-8 text-white" /></div>
                                            <div>
                                                <span className="text-[10px] font-black text-[#815a9b] uppercase tracking-widest">Suscripción Activa</span>
                                                <h3 className="text-xl font-black text-gray-900 tracking-tight">Plan Aventurero</h3>
                                                <div className="flex items-center gap-1.5 text-gray-400 text-[11px] font-bold mt-1"><Clock className="w-3.5 h-3.5" /><span>Renueva el {userData.renewalDate}</span></div>
                                            </div>
                                        </div>
                                        <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-purple-50 transition-all"><ChevronRight className="w-5 h-5 text-gray-300" /></div>
                                    </div>

                                    {/* RANKING */}
                                    <div className="bg-white rounded-[3.5rem] p-10 border border-gray-100 shadow-sm">
                                        <div className="flex items-center justify-between mb-8">
                                            <h3 className="text-2xl font-black text-gray-900 tracking-tighter">Rankin Semanal</h3>
                                            <div className="px-4 py-2 bg-gray-50 rounded-full font-black text-[11px] text-gray-400">2d 14h</div>
                                        </div>
                                        <div className="space-y-2">
                                            {ranking.length === 0 && (
                                                <p className="text-center text-gray-400 font-bold py-6 text-sm">Aún no hay puntos esta semana. ¡Completa lecciones para subir! 🏆</p>
                                            )}
                                            {ranking.map((u) => (
                                                <div key={u.rank} className={`flex items-center justify-between p-4 rounded-[2rem] ${u.isUser ? 'bg-purple-50/40 border-2 border-purple-100' : ''}`}>
                                                    <div className="flex items-center gap-5">
                                                        <span className="w-4 text-center font-black text-gray-300">{u.rank}</span>
                                                        <img src={`https://minotar.net/avatar/${u.avatar}/60.png`} className="w-11 h-11 rounded-xl bg-gray-100 p-1" />
                                                        <span className={`font-black tracking-tight ${u.isUser ? 'text-[#815a9b]' : 'text-gray-900'}`}>{u.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-4"><Zap className="w-4 h-4 text-yellow-500" fill="currentColor" /><span className="font-black text-gray-900">{u.xp.toLocaleString()}</span></div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    {/* CERRAR SESIÓN (visible también en móvil) */}
                                    <button
                                        onClick={handleLogout}
                                        disabled={loggingOut}
                                        className="w-full flex items-center justify-center gap-3 py-4 rounded-[2rem] bg-red-50 text-red-600 font-black hover:bg-red-100 transition-all disabled:opacity-50"
                                    >
                                        <LogOut className="w-5 h-5" /> {loggingOut ? 'Cerrando sesión…' : 'Cerrar sesión'}
                                    </button>
                                </motion.div>
                            )}
                            {activeTab === 'suscripcion' && (
                                <motion.div key="suscripcion" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                    <SuscripcionContent isPremium={userData.isPremium} renewalDate={userData.renewalDate} userName={userData.name} />
                                </motion.div>
                            )}
                            {activeTab === 'preferencias' && (
                                <motion.div key="prefs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white rounded-[3rem] p-12 border border-gray-100 shadow-sm flex flex-col items-center text-center">
                                    <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-4">Preferencias</h3>
                                    <p className="text-gray-400 font-bold mb-8">Configura tu experiencia en Ludora.</p>
                                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center"><Settings className="w-10 h-10 text-gray-300" /></div>
                                    <button
                                        onClick={handleLogout}
                                        disabled={loggingOut}
                                        className="mt-8 inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-red-50 text-red-600 font-black hover:bg-red-100 transition-all disabled:opacity-50"
                                    >
                                        <LogOut className="w-5 h-5" /> {loggingOut ? 'Cerrando sesión…' : 'Cerrar sesión'}
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
