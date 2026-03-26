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

const NEWS_DATA = [
  {
    id: 1,
    type: 'new_content',
    badge: 'Nueva Unidad',
    title: '¡Ya está aquí la Unidad: Colores y Emociones!',
    description: 'Aprende a expresar cómo te sientes y a identificar todos los colores del arcoíris en inglés con nuestras nuevas actividades interactivas.',
    image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop',
    cta: 'Explorar ahora',
    likes: 124,
    comments: 18,
    date: 'Hace 2 horas',
    category: 'Recientes'
  },
  {
    id: 2,
    type: 'social',
    badge: 'Comunidad Discord',
    title: 'Evento en vivo: Práctica de Listening',
    description: 'Únete a nuestro canal de Discord este viernes a las 6:00 PM para una sesión de práctica real con nativos. ¡No te lo pierdas!',
    image: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?q=80&w=1974&auto=format&fit=crop',
    cta: 'Unirme al Discord',
    likes: 89,
    comments: 5,
    date: 'Hace 5 horas',
    category: 'Eventos'
  },
  {
    id: 3,
    type: 'tiktok',
    badge: 'TikTok Destacado',
    title: '5 Tips para mejorar tu pronunciación',
    description: 'Nuestro último video de TikTok se ha vuelto viral. Mira cómo poner la lengua correctamente para los sonidos "th".',
    image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop',
    cta: 'Ver video completo',
    likes: 456,
    comments: 42,
    date: 'Ayer',
    category: 'Redes'
  }
];

export default function NoticiasPage() {
  const [activeTab, setActiveTab] = useState('Recientes');
  const [mounted, setMounted] = useState(false);
  const hapticRef = useRef<HapticHandle>(null);

  useEffect(() => {
    setMounted(true);
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
                {NEWS_DATA.filter(n => activeTab === 'Recientes' || n.category === activeTab).length > 0 ? (
                  NEWS_DATA.filter(n => activeTab === 'Recientes' || n.category === activeTab).map((news) => (
                    <div key={news.id} className="group cursor-pointer w-full" onClick={triggerHaptic}>
                      <div className="bg-[#F8F9FB] rounded-[2.5rem] overflow-hidden border border-gray-100/50 transition-all hover:bg-gray-50 group flex flex-col">
                            {/* Image Area */}
                            <div className="relative aspect-[16/9] w-full overflow-hidden shrink-0">
                                <img 
                                    src={news.image} 
                                    alt={news.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute top-4 left-4">
                                    <span className="px-4 py-1.5 bg-white/95 backdrop-blur-md rounded-full text-[9px] font-black text-[#632EB0] uppercase tracking-widest shadow-sm">
                                    {news.badge}
                                    </span>
                                </div>
                                {news.type === 'tiktok' && (
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
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">{news.date}</span>
                                    </div>
                                    <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-4 leading-[1.15] tracking-tight">
                                        {news.title}
                                    </h3>
                                    <p className="text-gray-500 font-medium text-[15px] leading-relaxed">
                                        {news.description}
                                    </p>
                                </div>
                                
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8 pt-6 border-t border-gray-200/50">
                                    <div className="flex items-center gap-6">
                                        <LikeButton initialLikes={news.likes} onLike={triggerHaptic} />
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <MessageCircle className="w-4 h-4" />
                                            <span className="text-[12px] font-bold">{news.comments}</span>
                                        </div>
                                    </div>
                                    
                                    <button className="sm:ml-auto w-full sm:w-auto px-8 py-3.5 bg-[#632EB0] text-white rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all hover:bg-[#4E248B] active:scale-95 shadow-lg shadow-purple-200">
                                        {news.cta}
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

function LikeButton({ initialLikes, onLike }: { initialLikes: number; onLike: () => void }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(initialLikes);

  const toggleLike = () => {
    onLike();
    if (liked) {
      setLikes(likes - 1);
    } else {
      setLikes(likes + 1);
    }
    setLiked(!liked);
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
