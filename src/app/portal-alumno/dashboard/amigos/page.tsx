'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    UserPlus,
    Check,
    X,
    Users,
    Zap,
    Clock,
    Trophy,
    Loader2,
    Pickaxe,
    Sparkles,
} from 'lucide-react';
import HapticTrigger, { HapticHandle } from '@/components/ui/HapticTrigger';
import MobileSubHeader from '@/components/dashboard/MobileSubHeader';
import { createClient } from '@/utils/supabase/client';

// ── Tipos del API /api/amigos (lectura enriquecida tras la barrera RLS) ──
type SearchRow = {
    id: string;
    full_name: string | null;
    relation: 'none' | 'pending_out' | 'pending_in' | 'accepted';
};
type FriendRow = {
    id: string;
    full_name: string | null;
    xp: number;
    league_name: string | null;
    league_color: string | null;
    league_tier: number | null;
};
type RequestRow = {
    id: string; // user_id del emisor
    full_name: string | null;
    created_at: string;
};

// Mapea el nombre de liga a un emoji minero (mismo lenguaje visual que /leaderboards).
const LEAGUE_EMOJI: Record<string, string> = {
    Madera: '🪵',
    Piedra: '🪨',
    Hierro: '🥈',
    Oro: '🥇',
    Esmeralda: '💎',
    Diamante: '💠',
    Netherite: '🟣',
};

const displayName = (n: string | null) => (n && n.trim() ? n.trim() : 'Aventurero');
const avatarFor = (n: string | null) => encodeURIComponent(displayName(n));

export default function AmigosPage() {
    const supabase = createClient();
    const hapticRef = useRef<HapticHandle>(null);
    const triggerHaptic = () => hapticRef.current?.trigger();

    const [mounted, setMounted] = useState(false);
    const [meId, setMeId] = useState<string | null>(null);

    // Búsqueda
    const [query, setQuery] = useState('');
    const [searching, setSearching] = useState(false);
    const [results, setResults] = useState<SearchRow[]>([]);
    const [sendingTo, setSendingTo] = useState<string | null>(null);

    // Solicitudes recibidas + amigos
    const [requests, setRequests] = useState<RequestRow[]>([]);
    const [friends, setFriends] = useState<FriendRow[]>([]);
    const [loadingLists, setLoadingLists] = useState(true);
    const [actingOn, setActingOn] = useState<string | null>(null);

    // Carga solicitudes recibidas + amigos aceptados (con liga/XP) desde el API.
    const loadLists = useCallback(async () => {
        try {
            const [rq, fr] = await Promise.all([
                fetch('/api/amigos?action=requests', { cache: 'no-store' }),
                fetch('/api/amigos?action=friends', { cache: 'no-store' }),
            ]);
            const rqJson = rq.ok ? await rq.json() : { requests: [] };
            const frJson = fr.ok ? await fr.json() : { friends: [] };
            setRequests((rqJson.requests as RequestRow[]) ?? []);
            setFriends((frJson.friends as FriendRow[]) ?? []);
        } catch {
            /* silencioso: la UI muestra estados vacíos */
        } finally {
            setLoadingLists(false);
        }
    }, []);

    useEffect(() => {
        setMounted(true);
        let active = true;
        (async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!active) return;
            setMeId(user?.id ?? null);
            await loadLists();
        })();
        return () => { active = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Búsqueda con debounce (ilike sobre users.full_name vía API admin autenticado).
    useEffect(() => {
        const q = query.trim();
        if (q.length < 2) { setResults([]); setSearching(false); return; }
        setSearching(true);
        const t = setTimeout(async () => {
            try {
                const res = await fetch(`/api/amigos?action=search&q=${encodeURIComponent(q)}`, { cache: 'no-store' });
                const json = res.ok ? await res.json() : { results: [] };
                setResults((json.results as SearchRow[]) ?? []);
            } catch {
                setResults([]);
            } finally {
                setSearching(false);
            }
        }, 350);
        return () => clearTimeout(t);
    }, [query]);

    // Enviar solicitud: insert friendships (user_id = auth.uid(), friend_id, 'pending').
    // La RLS "friendships insert" exige user_id = auth.uid(); por eso se hace en cliente.
    const sendRequest = async (friendId: string) => {
        if (!meId) return;
        setSendingTo(friendId);
        triggerHaptic();
        const { error } = await supabase
            .from('friendships')
            .insert({ user_id: meId, friend_id: friendId, status: 'pending' });
        setSendingTo(null);
        if (!error) {
            setResults((prev) => prev.map((r) => (r.id === friendId ? { ...r, relation: 'pending_out' } : r)));
        }
    };

    // Aceptar: update status = 'accepted' (RLS "friendships update" permite friend_id = auth.uid()).
    const acceptRequest = async (senderId: string) => {
        if (!meId) return;
        setActingOn(senderId);
        triggerHaptic();
        const { error } = await supabase
            .from('friendships')
            .update({ status: 'accepted' })
            .eq('user_id', senderId)
            .eq('friend_id', meId);
        setActingOn(null);
        if (!error) {
            setRequests((prev) => prev.filter((r) => r.id !== senderId));
            await loadLists(); // refresca el mini-ranking con el nuevo amigo
        }
    };

    // Rechazar: delete (RLS "friendships delete" permite filas donde soy friend_id).
    const rejectRequest = async (senderId: string) => {
        if (!meId) return;
        setActingOn(senderId);
        triggerHaptic();
        const { error } = await supabase
            .from('friendships')
            .delete()
            .eq('user_id', senderId)
            .eq('friend_id', meId);
        setActingOn(null);
        if (!error) {
            setRequests((prev) => prev.filter((r) => r.id !== senderId));
        }
    };

    if (!mounted) return null;

    return (
        <div className="w-full min-h-screen bg-white pb-32">
            <HapticTrigger ref={hapticRef} />
            <div className="md:hidden"><MobileSubHeader hideNav={true} /></div>

            <div className="max-w-3xl mx-auto w-full px-4 md:px-8 pt-6 md:pt-14">

                {/* ── HEADER ── */}
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="relative mb-4">
                        <div className="absolute inset-0 bg-purple-200/40 rounded-full blur-2xl opacity-60 scale-150" />
                        <div className="relative z-10 w-16 h-16 rounded-[1.8rem] bg-gradient-to-br from-[#815a9b] to-[#5e4171] flex items-center justify-center shadow-xl shadow-purple-100">
                            <Users className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tighter uppercase leading-none">
                        Amigos
                    </h1>
                    <p className="text-[13px] font-bold text-gray-400 mt-2 max-w-sm leading-tight">
                        Encuentra aventureros, compite por XP y sube de liga juntos en el Overworld.
                    </p>
                </div>

                {/* ── BUSCADOR ── */}
                <div className="relative mb-3">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300">
                        {searching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                    </div>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Busca por nombre…"
                        className="w-full pl-14 pr-5 py-4 rounded-[2rem] bg-gray-50 border-2 border-gray-100 text-gray-900 font-bold placeholder:text-gray-300 placeholder:font-bold focus:outline-none focus:border-[#815a9b]/40 focus:bg-white transition-all"
                    />
                </div>

                {/* Resultados de búsqueda */}
                <AnimatePresence initial={false}>
                    {query.trim().length >= 2 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden mb-8"
                        >
                            <div className="flex flex-col gap-2 pt-2">
                                {!searching && results.length === 0 && (
                                    <p className="text-center text-gray-400 font-bold py-6 text-sm">
                                        Nadie con ese nombre todavía. ⛏️
                                    </p>
                                )}
                                {results.map((r) => (
                                    <div
                                        key={r.id}
                                        className="flex items-center justify-between p-3 rounded-[1.8rem] bg-white border border-gray-100 shadow-sm"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <img
                                                src={`https://minotar.net/avatar/${avatarFor(r.full_name)}/48.png`}
                                                alt={displayName(r.full_name)}
                                                className="w-11 h-11 rounded-xl bg-gray-100 p-1 shrink-0"
                                            />
                                            <span className="font-black text-gray-900 tracking-tight truncate">
                                                {displayName(r.full_name)}
                                            </span>
                                        </div>
                                        {r.relation === 'accepted' ? (
                                            <span className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-green-50 text-green-600 text-[11px] font-black uppercase tracking-widest">
                                                <Check className="w-3.5 h-3.5" /> Amigo
                                            </span>
                                        ) : r.relation === 'pending_out' ? (
                                            <span className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gray-50 text-gray-400 text-[11px] font-black uppercase tracking-widest">
                                                <Clock className="w-3.5 h-3.5" /> Enviada
                                            </span>
                                        ) : r.relation === 'pending_in' ? (
                                            <span className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-blue-50 text-blue-500 text-[11px] font-black uppercase tracking-widest">
                                                <UserPlus className="w-3.5 h-3.5" /> Te invitó
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => sendRequest(r.id)}
                                                disabled={sendingTo === r.id}
                                                className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#88e04f] text-[#1f3d0a] text-[11px] font-black uppercase tracking-widest shadow-sm active:scale-95 transition-all disabled:opacity-60"
                                            >
                                                {sendingTo === r.id
                                                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    : <UserPlus className="w-3.5 h-3.5" />}
                                                Agregar
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── SOLICITUDES RECIBIDAS ── */}
                {requests.length > 0 && (
                    <section className="mb-8">
                        <div className="flex items-center gap-2 mb-3 px-1">
                            <UserPlus className="w-4 h-4 text-[#815a9b]" />
                            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">
                                Solicitudes ({requests.length})
                            </h2>
                        </div>
                        <div className="flex flex-col gap-2">
                            <AnimatePresence initial={false}>
                                {requests.map((req) => (
                                    <motion.div
                                        key={req.id}
                                        layout
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="flex items-center justify-between p-3 rounded-[1.8rem] bg-purple-50/40 border-2 border-purple-100"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <img
                                                src={`https://minotar.net/avatar/${avatarFor(req.full_name)}/48.png`}
                                                alt={displayName(req.full_name)}
                                                className="w-11 h-11 rounded-xl bg-white p-1 shrink-0"
                                            />
                                            <div className="min-w-0">
                                                <span className="block font-black text-gray-900 tracking-tight truncate">
                                                    {displayName(req.full_name)}
                                                </span>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">
                                                    Quiere ser tu amigo
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <button
                                                onClick={() => acceptRequest(req.id)}
                                                disabled={actingOn === req.id}
                                                aria-label="Aceptar"
                                                className="w-10 h-10 rounded-2xl bg-[#88e04f] text-[#1f3d0a] flex items-center justify-center shadow-sm active:scale-90 transition-all disabled:opacity-60"
                                            >
                                                {actingOn === req.id
                                                    ? <Loader2 className="w-4 h-4 animate-spin" />
                                                    : <Check className="w-5 h-5" strokeWidth={3} />}
                                            </button>
                                            <button
                                                onClick={() => rejectRequest(req.id)}
                                                disabled={actingOn === req.id}
                                                aria-label="Rechazar"
                                                className="w-10 h-10 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center active:scale-90 transition-all disabled:opacity-60"
                                            >
                                                <X className="w-5 h-5" strokeWidth={3} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </section>
                )}

                {/* ── MINI-RANKING DE AMIGOS ── */}
                <section>
                    <div className="flex items-center gap-2 mb-3 px-1">
                        <Trophy className="w-4 h-4 text-yellow-500" />
                        <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">
                            Tu aldea ({friends.length})
                        </h2>
                    </div>

                    {loadingLists ? (
                        <div className="flex items-center justify-center py-16 text-gray-300">
                            <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                    ) : friends.length === 0 ? (
                        <div className="text-center py-14 px-6 rounded-[2.5rem] bg-gray-50/60 border border-gray-100">
                            <div className="w-16 h-16 mx-auto rounded-3xl bg-white flex items-center justify-center shadow-inner mb-4">
                                <Pickaxe className="w-7 h-7 text-gray-300" />
                            </div>
                            <p className="font-black text-gray-700 tracking-tight">Aún no tienes amigos</p>
                            <p className="text-[12px] font-bold text-gray-400 mt-1 max-w-xs mx-auto leading-tight">
                                Busca a tus compañeros arriba y envíales una solicitud para minar XP juntos.
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {friends.map((f, i) => {
                                const rank = i + 1;
                                const emoji = f.league_name ? LEAGUE_EMOJI[f.league_name] ?? '⛏️' : '⛏️';
                                return (
                                    <motion.div
                                        key={f.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.04 }}
                                        className="flex items-center justify-between p-3 md:p-4 rounded-[2rem] bg-white border border-gray-100 shadow-sm"
                                    >
                                        <div className="flex items-center gap-3 md:gap-4 min-w-0">
                                            <span className={`w-5 text-center font-black text-lg tracking-tighter ${
                                                rank === 1 ? 'text-yellow-500'
                                                    : rank === 2 ? 'text-zinc-400'
                                                    : rank === 3 ? 'text-orange-600'
                                                    : 'text-gray-200'
                                            }`}>
                                                {rank}
                                            </span>
                                            <div className="relative shrink-0">
                                                <div
                                                    className="w-12 h-12 md:w-14 md:h-14 rounded-[1.3rem] bg-gray-50 flex items-center justify-center p-1 overflow-hidden shadow-inner"
                                                    style={f.league_color ? { boxShadow: `inset 0 0 0 3px ${f.league_color}` } : undefined}
                                                >
                                                    <img
                                                        src={`https://minotar.net/avatar/${avatarFor(f.full_name)}/56.png`}
                                                        alt={displayName(f.full_name)}
                                                        className="w-full h-full rounded-xl"
                                                    />
                                                </div>
                                                {rank === 1 && (
                                                    <div className="absolute -bottom-1 -right-1 bg-yellow-400 rounded-full p-1 border-2 border-white">
                                                        <Sparkles className="w-2.5 h-2.5 text-white" fill="currentColor" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <span className="block font-black text-gray-900 tracking-tight truncate leading-tight">
                                                    {displayName(f.full_name)}
                                                </span>
                                                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                                    <span>{emoji}</span>
                                                    {f.league_name ?? 'Sin liga'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 shrink-0 pl-2">
                                            <Zap className="w-4 h-4 text-yellow-500" fill="currentColor" />
                                            <div className="flex flex-col items-end">
                                                <span className="font-black text-gray-900 tracking-tighter leading-none">
                                                    {f.xp.toLocaleString('es-MX')}
                                                </span>
                                                <span className="text-[8px] font-black uppercase tracking-widest text-gray-300">XP</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
