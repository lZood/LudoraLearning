'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
    Heart,
    Play,
    PlayCircle,
    Clock,
    Star,
    Lock,
    ChevronRight,
    Layout,
    CheckCircle2,
    Zap,
    Filter,
    Search,
    BookOpen,
    Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MobileSubHeader from '@/components/dashboard/MobileSubHeader';
import HapticTrigger, { HapticHandle } from '@/components/ui/HapticTrigger';

const categories = [
    { id: 'todos', label: 'Todos' },
    { id: 'gramatica', label: 'Gramática' },
    { id: 'vocabulario', label: 'Vocabulario' },
    { id: 'pronunciacion', label: 'Pronunciación' },
    { id: 'conversacion', label: 'Conversación' }
];

const VIDEO_DATA = [
    {
        id: 1,
        title: 'Saludos básicos (Hi, Hello)',
        duration: '4:45',
        level: 1,
        difficulty: 'Nivel 1',
        thumbnail: '/images/portal-alumnos/videos/gameplay.png',
        category: 'Conversación',
        description: 'Aprende a presentarte y saludar a otros jugadores en el servidor. Cubriremos frases esenciales y etiqueta básica de juego.',
        xp: 25,
        youtubeId: 'dQw4w9WgXcQ' // Mock
    },
    {
        id: 2,
        title: 'Objetos y Herramientas: Vocabulario Esencial',
        duration: '08:20',
        level: 1,
        difficulty: 'Nivel 1',
        thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1973&auto=format&fit=crop',
        category: 'Vocabulario',
        description: 'Domina los nombres de las herramientas y bloques principales mientras construyes tu primera aldea.',
        xp: 15,
        youtubeId: 'dQw4w9WgXcQ'
    },
    {
        id: 3,
        title: 'Construyendo con Adjetivos: Descripción de Estructuras',
        duration: '15:10',
        level: 2,
        difficulty: 'Nivel 2',
        thumbnail: 'https://images.unsplash.com/photo-1485546246426-74dc83626bad?q=80&w=2070&auto=format&fit=crop',
        category: 'Gramática',
        description: 'Mejora tus construcciones usando adjetivos descriptivos y comparativos. Aprende a decir "más grande", "más resistente", etc.',
        xp: 35,
        youtubeId: 'dQw4w9WgXcQ'
    },
    {
        id: 4,
        title: 'Comandos de Servidor y Direcciones',
        duration: '10:15',
        level: 2,
        difficulty: 'Nivel 2',
        thumbnail: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop',
        category: 'Conversación',
        description: 'Utiliza comandos rápidos y aprende a dar direcciones precisas para coordinar incursiones con tus amigos.',
        xp: 20,
        youtubeId: 'dQw4w9WgXcQ'
    },
    {
        id: 5,
        title: 'Encantamientos y Vocabulario Místico',
        duration: '18:30',
        level: 3,
        difficulty: 'Nivel 3',
        thumbnail: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop',
        category: 'Vocabulario',
        description: 'Explora el mundo de la alquimia y los encantamientos. Un vocabulario avanzado para expertos exploradores.',
        xp: 50,
        youtubeId: 'dQw4w9WgXcQ'
    }
];

// MOCK USER STATE
const USER_PROGRESS = {
    currentLevel: 2, // El usuario está en nivel 2, puede ver niveles <= 2
    hoursWatched: 24,
    quizzesCompleted: 12,
    totalQuizzes: 15,
    streak: 7
};

export default function VideosPage() {
    const [activeTab, setActiveTab] = useState('Todos');
    const [selectedVideo, setSelectedVideo] = useState<any>(null);
    const [showQuizz, setShowQuizz] = useState(false);
    const [mounted, setMounted] = useState(false);
    const hapticRef = useRef<HapticHandle>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const triggerHaptic = () => {
        hapticRef.current?.trigger();
    };

    const filteredVideos = VIDEO_DATA.filter(v => activeTab === 'Todos' || v.category === activeTab);
    const featuredVideo = VIDEO_DATA[0];

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-white">
            <HapticTrigger ref={hapticRef} />
            <MobileSubHeader />

            <main className="max-w-[1400px] mx-auto px-4 lg:px-8 pt-10 pb-40">

                {/* HEADER & STATS (Desktop) */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-3 text-[#632EB0] mb-3">
                            <div className="p-2 bg-purple-50 rounded-xl">
                                <Play className="w-5 h-5 fill-[#632EB0]" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest">Ludora Academy</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-none">
                            Vídeos de <span className="text-[#632EB0] drop-shadow-sm">Aprendizaje</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-1.5 lg:gap-4 flex-wrap">
                        <div className="flex-1 min-w-[300px] md:min-w-[400px] relative hidden md:block">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                            <input
                                type="text"
                                placeholder="Buscar en la biblioteca..."
                                className="w-full bg-[#F8F9FB] border-none rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-gray-600 focus:ring-2 focus:ring-purple-100 transition-all"
                            />
                        </div>
                        <button className="p-4 bg-[#F8F9FB] rounded-2xl text-gray-400 hover:text-purple-600 transition-colors">
                            <Filter className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* FEATURED VIDEO (HERO) */}
                <div className="relative mb-16 group">
                    <div className="bg-black rounded-[2.5rem_2.5rem_2.5rem_2.5rem] overflow-hidden aspect-[21/9] w-full relative group cursor-pointer shadow-2xl shadow-purple-200/50"
                        onClick={() => {
                            triggerHaptic();
                            setSelectedVideo(featuredVideo);
                        }}>
                        <img
                            src={featuredVideo.thumbnail}
                            alt={featuredVideo.title}
                            className="w-full h-full object-cover opacity-60 transition-transform duration-1000 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>

                        <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/30 shadow-2xl"
                            >
                                <Play className="w-10 h-10 text-white fill-white ml-2" />
                            </motion.div>
                        </div>

                        <div className="absolute bottom-10 left-10 right-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div className="max-w-2xl">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="px-4 py-1.5 bg-[#632EB0] text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg">Destacado</span>
                                    <span className="flex items-center gap-1.5 text-white/80 text-[11px] font-black uppercase tracking-widest ml-2">
                                        <Clock className="w-3.5 h-3.5" /> {featuredVideo.duration}
                                    </span>
                                </div>
                                <h2 className="text-4xl md:text-5xl font-black text-white leading-[1.1] mb-4">
                                    {featuredVideo.title}
                                </h2>
                                <p className="text-white/60 text-lg font-medium max-w-lg hidden md:block">
                                    {featuredVideo.description}
                                </p>
                            </div>

                            <div className="flex items-center gap-4">
                                <button className="px-10 py-5 bg-white text-black rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                                    <Play className="w-4 h-4 fill-black" /> Ver Vídeo
                                </button>
                                <button className="px-6 py-5 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-2">
                                    <Layout className="w-4 h-4" /> Detalles
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* VIDEOS GRID SECTION */}
                <div className="space-y-10">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black text-gray-900 uppercase tracking-[0.2em]">Sigue explorando</h3>
                        <Link href="#" className="flex items-center gap-2 text-[#632EB0] font-black text-xs uppercase tracking-widest group">
                            Ver todo <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>

                    {/* FILTROS (Desktop & Mobile) */}
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => {
                                    triggerHaptic();
                                    setActiveTab(cat.label);
                                }}
                                className={`px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === cat.label
                                    ? 'bg-[#632EB0] text-white shadow-lg shadow-purple-200'
                                    : 'bg-[#F8F9FB] text-gray-400 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* GRID VIEW */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {filteredVideos.map((video) => {
                            const isLocked = video.level > USER_PROGRESS.currentLevel;
                            return (
                                <div
                                    key={video.id}
                                    onClick={!isLocked ? () => {
                                        triggerHaptic();
                                        setSelectedVideo(video);
                                    } : undefined}
                                    className={`group flex flex-col h-full bg-[#F8F9FB] rounded-[2.5rem] overflow-hidden border border-gray-100 transition-all hover:translate-y-[-8px] hover:shadow-2xl hover:shadow-purple-100 relative ${isLocked ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                                >
                                    <div className="relative aspect-video w-full overflow-hidden shrink-0">
                                        <img
                                            src={video.thumbnail}
                                            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${isLocked ? 'grayscale opacity-50' : ''}`}
                                        />
                                        {isLocked ? (
                                            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center text-white gap-3">
                                                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center border border-white/20">
                                                    <Lock className="w-6 h-6 text-white" />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest">Bloqueado - {video.difficulty}</span>
                                            </div>
                                        ) : (
                                            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-all">
                                                    <Play className="w-5 h-5 text-black fill-black ml-1" />
                                                </div>
                                            </div>
                                        )}
                                        <div className="absolute top-4 left-4 flex gap-2">
                                            <span className="px-3 py-1 bg-white/95 backdrop-blur-sm shadow-sm rounded-full text-[9px] font-black text-[#632EB0] uppercase tracking-widest">
                                                {video.category}
                                            </span>
                                            <span className="px-3 py-1 bg-[#FD9624] text-white shadow-sm rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                                                <Zap className="w-2.5 h-2.5 fill-white" /> +{video.xp} XP
                                            </span>
                                        </div>
                                        {!isLocked && (
                                            <div className="absolute bottom-4 right-4 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-bold text-white">
                                                {video.duration}
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-8 flex flex-col justify-between flex-1">
                                        <div>
                                            <span className="inline-block text-[10px] font-black text-purple-400 uppercase tracking-widest mb-2">
                                                {video.difficulty}
                                            </span>
                                            <h4 className="text-[18px] font-black text-gray-900 leading-[1.3] group-hover:text-[#632EB0] transition-colors mb-3">
                                                {video.title}
                                            </h4>
                                        </div>
                                        <div className="flex items-center gap-2 text-yellow-500 text-[10px] font-black uppercase tracking-widest">
                                            <Star className="w-3.5 h-3.5 fill-yellow-500" /> Contenido Premium
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* STATS BOARD (PC) */}
                <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-[#F8F9FB] rounded-[2.5rem] p-10 flex flex-col gap-2 items-center text-center">
                        <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Aprendido</span>
                        <span className="text-4xl font-black text-gray-900">{USER_PROGRESS.hoursWatched} Horas</span>
                    </div>
                    <div className="bg-[#F8F9FB] rounded-[2.5rem] p-10 flex flex-col gap-2 items-center text-center border-l border-r border-gray-100">
                        <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Quizzes Completados</span>
                        <span className="text-4xl font-black text-[#632EB0]">{USER_PROGRESS.quizzesCompleted}/{USER_PROGRESS.totalQuizzes}</span>
                    </div>
                    <div className="bg-[#F8F9FB] rounded-[2.5rem] p-10 flex flex-col gap-2 items-center text-center">
                        <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Racha de Vídeo</span>
                        <span className="text-4xl font-black text-[#FD9624] flex items-center gap-3">
                            {USER_PROGRESS.streak} Días <Zap className="w-8 h-8 fill-[#FD9624]" />
                        </span>
                    </div>
                </div>

            </main>

            {/* VIDEO PLAYER MODAL */}
            <AnimatePresence>
                {selectedVideo && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-10 bg-black/90 backdrop-blur-xl"
                    >
                        <button
                            onClick={() => setSelectedVideo(null)}
                            className="absolute top-8 right-8 w-14 h-14 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all z-[110]"
                        >
                            &times;
                        </button>

                        <div className="w-full h-full max-w-[1400px] flex flex-col lg:flex-row bg-[#F8F9FB] md:rounded-[3rem] overflow-hidden shadow-2xl">
                            {/* Video Player Area */}
                            <div className="flex-1 bg-black relative flex items-center justify-center">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1`}
                                    title={selectedVideo.title}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="aspect-video w-full"
                                ></iframe>
                            </div>

                            {/* Interaction / Quizz Area */}
                            <div className="w-full lg:w-[450px] bg-white p-8 md:p-12 flex flex-col shrink-0">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-6">
                                        <span className="px-3 py-1 bg-purple-50 text-[#632EB0] text-[10px] font-black rounded-full uppercase">
                                            {selectedVideo.category}
                                        </span>
                                        <span className="px-3 py-1 bg-yellow-50 text-yellow-600 text-[10px] font-black rounded-full uppercase">
                                            {selectedVideo.difficulty}
                                        </span>
                                    </div>

                                    <h2 className="text-3xl font-black text-gray-900 leading-tight mb-4">
                                        {selectedVideo.title}
                                    </h2>
                                    <p className="text-gray-500 font-medium leading-relaxed mb-8">
                                        {selectedVideo.description}
                                    </p>

                                    <div className="space-y-6">
                                        <div className="p-6 bg-[#F8F9FB] rounded-2xl flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                                <Award className="w-6 h-6 text-[#632EB0]" />
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-black text-gray-400 uppercase">Recompensa</div>
                                                <div className="text-sm font-black text-gray-900">+{selectedVideo.xp} XP y Moneda Ludora</div>
                                            </div>
                                        </div>
                                        <div className="p-6 bg-[#F8F9FB] rounded-2xl flex items-center gap-4 border border-[#632EB0]/10">
                                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                                <BookOpen className="w-6 h-6 text-[#632EB0]" />
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-black text-gray-400 uppercase">Estado</div>
                                                <div className="text-sm font-black text-[#632EB0]">Vídeo en curso...</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-10 flex flex-col gap-4">
                                    {!showQuizz ? (
                                        <button
                                            onClick={() => setShowQuizz(true)}
                                            className="w-full py-5 bg-[#632EB0] text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-purple-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                                        >
                                            ¡Comenzar Quizz! <ChevronRight className="w-5 h-5" />
                                        </button>
                                    ) : (
                                        <div className="p-6 bg-green-50 rounded-2xl border border-green-100 text-center">
                                            <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                                            <p className="text-xs font-black text-green-700 uppercase">¡Quizz Desbloqueado!</p>
                                            <button className="mt-4 text-green-600 font-black text-xs uppercase tracking-widest underline underline-offset-4">Ir a las preguntas &rarr;</button>
                                        </div>
                                    )}
                                    <button className="w-full py-4 bg-gray-50 text-gray-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all">
                                        Marcar como visto
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

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
            <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${liked ? 'bg-red-50 text-red-500' : 'bg-gray-100/50 text-gray-400 group-hover/btn:bg-red-50 group-hover/btn:text-red-500'
                }`}>
                <Heart className={`w-4 h-4 transition-transform ${liked ? 'fill-red-500 scale-110' : 'scale-100'}`} />
            </div>
            <span className={`text-[12px] font-bold transition-colors ${liked ? 'text-red-500' : 'text-gray-400 group-hover/btn:text-red-500'}`}>
                {likes}
            </span>
        </button>
    );
}
