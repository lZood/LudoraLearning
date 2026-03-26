'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Zap, 
  Bell,
  Newspaper,
  Play,
  Calendar,
  ChevronRight,
  TrendingUp,
  Users,
  ExternalLink,
  Search,
  Plus
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
    category: 'Recientes',
    isFeatured: true
  },
  {
    id: 2,
    type: 'social',
    badge: 'Comunidad Discord',
    title: 'Evento en vivo: Práctica de Listening',
    description: 'Únete a nuestro canal de Discord este viernes a las 6:00 PM para una sesión de práctica real con nativos.',
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

const UPCOMING_EVENTS = [
    { title: "Torneo de Minecraft (Nivel 1)", time: "Viernes 18:00", icon: Zap },
    { title: "Club de Conversación", time: "Sábado 10:00", icon: Users },
];

export default function NoticiasPage() {
  const [activeTab, setActiveTab] = useState('Recientes');
  const hapticRef = useRef<HapticHandle>(null);

  const triggerHaptic = () => {
    hapticRef.current?.trigger();
  };

  const categories = [
    { id: 'recientes', label: 'Recientes' },
    { id: 'eventos', label: 'Eventos' },
    { id: 'redes', label: 'Redes' },
    { id: 'logros', label: 'Logros' }
  ];

  return (
    <div className="min-h-screen bg-white pb-32">
      <HapticTrigger ref={hapticRef} />
      
      {/* 1. TOP HEADER (PC & Mobile) */}
      <MobileSubHeader hideNav={true} />
      
      {/* 2. MAIN LAYOUT CONTAINER */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-6 md:py-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* LEFT SIDEBAR: Categories (Desktop Sticky) */}
        <aside className="hidden md:flex md:col-span-3 lg:col-span-2 flex-col gap-8 sticky top-24">
            <div className="flex flex-col gap-2">
                <h2 className="text-xl font-black text-gray-900 mb-4 ml-4">Categorías</h2>
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => {
                            setActiveTab(cat.label);
                            triggerHaptic();
                        }}
                        className={`flex items-center gap-4 px-6 py-4 rounded-3xl font-black text-sm tracking-wide transition-all ${
                            activeTab === cat.label 
                                ? 'bg-[#632EB0] text-white shadow-xl shadow-purple-200' 
                                : 'text-gray-400 hover:bg-[#F8F9FB] hover:text-[#632EB0]'
                        }`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            <div className="bg-[#632EB0] rounded-[2rem] p-6 text-white relative overflow-hidden shadow-lg shadow-purple-100">
                <div className="relative z-10">
                    <Zap className="w-8 h-8 mb-3 text-yellow-300" fill="currentColor" />
                    <h3 className="font-black text-[15px] mb-2">Canal de Novedades</h3>
                    <p className="text-[11px] font-bold text-purple-200 leading-relaxed mb-4">
                        Entérate de todo antes que nadie en nuestro servidor privado.
                    </p>
                    <button className="w-full py-3 bg-white/20 hover:bg-white/30 rounded-2xl text-[11px] font-black uppercase tracking-widest border border-white/20 transition-all">
                        Unirse a Discord
                    </button>
                </div>
            </div>
        </aside>

        {/* MOBILE CATEGORY ROW (Visible only on Mobile) */}
        <div className="md:hidden flex overflow-x-auto no-scrollbar gap-2 -mx-4 px-4 mb-4">
            {categories.map((cat) => (
                <button
                    key={cat.id}
                    onClick={() => {
                        setActiveTab(cat.label);
                        triggerHaptic();
                    }}
                    className={`px-5 py-2.5 rounded-full text-xs font-black whitespace-nowrap transition-all border shadow-sm ${
                        activeTab === cat.label 
                            ? 'bg-[#632EB0] border-[#632EB0] text-white' 
                            : 'bg-[#F8F9FB] border-gray-100 text-gray-400'
                    }`}
                >
                    {cat.label}
                </button>
            ))}
        </div>

        {/* MIDDLE CONTENT: News Feed */}
        <main className="md:col-span-9 lg:col-span-7 flex flex-col gap-8">
            <div className="flex items-center justify-between mb-2">
               <div>
                  <h1 className="text-3xl font-black text-gray-900 tracking-tight">Noticias Ludora</h1>
                  <p className="text-sm font-bold text-gray-400">Todo lo que pasa en nuestra comunidad</p>
               </div>
               {/* Search Bar - Stylized */}
               <div className="hidden lg:flex items-center gap-3 bg-[#F8F9FB] border border-gray-100 rounded-2xl px-4 py-2 text-gray-400 w-64 shadow-sm">
                   <Search className="w-4 h-4" />
                   <span className="text-xs font-bold">Buscar noticias...</span>
               </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col gap-10"
                >
                    {NEWS_DATA.filter(n => activeTab === 'Recientes' || n.category === activeTab).map((news) => (
                        <div key={news.id} className={`${news.isFeatured ? 'col-span-full' : ''}`}>
                            <div className="bg-[#F8F9FB] rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm transition-all hover:shadow-xl hover:shadow-purple-200/20 group">
                                <div className={`relative w-full ${news.isFeatured ? 'h-[250px] md:h-[350px]' : 'aspect-video'} overflow-hidden`}>
                                    <img 
                                        src={news.image} 
                                        alt={news.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute top-6 left-6">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg backdrop-blur-md ${
                                            news.isFeatured ? 'bg-[#632EB0] text-white' : 'bg-white/90 text-[#632EB0]'
                                        }`}>
                                            {news.badge}
                                        </span>
                                    </div>
                                    {news.type === 'tiktok' && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-16 h-16 bg-white/30 backdrop-blur-lg rounded-full flex items-center justify-center border border-white/40 shadow-xl">
                                                <Play className="w-8 h-8 text-white fill-white ml-1" />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="p-8 md:p-10">
                                    <h3 className={`font-black text-gray-900 leading-tight tracking-tight mb-4 ${
                                        news.isFeatured ? 'text-3xl lg:text-4xl' : 'text-2xl'
                                    }`}>
                                        {news.title}
                                    </h3>
                                    <p className="text-gray-500 font-medium text-[15px] md:text-[16px] leading-relaxed mb-8">
                                        {news.description}
                                    </p>
                                    
                                    <div className="flex flex-wrap items-center justify-between gap-6 pb-8 border-b border-gray-50 mb-8">
                                        <Link 
                                            href="#"
                                            onClick={triggerHaptic}
                                            className="bg-[#632EB0] text-white font-black text-[13px] px-8 py-3.5 rounded-2xl hover:bg-[#522594] transition-all flex items-center gap-2 group/btn"
                                        >
                                            {news.cta}
                                            <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                                        </Link>
                                        <div className="flex items-center gap-4 text-gray-400 text-xs font-bold">
                                            <span className="flex items-center gap-1.5">
                                                <Calendar className="w-4 h-4" />
                                                {news.date}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8">
                                        <LikeButton initialLikes={news.likes} onToggle={triggerHaptic} />
                                        <div className="flex items-center gap-2 text-gray-400 font-bold group">
                                            <div className="w-10 h-10 rounded-full bg-white group-hover:bg-blue-50 flex items-center justify-center transition-all">
                                                <MessageCircle className="w-5 h-5 group-hover:text-blue-500" />
                                            </div>
                                            <span className="text-[13px] group-hover:text-blue-500">{news.comments}</span>
                                        </div>
                                        <button className="ml-auto w-10 h-10 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center transition-all shadow-sm">
                                            <Share2 className="w-5 h-5 text-gray-400" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </motion.div>
            </AnimatePresence>
        </main>

        {/* RIGHT SIDEBAR: Widgets (Desktop Sticky) */}
        <aside className="hidden lg:flex lg:col-span-3 flex-col gap-6 sticky top-24">
            
            {/* PRÓXIMOS EVENTOS */}
            <div className="bg-[#F8F9FB] rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-black text-gray-900">Próximos</h3>
                    <div className="w-8 h-8 bg-red-50 rounded-xl flex items-center justify-center">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    </div>
                </div>
                <div className="flex flex-col gap-5">
                    {UPCOMING_EVENTS.map((event, i) => (
                        <div key={i} className="flex gap-4 group cursor-pointer">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-purple-50 transition-colors">
                                <event.icon className="w-6 h-6 text-gray-400 group-hover:text-[#632EB0]" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <p className="text-[13px] font-black text-gray-800 leading-tight group-hover:text-[#632EB0]">{event.title}</p>
                                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">{event.time}</span>
                            </div>
                        </div>
                    ))}
                </div>
                <button className="w-full mt-8 py-3.5 bg-white border-2 border-gray-50 hover:border-[#632EB0] hover:text-[#632EB0] text-gray-400 text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-sm">
                    Ver Calendario
                </button>
            </div>

            {/* COMUNIDAD WIDGET */}
            <div className="bg-[#F8F9FB] rounded-[2rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden">
                <TrendingUp className="w-12 h-12 text-purple-100 absolute -right-2 -top-2" />
                <h3 className="text-lg font-black text-gray-900 mb-6">Trending</h3>
                <div className="flex flex-col gap-4">
                     <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                        <span className="text-[13px] font-bold text-gray-600 hover:text-[#632EB0] cursor-pointer transition-colors">#MinecraftLearning</span>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                        <span className="text-[13px] font-bold text-gray-600 hover:text-[#632EB0] cursor-pointer transition-colors">#Racha100Dias</span>
                     </div>
                </div>
            </div>

            {/* QUICK LINK */}
            <div className="bg-[#F8F9FB] rounded-[2rem] p-8 text-gray-900 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-black mb-4">¿Ya viste Tik Tok?</h3>
                <p className="text-gray-400 text-xs font-bold leading-relaxed mb-6">Subimos contenido nuevo todos los días para que nunca dejes de aprender.</p>
                <Link 
                    href="#"
                    className="flex items-center justify-center gap-2 py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform"
                >
                    ir a tiktok
                    <ExternalLink className="w-4 h-4 ml-1" />
                </Link>
            </div>
        </aside>

      </div>

      <footer className="mt-12 mb-20 px-8 text-center flex flex-col items-center gap-4 border-t border-gray-50 pt-10">
        <div className="flex items-center gap-2 opacity-50 grayscale">
            <Newspaper className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-widest text-black">Ludora News Feed</span>
        </div>
        <p className="text-[11px] text-gray-300 font-bold">
            Rediseñado para una experiencia Desktop Premium.
        </p>
      </footer>
    </div>
  );
}

function LikeButton({ initialLikes, onToggle }: { initialLikes: number, onToggle: () => void }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(initialLikes);

  const toggleLike = () => {
    onToggle();
    if (liked) {
      setLikes(likes - 1);
    } else {
      setLikes(likes + 1);
    }
    setLiked(!liked);
  };

  return (
    <button 
      onClick={toggleLike}
      className="flex items-center gap-2 group/btn"
    >
       <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
         liked ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-400 group-hover/btn:bg-red-50 group-hover/btn:text-red-500'
       }`}>
          <Heart className={`w-5 h-5 transition-transform ${liked ? 'fill-red-500 scale-110' : 'scale-100'}`} />
       </div>
       <span className={`text-[13px] font-bold transition-colors ${liked ? 'text-red-500' : 'text-gray-400 group-hover/btn:text-red-500'}`}>
         {likes}
       </span>
    </button>
  );
}
