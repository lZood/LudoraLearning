"use client";

// =============================================================================
// TIENDA + INVENTARIO (móvil-first, temática Minecraft)
//  - Lista cosmetic_catalog comprables (price_coins > 0) en grid.
//  - Comprar  -> supabase.rpc('purchase_cosmetic', { p_id })
//  - Equipar  -> supabase.rpc('equip_cosmetic',  { p_id })   (lo ya poseído)
//  - Saldo de monedas vía useGamification (con override local optimista tras comprar).
//  - Manejo de errores: sin saldo / bloqueado por liga / ya comprado.
//  - Marca lo que el usuario ya posee (user_cosmetics) como "Equipar".
//  Escrituras sensibles van por RPC SECURITY DEFINER (la página solo lee catálogos/inventario).
// =============================================================================

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Coins,
    Lock,
    Check,
    ShoppingBag,
    Sparkles,
    Frame,
    Palette,
    Crown,
    Shirt,
    Image as ImageIcon,
    Loader2,
    X,
    AlertTriangle,
    ShieldCheck,
} from 'lucide-react';
import HapticTrigger, { HapticHandle } from '@/components/ui/HapticTrigger';
import MobileSubHeader from '@/components/dashboard/MobileSubHeader';
import { createClient } from '@/utils/supabase/client';
import { useGamification } from '@/lib/useGamification';

// --- Tipos del catálogo (espejo de cosmetic_catalog) ---
type CosmeticType = 'frame' | 'title' | 'name_color' | 'banner' | 'skin';

type CatalogRow = {
    id: string;
    type: CosmeticType;
    name: string;
    value: string | null;
    price_coins: number;
    required_league_tier: number | null;
    season: string | null;
    sort: number;
};

// --- Estado por tarjeta (para feedback puntual al comprar/equipar) ---
type ActionState = { id: string; kind: 'buying' | 'equipping' } | null;

// --- Toast simple (éxito / error accionable) ---
type Toast = { kind: 'ok' | 'err'; msg: string } | null;

// Etiquetas e iconos por tipo de cosmético.
const TYPE_META: Record<CosmeticType, { label: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; tint: string }> = {
    frame: { label: 'Marco', icon: Frame, tint: 'text-amber-500' },
    name_color: { label: 'Color de nombre', icon: Palette, tint: 'text-sky-500' },
    title: { label: 'Título', icon: Crown, tint: 'text-yellow-500' },
    skin: { label: 'Skin', icon: Shirt, tint: 'text-emerald-500' },
    banner: { label: 'Estandarte', icon: ImageIcon, tint: 'text-purple-500' },
};

// Nombre de la liga por tier (para el candado "Necesitas la liga X").
const TIER_NAME: Record<number, string> = {
    1: 'Madera',
    2: 'Piedra',
    3: 'Hierro',
    4: 'Oro',
    5: 'Esmeralda',
    6: 'Diamante',
    7: 'Netherite',
};

// Escudo de Obsidiana: consumible anti-descenso (espejo de buy_shield()).
const SHIELD_COST = 200;
const SHIELD_MAX = 2;

// Traduce los RAISE del RPC a mensajes accionables y amables.
function humanizeError(raw: string | undefined): string {
    const m = (raw ?? '').toLowerCase();
    if (m.includes('shield_max') || m.includes('max')) {
        return `Ya tienes el máximo de escudos (${SHIELD_MAX}). ¡Úsalos manteniendo tu liga!`;
    }
    if (m.includes('insufficient') || m.includes('saldo') || m.includes('coins')) {
        return 'No tienes suficientes monedas. ¡Completa lecciones para ganar más!';
    }
    if (m.includes('league') || m.includes('tier') || m.includes('liga') || m.includes('locked') || m.includes('bloque')) {
        return 'Aún no alcanzas la liga necesaria para este cosmético.';
    }
    if (m.includes('already') || m.includes('duplicate') || m.includes('ya') || m.includes('owned') || m.includes('unique')) {
        return 'Ya tienes este cosmético en tu inventario.';
    }
    return 'No se pudo completar la acción. Inténtalo de nuevo.';
}

export default function TiendaPage() {
    const supabase = useMemo(() => createClient(), []);
    const g = useGamification(); // xp, level, coins, streak
    const hapticRef = useRef<HapticHandle>(null);

    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [catalog, setCatalog] = useState<CatalogRow[]>([]);
    const [owned, setOwned] = useState<Set<string>>(new Set());
    const [userTier, setUserTier] = useState<number>(1); // tier_order de la liga actual del usuario
    const [equipped, setEquipped] = useState<Set<string>>(new Set()); // cosméticos actualmente equipados
    const [action, setAction] = useState<ActionState>(null);
    const [toast, setToast] = useState<Toast>(null);

    // Escudos de Obsidiana que el alumno ya posee (consumibles anti-descenso).
    const [shields, setShields] = useState(0);
    const [buyingShield, setBuyingShield] = useState(false);

    // Saldo: el real del hook, pero con override optimista tras una compra (el hook cachea a nivel módulo).
    const [coinsOverride, setCoinsOverride] = useState<number | null>(null);
    const coins = coinsOverride ?? g?.coins ?? 0;

    const triggerHaptic = () => hapticRef.current?.trigger();

    // Auto-oculta el toast.
    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 3800);
        return () => clearTimeout(t);
    }, [toast]);

    // Carga inicial: catálogo comprable + inventario propio + tier de la liga + equipados.
    useEffect(() => {
        setMounted(true);
        let active = true;
        (async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!active) return;

                // Catálogo comprable y, en paralelo, datos del usuario (si hay sesión).
                const catalogP = supabase
                    .from('cosmetic_catalog')
                    .select('id, type, name, value, price_coins, required_league_tier, season, sort')
                    .gt('price_coins', 0)
                    .order('sort', { ascending: true });

                const ownedP = user
                    ? supabase.from('user_cosmetics').select('cosmetic_id').eq('user_id', user.id)
                    : Promise.resolve({ data: [] as { cosmetic_id: string }[] });

                const profileP = user
                    ? supabase
                        .from('users')
                        .select('current_league_id, equipped_frame, equipped_title, equipped_name_color, equipped_skin')
                        .eq('id', user.id)
                        .maybeSingle()
                    : Promise.resolve({ data: null });

                const [catalogR, ownedR, profileR] = await Promise.all([catalogP, ownedP, profileP]);
                if (!active) return;

                setCatalog(((catalogR.data as CatalogRow[] | null) ?? []));
                setOwned(new Set(((ownedR.data as { cosmetic_id: string }[] | null) ?? []).map((r) => r.cosmetic_id)));

                // La liga actual del usuario vive en user_gamification.current_league_id (FK a leagues).
                // Resolvemos su tier_order para evaluar bloqueos por liga.
                if (user) {
                    const { data: gd } = await supabase
                        .from('user_gamification')
                        .select('current_league_id, league_shields')
                        .eq('user_id', user.id)
                        .maybeSingle();
                    const gRow = gd as { current_league_id: string | null; league_shields: number | null } | null;
                    if (active) setShields(gRow?.league_shields ?? 0);
                    const leagueId = gRow?.current_league_id ?? null;
                    if (active && leagueId) {
                        const { data: lg } = await supabase
                            .from('leagues')
                            .select('tier_order')
                            .eq('id', leagueId)
                            .maybeSingle();
                        if (active) setUserTier((lg as { tier_order: number } | null)?.tier_order ?? 1);
                    }
                }

                // Marca lo equipado (para distinguir "Equipar" de "Equipado").
                const prof = profileR.data as
                    | { equipped_frame: string | null; equipped_title: string | null; equipped_name_color: string | null; equipped_skin: string | null }
                    | null;
                if (prof) {
                    const eqValues = new Set(
                        [prof.equipped_frame, prof.equipped_title, prof.equipped_name_color, prof.equipped_skin].filter(
                            (v): v is string => !!v,
                        ),
                    );
                    // Mapea valores equipados a ids del catálogo (value === equipped_*).
                    const cat = (catalogR.data as CatalogRow[] | null) ?? [];
                    const eqIds = new Set(cat.filter((c) => c.value && eqValues.has(c.value)).map((c) => c.id));
                    if (active) setEquipped(eqIds);
                }
            } catch {
                /* silencioso: el catálogo es público; si algo falla mostramos estado vacío */
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => {
            active = false;
        };
    }, [supabase]);

    // Comprar un cosmético: RPC purchase_cosmetic. Actualiza saldo + inventario en éxito.
    const handleBuy = async (item: CatalogRow) => {
        if (action) return;
        triggerHaptic();
        // Bloqueos del lado cliente (UX); el RPC es la fuente de verdad.
        if (owned.has(item.id)) return;
        if (item.required_league_tier && userTier < item.required_league_tier) {
            setToast({ kind: 'err', msg: `Necesitas la Liga ${TIER_NAME[item.required_league_tier] ?? item.required_league_tier} para esto.` });
            return;
        }
        if (coins < item.price_coins) {
            setToast({ kind: 'err', msg: 'No tienes suficientes monedas. ¡Completa lecciones para ganar más!' });
            return;
        }

        setAction({ id: item.id, kind: 'buying' });
        try {
            const { data, error } = await supabase.rpc('purchase_cosmetic', { p_id: item.id });
            if (error) {
                setToast({ kind: 'err', msg: humanizeError(error.message) });
                return;
            }
            // purchase_cosmetic devuelve la fila user_gamification (saldo nuevo).
            const newCoins = (data as { coins?: number } | null)?.coins;
            if (typeof newCoins === 'number') setCoinsOverride(newCoins);
            else setCoinsOverride(coins - item.price_coins);
            setOwned((prev) => new Set(prev).add(item.id));
            setToast({ kind: 'ok', msg: `¡Compraste ${item.name}! Ya está en tu inventario.` });
        } catch (e) {
            setToast({ kind: 'err', msg: humanizeError(e instanceof Error ? e.message : undefined) });
        } finally {
            setAction(null);
        }
    };

    // Equipar un cosmético ya poseído: RPC equip_cosmetic.
    const handleEquip = async (item: CatalogRow) => {
        if (action) return;
        triggerHaptic();
        setAction({ id: item.id, kind: 'equipping' });
        try {
            const { error } = await supabase.rpc('equip_cosmetic', { p_id: item.id });
            if (error) {
                setToast({ kind: 'err', msg: humanizeError(error.message) });
                return;
            }
            // Solo puede haber un cosmético equipado por tipo: limpia los del mismo tipo, equipa éste.
            setEquipped((prev) => {
                const next = new Set<string>();
                prev.forEach((eid) => {
                    const other = catalog.find((c) => c.id === eid);
                    if (other && other.type !== item.type) next.add(eid);
                });
                next.add(item.id);
                return next;
            });
            setToast({ kind: 'ok', msg: `Equipaste ${item.name}.` });
        } catch (e) {
            setToast({ kind: 'err', msg: humanizeError(e instanceof Error ? e.message : undefined) });
        } finally {
            setAction(null);
        }
    };

    // Comprar un Escudo de Obsidiana: RPC buy_shield (sumidero de monedas, máx 2).
    const handleBuyShield = async () => {
        if (buyingShield || action) return;
        triggerHaptic();
        if (shields >= SHIELD_MAX) {
            setToast({ kind: 'err', msg: `Ya tienes el máximo de escudos (${SHIELD_MAX}).` });
            return;
        }
        if (coins < SHIELD_COST) {
            setToast({ kind: 'err', msg: 'No tienes suficientes monedas. ¡Completa lecciones para ganar más!' });
            return;
        }
        setBuyingShield(true);
        try {
            const { data, error } = await supabase.rpc('buy_shield');
            if (error) {
                setToast({ kind: 'err', msg: humanizeError(error.message) });
                return;
            }
            // buy_shield devuelve la fila user_gamification (saldo + escudos nuevos).
            const row = data as { coins?: number; league_shields?: number } | null;
            if (typeof row?.coins === 'number') setCoinsOverride(row.coins);
            else setCoinsOverride(coins - SHIELD_COST);
            setShields(typeof row?.league_shields === 'number' ? row.league_shields : shields + 1);
            setToast({ kind: 'ok', msg: '¡Conseguiste un Escudo de Obsidiana! Absorberá un descenso de liga.' });
        } catch (e) {
            setToast({ kind: 'err', msg: humanizeError(e instanceof Error ? e.message : undefined) });
        } finally {
            setBuyingShield(false);
        }
    };

    if (!mounted) return null;

    return (
        <div className="w-full min-h-screen bg-white pb-32">
            <HapticTrigger ref={hapticRef} />

            {/* Header móvil fijo */}
            <MobileSubHeader hideNav={true} />

            {/* Toast accionable */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className="fixed top-24 md:top-24 left-1/2 -translate-x-1/2 z-[200] w-[92%] max-w-md"
                    >
                        <div
                            className={`flex items-center gap-3 px-5 py-4 rounded-[1.8rem] shadow-2xl border-2 ${
                                toast.kind === 'ok'
                                    ? 'bg-[#88e04f] border-[#6fc23a] text-white'
                                    : 'bg-red-50 border-red-200 text-red-700'
                            }`}
                        >
                            {toast.kind === 'ok' ? (
                                <Check className="w-5 h-5 shrink-0" strokeWidth={3} />
                            ) : (
                                <AlertTriangle className="w-5 h-5 shrink-0" />
                            )}
                            <span className="text-[13px] font-black leading-tight flex-1">{toast.msg}</span>
                            <button onClick={() => setToast(null)} aria-label="Cerrar" className="shrink-0 opacity-70 hover:opacity-100">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="w-full max-w-4xl mx-auto px-4 md:px-8">
                {/* 1. CABECERA: título + saldo de monedas */}
                <div className="pt-8 md:pt-14 flex flex-col items-center text-center gap-5">
                    <div className="w-16 h-16 rounded-[1.8rem] bg-gradient-to-br from-[#632EB0] to-[#4a2186] flex items-center justify-center shadow-lg shadow-purple-200">
                        <ShoppingBag className="w-8 h-8 text-white" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter uppercase leading-none">
                            Tienda
                        </h1>
                        <p className="text-sm font-bold text-gray-400 max-w-md mx-auto leading-tight">
                            Personaliza tu perfil con marcos, títulos y colores. Gasta tus monedas ganadas aprendiendo.
                        </p>
                    </div>

                    {/* Saldo de monedas */}
                    <div className="inline-flex items-center gap-2.5 px-6 py-3 bg-yellow-50 border-2 border-yellow-200 rounded-full shadow-inner">
                        <Coins className="w-5 h-5 text-yellow-500" fill="currentColor" />
                        <span className="text-xl font-black text-yellow-700 tracking-tighter">{coins.toLocaleString('es-MX')}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-yellow-500/80">Monedas</span>
                    </div>
                </div>

                {/* 1.5 ESCUDO DE OBSIDIANA — consumible destacado anti-descenso */}
                {!loading && (
                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8 md:mt-10 relative overflow-hidden rounded-[2rem] border-2 border-[#3a2a5c] bg-gradient-to-br from-[#1e1530] via-[#2a1d44] to-[#3a2a5c] p-5 md:p-6 shadow-xl shadow-purple-900/20"
                    >
                        {/* Textura sutil de bloques (obsidiana) */}
                        <div
                            className="absolute inset-0 opacity-[0.07] pointer-events-none"
                            style={{
                                backgroundImage:
                                    'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                                backgroundSize: '22px 22px',
                            }}
                        />
                        <div className="relative flex items-center gap-4 md:gap-5">
                            {/* Icono escudo */}
                            <div className="shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-[1.4rem] bg-gradient-to-br from-[#7c4dff] to-[#632EB0] flex items-center justify-center shadow-lg shadow-purple-900/40 border-2 border-[#9d7bff]/40">
                                <ShieldCheck className="w-9 h-9 md:w-11 md:h-11 text-white" strokeWidth={2.5} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="text-lg md:text-xl font-black text-white tracking-tight leading-none">
                                        Escudo de Obsidiana
                                    </h3>
                                    {/* Escudos poseídos: pips X/2 */}
                                    <span className="inline-flex items-center gap-1">
                                        {Array.from({ length: SHIELD_MAX }).map((_, i) => (
                                            <ShieldCheck
                                                key={i}
                                                className={`w-3.5 h-3.5 ${i < shields ? 'text-[#a586ff]' : 'text-white/20'}`}
                                                fill={i < shields ? 'currentColor' : 'none'}
                                                strokeWidth={2.5}
                                            />
                                        ))}
                                    </span>
                                </div>
                                <p className="mt-1.5 text-[12px] md:text-[13px] font-bold text-purple-200/80 leading-snug">
                                    Absorbe un descenso de liga. Si una semana no llegas a tu meta, tu escudo te
                                    protege y mantienes tu liga. Máx. {SHIELD_MAX}.
                                </p>
                            </div>
                        </div>

                        {/* Acción de compra */}
                        <button
                            onClick={handleBuyShield}
                            disabled={buyingShield || shields >= SHIELD_MAX || coins < SHIELD_COST}
                            className={`relative mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-[13px] font-black uppercase tracking-wide transition-all active:scale-[0.98] disabled:active:scale-100 ${
                                shields >= SHIELD_MAX
                                    ? 'bg-white/10 text-purple-200/60 cursor-default'
                                    : coins < SHIELD_COST
                                      ? 'bg-white/10 text-purple-200/40 cursor-not-allowed'
                                      : 'bg-[#88e04f] text-[#1e1530] hover:bg-[#7ad043] shadow-lg shadow-green-900/30'
                            }`}
                        >
                            {buyingShield ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : shields >= SHIELD_MAX ? (
                                <>
                                    <Check className="w-4 h-4" strokeWidth={3} /> Tienes el máximo
                                </>
                            ) : (
                                <>
                                    <Coins className="w-4 h-4" fill="currentColor" />
                                    {SHIELD_COST.toLocaleString('es-MX')} · Comprar escudo
                                </>
                            )}
                        </button>
                    </motion.div>
                )}

                {/* 2. GRID DE PRODUCTOS */}
                <div className="mt-10 md:mt-14">
                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="h-52 rounded-[2rem] bg-gray-50 border border-gray-100 animate-pulse" />
                            ))}
                        </div>
                    ) : catalog.length === 0 ? (
                        <div className="text-center py-20 text-gray-400 font-bold flex flex-col items-center gap-4">
                            <Sparkles className="w-10 h-10 text-gray-200" />
                            La tienda está vacía por ahora. ¡Vuelve pronto!
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                            {catalog.map((item, i) => {
                                const meta = TYPE_META[item.type] ?? TYPE_META.banner;
                                const Icon = meta.icon;
                                const isOwned = owned.has(item.id);
                                const isEquipped = equipped.has(item.id);
                                const lockedByLeague = !!item.required_league_tier && userTier < item.required_league_tier;
                                const cantAfford = !isOwned && coins < item.price_coins;
                                const busy = action?.id === item.id;
                                // Color de muestra para name_color / frame (value es hex en esos tipos).
                                const swatch = (item.type === 'name_color' || item.type === 'frame') && item.value ? item.value : null;

                                return (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: Math.min(i * 0.04, 0.4) }}
                                        className={`relative flex flex-col rounded-[2rem] border-2 p-4 transition-all ${
                                            isEquipped
                                                ? 'border-[#88e04f] bg-green-50/40 shadow-md shadow-green-100'
                                                : isOwned
                                                  ? 'border-purple-200 bg-purple-50/30'
                                                  : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-md'
                                        }`}
                                    >
                                        {/* Badge de tipo */}
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-50 border border-gray-100 text-[9px] font-black uppercase tracking-widest text-gray-400">
                                                <Icon className={`w-3 h-3 ${meta.tint}`} />
                                                {meta.label}
                                            </span>
                                            {isEquipped && (
                                                <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-[#6fc23a]">
                                                    <Check className="w-3 h-3" strokeWidth={3} /> Equipado
                                                </span>
                                            )}
                                        </div>

                                        {/* Vista previa */}
                                        <div className="flex-1 flex items-center justify-center py-4">
                                            <div
                                                className="w-20 h-20 rounded-[1.6rem] flex items-center justify-center shadow-inner relative overflow-hidden"
                                                style={
                                                    swatch
                                                        ? { backgroundColor: `${swatch}22`, border: `3px solid ${swatch}` }
                                                        : { backgroundColor: '#f9fafb', border: '3px solid #f3f4f6' }
                                                }
                                            >
                                                {item.type === 'name_color' && item.value ? (
                                                    <span className="text-lg font-black tracking-tight" style={{ color: item.value }}>
                                                        Aa
                                                    </span>
                                                ) : (
                                                    <Icon className={`w-9 h-9 ${swatch ? '' : meta.tint}`} style={swatch ? { color: swatch } : undefined} />
                                                )}
                                            </div>
                                        </div>

                                        {/* Nombre */}
                                        <h3 className="text-[13px] font-black text-gray-900 tracking-tight leading-tight text-center mb-2 min-h-[2.4em] flex items-center justify-center">
                                            {item.name}
                                        </h3>

                                        {/* Acción */}
                                        {isOwned ? (
                                            <button
                                                onClick={() => handleEquip(item)}
                                                disabled={busy || isEquipped}
                                                className={`w-full flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-[12px] font-black uppercase tracking-wide transition-all active:scale-95 disabled:active:scale-100 ${
                                                    isEquipped
                                                        ? 'bg-green-100 text-[#6fc23a] cursor-default'
                                                        : 'bg-[#632EB0] text-white hover:bg-[#56279a] shadow-sm shadow-purple-200'
                                                }`}
                                            >
                                                {busy && action?.kind === 'equipping' ? (
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                ) : isEquipped ? (
                                                    <>
                                                        <Check className="w-3.5 h-3.5" strokeWidth={3} /> Equipado
                                                    </>
                                                ) : (
                                                    'Equipar'
                                                )}
                                            </button>
                                        ) : lockedByLeague ? (
                                            <button
                                                disabled
                                                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-wide bg-gray-100 text-gray-400 cursor-not-allowed"
                                            >
                                                <Lock className="w-3.5 h-3.5" /> Liga {TIER_NAME[item.required_league_tier!] ?? item.required_league_tier}
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleBuy(item)}
                                                disabled={busy || cantAfford}
                                                className={`w-full flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-[12px] font-black uppercase tracking-wide transition-all active:scale-95 disabled:active:scale-100 ${
                                                    cantAfford
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                        : 'bg-[#88e04f] text-white hover:bg-[#7ad043] shadow-sm shadow-green-200'
                                                }`}
                                            >
                                                {busy && action?.kind === 'buying' ? (
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                ) : (
                                                    <>
                                                        <Coins className="w-3.5 h-3.5" fill="currentColor" />
                                                        {item.price_coins.toLocaleString('es-MX')}
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* 3. Nota de inventario */}
                {!loading && catalog.length > 0 && (
                    <p className="mt-10 text-center text-[11px] font-bold text-gray-300 leading-tight">
                        Los marcos de liga se ganan ascendiendo en el ranking. Aquí solo aparecen los cosméticos comprables con monedas.
                    </p>
                )}
            </div>
        </div>
    );
}
