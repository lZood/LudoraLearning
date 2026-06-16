'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bell,
  Newspaper,
  Play,
  ChevronRight,
  Users,
  Calendar,
  Clock,
  ExternalLink,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MobileSubHeader from '@/components/dashboard/MobileSubHeader';
import HapticTrigger, { HapticHandle } from '@/components/ui/HapticTrigger';
import { createClient } from '@/utils/supabase/client';

// Estructura visual de cada noticia (se llena con datos reales de la BD).
type NewsItem = {
  id: string;
  type: string;
  badge: string;
  title: string;
  description: string;
  image: string | null;
  cta: string;
  likes: number;
  comments: number;
  liked: boolean;
  date: string;
  category: string;
};

// Convierte published_at en una etiqueta amigable en español ("Hace 2 horas", "Ayer"...).
function formatRelativeDate(iso: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return 'Ahora mismo';
  if (diffMin < 60) return `Hace ${diffMin} ${diffMin === 1 ? 'minuto' : 'minutos'}`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `Hace ${diffH} ${diffH === 1 ? 'hora' : 'horas'}`;
  const diffD = Math.round(diffH / 24);
  if (diffD === 1) return 'Ayer';
  if (diffD < 7) return `Hace ${diffD} días`;
  return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'long' });
}

// Deriva un estilo (badge/tipo/cta) coherente a partir de la categoría almacenada.
function deriveMeta(category: string | null, ctaUrl: string | null) {
  const cat = (category ?? '').toLowerCase();
  if (cat.includes('redes') || cat.includes('tiktok')) {
    return { type: 'tiktok', badge: 'Redes', cta: ctaUrl ? 'Ver video completo' : 'Ver más' };
  }
  if (cat.includes('evento')) {
    return { type: 'social', badge: 'Evento', cta: ctaUrl ? 'Unirme al Discord' : 'Más info' };
  }
  if (cat.includes('logro')) {
    return { type: 'achievement', badge: 'Logro', cta: 'Ver detalles' };
  }
  return { type: 'new_content', badge: category || 'Anuncio', cta: ctaUrl ? 'Explorar ahora' : 'Leer más' };
}

// ¿La noticia cae bajo la pestaña activa? Compara por palabra clave (no por igualdad exacta
// label==category), porque las categorías de la BD son crudas (p. ej. "evento", "tiktok").
function tabMatches(activeLabel: string, category: string | null): boolean {
  if (activeLabel === 'Recientes') return true;
  const cat = (category ?? '').toLowerCase();
  if (activeLabel === 'Eventos') return cat.includes('evento');
  if (activeLabel === 'Redes') return cat.includes('redes') || cat.includes('tiktok');
  if (activeLabel === 'Logros') return cat.includes('logro');
  return false;
}

export default function NoticiasPage() {
  const [activeTab, setActiveTab] = useState('Recientes');
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const hapticRef = useRef<HapticHandle>(null);

  useEffect(() => {
    setMounted(true);

    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);

      // 1) Traer todas las noticias, más recientes primero.
      const { data: posts } = await supabase
        .from('news_posts')
        .select('*')
        .order('published_at', { ascending: false });

      const rows = posts ?? [];

      // 2) Conteo de likes por post (RPC agregada; no trae todas las filas ni depende de RLS)
      //    + los likes del propio usuario (para saber cuáles marcó).
      const myLikesQ = user ? supabase.from('post_likes').select('post_id').eq('user_id', user.id) : null;
      const [{ data: likeCountRows }, myLikesRes] = await Promise.all([
        supabase.rpc('post_like_counts'),
        myLikesQ ?? Promise.resolve({ data: [] as { post_id: string }[] }),
      ]);

      const likeCounts = new Map<string, number>();
      ((likeCountRows as Array<{ post_id: string; likes: number }> | null) ?? []).forEach((r) => {
        likeCounts.set(r.post_id, Number(r.likes));
      });
      const userLiked = new Set<string>();
      ((myLikesRes?.data as Array<{ post_id: string }> | null) ?? []).forEach((l) => userLiked.add(l.post_id));

      const mapped: NewsItem[] = rows.map((p) => {
        const meta = deriveMeta(p.category as string | null, p.cta_url as string | null);
        return {
          id: p.id as string,
          type: meta.type,
          badge: meta.badge,
          title: (p.title as string) ?? '',
          description: (p.description as string) ?? '',
          image: (p.image_url as string | null) ?? null,
          cta: meta.cta,
          likes: likeCounts.get(p.id as string) ?? 0,
          comments: 0,
          liked: userLiked.has(p.id as string),
          date: formatRelativeDate(p.published_at as string | null),
          category: (p.category as string) ?? '',
        };
      });

      setNews(mapped);
      setLoading(false);
    })();
  }, []);

  const triggerHaptic = () => {
    hapticRef.current?.trigger();
  };

  const categories = [
    { id: 'recientes', label: 'Recientes', icon: Newspaper },
    { id: 'eventos', label: 'Eventos', icon: Calendar },
    { id: 'redes', label: 'Redes', icon: Share2 },
    { id: 'logros', label: 'Logros', icon: Star }
  ];

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-white">
      <HapticTrigger ref={hapticRef} />
      <MobileSubHeader />
      
      {/* Container Principal sin padding superior para evitar saltos de scroll */}
      <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center relative">
          
          {/* SIDEBAR IZQUIERDA (Absolutamente fija relativo al viewport) */}
          <aside className="hidden lg:flex flex-col gap-6 sticky top-20 w-[240px] shrink-0 pt-10">
            <div className="bg-[#F8F9FB] rounded-[2rem] p-6 border border-gray-100/50">
               <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Explorar</h3>
               <nav className="flex flex-col gap-2">
                  {categories.map((cat) => {
                    const isActive = activeTab === cat.label;
                    return (
                        <button
                            key={cat.id}
                            onClick={() => {
                                triggerHaptic();
                                setActiveTab(cat.label);
                            }}
                            className={`flex items-center gap-3 p-3.5 rounded-2xl transition-all font-black text-[13px] ${
                                isActive 
                                    ? 'bg-white text-[#632EB0] shadow-sm' 
                                    : 'text-gray-500 hover:bg-white/50'
                            }`}
                        >
                            <cat.icon className={`w-4 h-4 ${isActive ? 'text-[#632EB0]' : 'text-gray-400'}`} />
                            {cat.label}
                        </button>
                    );
                  })}
               </nav>
            </div>

            <div className="bg-[#F8F9FB] rounded-[2rem] p-6 border border-gray-100/50">
               <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Ludora App</h3>
               <div className="flex flex-col gap-4">
                  <p className="text-[11px] text-gray-500 font-bold leading-relaxed">
                    Mantente al día con las últimas actualizaciones del servidor y contenido educativo.
                  </p>
                  <div className="flex items-center gap-2 text-[#632EB0]">
                     <Bell className="w-4 h-4" />
                     <span className="text-[11px] font-black">Notificaciones activas</span>
                  </div>
               </div>
            </div>
          </aside>

          {/* CONTENIDO CENTRAL (Padding superior solo aquí) */}
          <main className="flex-1 w-full max-w-[700px] flex flex-col gap-8 pt-10">
            
            {/* MOBILE ONLY CATEGORIES */}
            <div className="lg:hidden -mx-4 px-4 overflow-x-auto no-scrollbar flex items-center gap-2 mb-2">
                {categories.map((cat) => (
                <button
                    key={cat.id}
                    onClick={() => {
                        triggerHaptic();
                        setActiveTab(cat.label);
                    }}
                    className={`px-5 py-2.5 rounded-full text-[11px] font-black whitespace-nowrap transition-all border shadow-sm ${
                    activeTab === cat.label 
                        ? 'bg-[#632EB0] border-[#632EB0] text-white' 
                        : 'bg-[#F8F9FB] border-gray-100 text-gray-500'
                    }`}
                >
                    {cat.label}
                </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-10 w-full pb-32"
              >
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400">
                    <div className="w-10 h-10 border-4 border-gray-100 border-t-[#632EB0] rounded-full animate-spin mb-4" />
                    <p className="text-sm font-bold">Cargando novedades...</p>
                  </div>
                ) : news.filter(n => tabMatches(activeTab, n.category)).length > 0 ? (
                  news.filter(n => tabMatches(activeTab, n.category)).map((item) => (
                    <div key={item.id} className="group cursor-pointer w-full" onClick={triggerHaptic}>
                      <div className="bg-[#F8F9FB] rounded-[2.5rem] overflow-hidden border border-gray-100/50 transition-all hover:bg-gray-50 group flex flex-col">
                            {/* Image Area */}
                            <div className="relative aspect-[16/9] w-full overflow-hidden shrink-0">
                                {item.image ? (
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#632EB0] to-[#88e04f] transition-transform duration-700 group-hover:scale-105">
                                        <Newspaper className="w-14 h-14 text-white/80" />
                                    </div>
                                )}
                                <div className="absolute top-4 left-4">
                                    <span className="px-4 py-1.5 bg-white/95 backdrop-blur-md rounded-full text-[9px] font-black text-[#632EB0] uppercase tracking-widest shadow-sm">
                                    {item.badge}
                                    </span>
                                </div>
                                {item.type === 'tiktok' && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-16 h-16 bg-white/30 backdrop-blur-lg rounded-full flex items-center justify-center border border-white/40">
                                            <Play className="w-8 h-8 text-white fill-white ml-1" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Content Area */}
                            <div className="p-8 md:p-10 flex flex-col gap-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">{item.date}</span>
                                    </div>
                                    <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-4 leading-[1.15] tracking-tight">
                                        {item.title}
                                    </h3>
                                    <p className="text-gray-500 font-medium text-[15px] leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8 pt-6 border-t border-gray-200/50">
                                    <div className="flex items-center gap-6">
                                        <LikeButton
                                            postId={item.id}
                                            initialLikes={item.likes}
                                            initialLiked={item.liked}
                                            userId={userId}
                                            onLike={triggerHaptic}
                                        />
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <MessageCircle className="w-4 h-4" />
                                            <span className="text-[12px] font-bold">{item.comments}</span>
                                        </div>
                                    </div>

                                    <button className="sm:ml-auto w-full sm:w-auto px-8 py-3.5 bg-[#632EB0] text-white rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all hover:bg-[#4E248B] active:scale-95 shadow-lg shadow-purple-200">
                                        {item.cta}
                                    </button>
                                </div>
                            </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center opacity-40 grayscale">
                    <Bell className="w-16 h-16 mb-4" />
                    <p className="text-sm font-bold">No hay novedades en esta sección por ahora.</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </main>

          {/* SIDEBAR DERECHA (Absolutamente fija relativo al viewport) */}
          <aside className="hidden lg:flex flex-col gap-6 sticky top-20 w-[280px] shrink-0 pt-10">
            {/* Discord Community Widget */}
            <div className="bg-[#5865F2] rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-lg shadow-indigo-100">
               <div className="relative z-10 flex flex-col gap-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                     <Users className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black tracking-tight leading-tight">Comunidad Discord</h4>
                    <p className="text-white/70 text-[13px] font-medium mt-2">Interactúa con otros aventureros de Ludora.</p>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 w-fit px-3 py-1.5 rounded-full border border-white/20">
                     <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                     <span className="text-[9px] font-black uppercase tracking-widest">342 Online</span>
                  </div>
                  <button className="w-full mt-2 py-4 bg-white text-[#5865F2] rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all hover:bg-gray-50 active:scale-95 flex items-center justify-center gap-2">
                     Unirme Ahora
                     <ExternalLink className="w-3.5 h-3.5" />
                  </button>
               </div>
               
               {/* Discord Background Decor */}
               <div className="absolute top-[-20%] right-[-20%] w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all"></div>
            </div>

            {/* Upcoming Event Widget */}
            <div className="bg-[#F8F9FB] rounded-[2.5rem] p-8 border border-gray-100/50">
                <div className="flex items-center gap-2 mb-6">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Próximo Evento</h3>
                </div>
                
                <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                            <Clock className="w-5 h-5 text-[#632EB0]" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[11px] font-black text-[#632EB0]">Este Viernes</span>
                            <span className="text-[14px] font-black text-gray-900 leading-none mt-0.5">18:00 PM</span>
                        </div>
                    </div>
                    <h5 className="font-black text-gray-900 text-[13px] mb-2 leading-tight">Práctica de Listening con Nativos</h5>
                    <p className="text-[9px] text-gray-400 font-bold mb-4 uppercase tracking-widest">Sala 1 • Discord</p>
                    <button className="w-full py-2.5 bg-gray-50 border border-gray-100 text-[#632EB0] rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all">
                        Recordatorio
                    </button>
                </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}

function LikeButton({
  postId,
  initialLikes,
  initialLiked,
  userId,
  onLike,
}: {
  postId: string;
  initialLikes: number;
  initialLiked: boolean;
  userId: string | null;
  onLike: () => void;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [likes, setLikes] = useState(initialLikes);
  const [busy, setBusy] = useState(false);

  // Sincroniza el estado si los datos reales llegan después del primer render.
  useEffect(() => {
    setLiked(initialLiked);
    setLikes(initialLikes);
  }, [initialLiked, initialLikes]);

  const toggleLike = async () => {
    onLike();
    if (!userId || busy) return;

    const supabase = createClient();
    const wasLiked = liked;

    // Actualización optimista del conteo local.
    setLiked(!wasLiked);
    setLikes((n) => n + (wasLiked ? -1 : 1));
    setBusy(true);

    let error;
    if (wasLiked) {
      ({ error } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId));
    } else {
      ({ error } = await supabase
        .from('post_likes')
        .insert({ post_id: postId, user_id: userId }));
    }

    // Si falla, revertimos el cambio optimista.
    if (error) {
      setLiked(wasLiked);
      setLikes((n) => n + (wasLiked ? 1 : -1));
    }
    setBusy(false);
  };

  return (
    <button
      onClick={(e) => {
          e.stopPropagation();
          toggleLike();
      }}
      className="flex items-center gap-2 group/btn"
    >
       <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
         liked ? 'bg-red-50 text-red-500' : 'bg-gray-100/50 text-gray-400 group-hover/btn:bg-red-50 group-hover/btn:text-red-500'
       }`}>
          <Heart className={`w-4 h-4 transition-transform ${liked ? 'fill-red-500 scale-110' : 'scale-100'}`} />
       </div>
       <span className={`text-[12px] font-bold transition-colors ${liked ? 'text-red-500' : 'text-gray-400 group-hover/btn:text-red-500'}`}>
         {likes}
       </span>
    </button>
  );
}
