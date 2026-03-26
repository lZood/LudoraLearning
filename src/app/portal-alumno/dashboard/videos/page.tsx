'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Play, 
    Search, 
    Filter, 
    ChevronRight, 
    ChevronLeft, 
    ArrowRight,
    Clock,
    Award
} from 'lucide-react';
import Link from 'next/link';
import MobileSubHeader from '@/components/dashboard/MobileSubHeader';
import VideoCard from '@/components/dashboard/VideoCard';
import VideoPlayerModal from '@/components/dashboard/VideoPlayerModal';
import HapticTrigger, { HapticHandle } from '@/components/ui/HapticTrigger';

// Mock Categories
const CATEGORIES = ["Todos", "Gramática", "Vocabulario", "Cultura Gamer", "Directos", "Retos"];

// Comprehensive Mock Data
const ALL_VIDEOS = [
  {
    id: 1,
    title: 'Presentaciones Básicas en Minecraft',
    duration: '12:45',
    level: 'Nivel 1',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070',
    category: 'Conversación',
    url: 'ScMzIvxBSi4',
    description: 'Aprende a presentarte y saludar a otros jugadores en el servidor. Cubriremos frases esenciales y etiqueta básica de juego.',
    instructor: 'Teacher Sam',
    hasQuiz: true,
    quiz: [
        { question: "¿Cómo se dice 'encantado de conocerte'?", options: ["Nice to meet you", "Hello there", "Goodbye"], correctIndex: 0 },
        { question: "¿Cuál es un saludo informal?", options: ["Good morning", "What's up?", "How do you do?"], correctIndex: 1 }
    ]
  },
  {
    id: 2,
    title: 'Objetos y Herramientas: Vocabulario Esencial',
    duration: '08:20',
    level: 'Nivel 1',
    thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1973',
    category: 'Vocabulario',
    url: 'ScMzIvxBSi4',
    description: 'Nombra todo lo que ves en tu inventario. Aprenderemos sustantivos para herramientas, bloques y materiales.',
    instructor: 'Teacher Alex',
    hasQuiz: true,
    quiz: [
        { question: "¿Cómo se dice 'Pico'?", options: ["Axe", "Hoe", "Pickaxe"], correctIndex: 2 }
    ]
  },
  {
    id: 3,
    title: 'Construyendo con Adjetivos: Descripción de Estructuras',
    duration: '15:10',
    level: 'Nivel 2',
    thumbnail: 'https://images.unsplash.com/photo-1485546246426-74dc83626bad?q=80&w=2070',
    category: 'Gramática',
    url: 'ScMzIvxBSi4',
    description: 'Aprende a usar adjetivos para describir tus construcciones. Grande, pequeño, ruidoso, colorido y mucho más.',
    instructor: 'Teacher Dani',
    hasQuiz: true,
    quiz: [
        { question: "Un cofre 'grande' es...", options: ["A small chest", "A big chest", "A fast chest"], correctIndex: 1 }
    ]
  },
  {
    id: 4,
    title: 'Comandos de Servidor y Direcciones',
    duration: '10:15',
    level: 'Nivel 2',
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070',
    category: 'Retos',
    url: 'ScMzIvxBSi4',
    description: 'Navega por el mapa usando comandos y direcciones cardinales. Norte, Sur, Este y Oeste en la práctica.',
    instructor: 'Teacher Sam',
    hasQuiz: false,
    quiz: []
  }
];

export default function VideosPage() {
    const [selectedVideo, setSelectedVideo] = useState<any>(null);
    const [activeCategory, setActiveCategory] = useState("Todos");
    const [userLevel, setUserLevel] = useState(2); 
    const [searchQuery, setSearchQuery] = useState("");
    const hapticRef = useRef<HapticHandle>(null);

    const triggerHaptic = () => hapticRef.current?.trigger();

    const filteredVideos = ALL_VIDEOS.filter(video => {
        const matchesCategory = activeCategory === "Todos" || video.category === activeCategory;
        const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const featuredVideo = ALL_VIDEOS[0];

    return (
        <div className="min-h-screen bg-white">
            <HapticTrigger ref={hapticRef} />
            <MobileSubHeader hideNav={true} />
            
            <div className="max-w-[1600px] mx-auto px-4 md:px-10 lg:px-16 py-6 md:py-12 flex flex-col gap-8 md:gap-14">
                
                {/* Header Section */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1 md:px-0">
                    <div className="flex flex-col gap-3 md:gap-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-[#632EB0] rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20 rotate-3">
                                <Play className="w-5 h-5 md:w-6 md:h-6 text-white fill-current" />
                            </div>
                            <span className="text-[10px] md:text-xs font-black text-[#632EB0] uppercase tracking-[0.25em]">Ludora Academy</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl lg:text-7xl font-black text-black tracking-tight leading-[0.95]">
                            Vídeos de <br className="hidden md:block" />
                            <span className="text-[#632EB0]">Aprendizaje</span>
                        </h1>
                    </div>

                    {/* Search & Filter - More compact on mobile */}
                    <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
                        <div className="relative flex-grow md:flex-none md:w-80 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 group-focus-within:text-[#632EB0] transition-colors" />
                            <input 
                                type="text" 
                                placeholder="Buscar en la biblioteca..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#F8F9FB] border border-gray-100 rounded-[1.25rem] py-4 pl-12 pr-6 text-sm font-bold text-gray-700 outline-none focus:ring-4 focus:ring-purple-100 focus:bg-white transition-all shadow-sm" 
                            />
                        </div>
                        <button className="p-4 bg-[#F8F9FB] border border-gray-100 rounded-[1.25rem] text-gray-500 hover:text-[#632EB0] transition-all">
                            <Filter className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                {/* Hero Section - IMMERSIVE ON MOBILE */}
                {!searchQuery && activeCategory === "Todos" && (
                    <section 
                        onClick={() => setSelectedVideo(featuredVideo)}
                        className="relative w-full aspect-[4/5] md:aspect-[2.2/1] rounded-[2.5rem] md:rounded-[4rem] overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] group cursor-pointer"
                    >
                        <img 
                            src={featuredVideo.thumbnail} 
                            alt={featuredVideo.title}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black via-black/40 to-transparent flex flex-col justify-end md:justify-center p-8 md:p-16 lg:p-24 gap-6 md:gap-10">
                            <div className="flex flex-col gap-4 md:gap-8 max-w-2xl">
                                <div className="flex items-center gap-3">
                                    <span className="bg-[#632EB0] text-white px-5 py-2 rounded-full text-[10px] md:text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-purple-500/40">Destacado</span>
                                    <div className="flex items-center gap-2 text-white/80 text-[10px] md:text-sm font-black uppercase tracking-widest">
                                        <Clock className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
                                        <span>{featuredVideo.duration}</span>
                                    </div>
                                </div>
                                <h2 className="text-4xl md:text-6xl lg:text-8xl font-black text-white leading-[0.9] tracking-tighter drop-shadow-2xl">
                                    {featuredVideo.title}
                                </h2>
                                <p className="text-sm md:text-lg lg:text-xl text-white/80 font-medium leading-relaxed max-w-lg hidden sm:block">
                                    {featuredVideo.description}
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button className="bg-white text-black px-10 md:px-14 py-4 md:py-6 rounded-[1.5rem] md:rounded-[2rem] font-black text-xs md:text-sm uppercase tracking-[0.25em] shadow-2xl hover:scale-105 transition-all active:scale-95 flex items-center justify-center gap-3 order-1 sm:order-none">
                                    <Play className="w-4 h-4 md:w-5 md:h-5 fill-current" /> Ver Curso
                                </button>
                                <button className="bg-white/10 backdrop-blur-xl border border-white/20 text-white px-10 md:px-14 py-4 md:py-6 rounded-[1.5rem] md:rounded-[2rem] font-black text-xs md:text-sm uppercase tracking-[0.25em] hover:bg-white/20 transition-all flex items-center justify-center gap-3">
                                    <Award className="w-4 h-4 md:w-5 md:h-5" /> Detalles
                                </button>
                            </div>
                        </div>
                    </section>
                )}

                {/* Categories - Horizontal Scroll Edge-to-Edge on Mobile */}
                <div className="flex flex-col gap-6 -mx-4 px-4 md:mx-0 md:px-0">
                    <div className="flex items-center justify-between">
                        <h3 className="text-base md:text-xl font-black text-black uppercase tracking-[0.2em]">Sigue Explorando</h3>
                        <Link href="#" className="text-[10px] md:text-xs font-black text-[#632EB0] uppercase tracking-widest hover:underline flex items-center gap-2">
                            Ver Todo <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="flex items-center gap-3 overflow-x-auto pb-6 no-scrollbar">
                        {CATEGORIES.map((cat) => (
                            <button 
                                key={cat}
                                onClick={() => { triggerHaptic(); setActiveCategory(cat); }}
                                className={`whitespace-nowrap px-8 md:px-10 py-4 md:py-5 rounded-2xl md:rounded-[2rem] text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${
                                    activeCategory === cat 
                                    ? 'bg-[#632EB0] text-white shadow-xl shadow-purple-500/20' 
                                    : 'bg-[#F8F9FB] text-gray-500 hover:bg-white hover:shadow-lg hover:text-[#632EB0]'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Video Grid - ADAPTIVE */}
                <section className="flex flex-col gap-10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-10 lg:gap-14">
                        {filteredVideos.map((video) => {
                            const videoLevelNum = parseInt(video.level.split(' ')[1]);
                            const isLocked = videoLevelNum > userLevel;
                            
                            return (
                                <VideoCard 
                                    key={video.id}
                                    {...video}
                                    isLocked={isLocked}
                                    onPlay={() => setSelectedVideo(video)}
                                />
                            );
                        })}
                    </div>

                    {/* Empty State */}
                    {filteredVideos.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                <Search className="w-8 h-8 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 mb-2">No encontramos nada</h3>
                            <p className="text-gray-400 font-medium">Prueba con otra palabra o categoría.</p>
                        </div>
                    )}
                </section>

                {/* Bottom Stats (Only for PC) */}
                {!searchQuery && (
                    <div className="hidden lg:grid grid-cols-3 gap-8 mt-10 p-10 bg-[#F8F9FB] rounded-[3.5rem] border border-gray-100">
                        <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Aprendido</span>
                            <span className="text-4xl font-black text-black">24 Horas</span>
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Quizzes Completados</span>
                            <span className="text-4xl font-black text-black">12/15</span>
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Racha de Video</span>
                            <span className="text-4xl font-black text-[#632EB0]">7 Días</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Video Player Modal */}
            <AnimatePresence>
                {selectedVideo && (
                    <VideoPlayerModal 
                        video={selectedVideo} 
                        onClose={() => setSelectedVideo(null)}
                        onCompleteQuiz={(xp) => console.log(`Ganaste ${xp} XP!`)}
                    />
                )}
            </AnimatePresence>
            
            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
            `}</style>
        </div>
    );
}
