'use client';

import React from 'react';
import { Play, Lock, Clock, Star, Award } from 'lucide-react';
import { motion } from 'framer-motion';

interface VideoCardProps {
    id: number;
    title: string;
    duration: string;
    thumbnail: string;
    level: string; // 'Banda 1', 'Banda 2', etc.
    category: string;
    hasQuiz: boolean;
    isLocked: boolean;
    xpAmount?: number;
    onPlay: (id: number) => void;
}

export default function VideoCard({
    id,
    title,
    duration,
    thumbnail,
    level,
    category,
    hasQuiz,
    isLocked,
    xpAmount = 10,
    onPlay
}: VideoCardProps) {
    return (
        <motion.div 
            whileHover={!isLocked ? { y: -5 } : {}}
            className={`group relative bg-[#F8F9FB] rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-purple-100/50 transition-all duration-300 ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            onClick={() => !isLocked && onPlay(id)}
        >
            {/* Thumbnail Header */}
            <div className="relative aspect-video overflow-hidden">
                <img 
                    src={thumbnail} 
                    alt={title} 
                    className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ${isLocked ? 'grayscale opacity-50' : ''}`}
                />
                
                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Status Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-[#632EB0] text-[10px] font-black rounded-full uppercase tracking-widest border border-white/20 shadow-sm">
                        {category}
                    </span>
                    {hasQuiz && (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-orange-500/90 backdrop-blur-md text-white text-[10px] font-black rounded-full uppercase tracking-widest border border-white/20 shadow-sm animate-pulse">
                            <Award className="w-3 h-3" />
                            <span>+{xpAmount} XP</span>
                        </div>
                    )}
                </div>

                {/* Duration Badge */}
                <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md text-white/90 px-2 py-1 rounded-lg text-[10px] font-black flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{duration}</span>
                </div>

                {/* Locked / Play Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                    {isLocked ? (
                        <div className="w-14 h-14 bg-gray-900/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-2xl">
                            <Lock className="w-6 h-6 text-white" />
                        </div>
                    ) : (
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 shadow-2xl opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                            <Play className="w-7 h-7 text-white fill-white ml-1" />
                        </div>
                    )}
                </div>
            </div>

            {/* Info Section */}
            <div className="p-7">
                <div className="flex items-center gap-2 mb-3">
                    <div className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-tight ${isLocked ? 'bg-gray-100 text-gray-400' : 'bg-purple-100 text-[#632EB0]'}`}>
                        Nivel {level.split(' ')[1] || level}
                    </div>
                    {isLocked && (
                        <span className="text-[10px] font-bold text-gray-400">Desbloqueas en la siguiente Unidad</span>
                    )}
                </div>
                <h3 className={`font-black text-[18px] leading-tight line-clamp-2 mb-2 ${isLocked ? 'text-gray-400' : 'text-gray-900 group-hover:text-[#632EB0] transition-colors'}`}>
                    {title}
                </h3>
                
                {!isLocked && (
                    <div className="mt-4 flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                        <div className="flex items-center gap-1.5">
                            <Star className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
                            <span>Contenido Premium</span>
                        </div>
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[#632EB0]">REPRODUCIR</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
