'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Zap, 
  Play, 
  Medal, 
  Star, 
  ChevronRight, 
  GraduationCap, 
  BookOpen,
  Type
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DesktopDashboardContentProps {
  bandaNumber: string;
  bandaTitle: string;
  isPremium: boolean;
  lastUnit: { id: string; title: string; progress: number };
}

export default function DesktopDashboardContent({
  bandaNumber,
  bandaTitle,
  isPremium,
  lastUnit: propLastUnit
}: DesktopDashboardContentProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const lastUnit = {
    id: propLastUnit.id,
    title: propLastUnit.title,
    level: `NIVEL ${bandaNumber}`,
    progress: propLastUnit.progress,
    activity: 'Continuar',
    description: 'Continúa donde lo dejaste y sigue sumando XP en tu aventura.'
  };

  const nextClass = {
    time: 'Hoy, 18:30',
    title: 'Práctica de Listening',
    instructor: 'Alex R.'
  };

  const ranking = {
    position: 4,
    league: 'Rubí',
    totalUsers: 250
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transition: { type: "spring", stiffness: 300, damping: 24 } as any
    }
  };

  if (!mounted) return <div className="min-h-[80vh]" />;

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative w-full min-h-[calc(100vh-80px)] flex flex-col items-center justify-center overflow-hidden py-10 md:py-16 px-4"
    >
      {/* --- BACKGROUND DECORATION --- */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-purple-100/20 blur-[150px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/40 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-50/40 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* --- CONTENT LAYOUT --- */}
      <div className="relative w-full max-w-7xl flex flex-col items-center">
        
        {/* TOP: Header Info */}
        <motion.div variants={itemVariants} className="text-center mb-10 md:mb-16 max-w-2xl px-4">
          <span className="text-[#632EB0] font-black text-[10px] md:text-xs uppercase tracking-[0.4em] mb-4 md:mb-6 block">
            {lastUnit.level}
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-[1.15] mb-4 md:mb-6">
            {lastUnit.title}
          </h1>
          <p className="text-gray-500 font-medium text-base md:text-lg lg:text-xl leading-relaxed max-w-xl mx-auto">
            {lastUnit.description}
          </p>
        </motion.div>

        {/* CENTER SECTION: ORBITAL WIDGETS */}
        <div className="w-full flex flex-col xl:flex-row items-center justify-center xl:justify-between gap-8 md:gap-12 px-4">
          
          {/* LEFT: RANKING INSIGHT */}
          <motion.div variants={itemVariants} className="hidden xl:flex flex-col items-center gap-6 w-48 order-2 xl:order-1">
             <div className="bg-white/60 backdrop-blur-xl border border-white p-5 rounded-[2.5rem] shadow-xl shadow-black/[0.03] w-full text-center group hover:scale-105 transition-all">
                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-orange-100">
                  <Star className="w-6 h-6 text-orange-400 fill-orange-400" />
                </div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Ranking</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-2xl font-black text-gray-900">#{ranking.position}</span>
                  <span className="text-[9px] font-bold text-gray-400">/{ranking.totalUsers}</span>
                </div>
                <div className="mt-3 px-3 py-1 bg-[#632EB0]/5 rounded-full text-[9px] font-black text-[#632EB0] uppercase">
                  Liga {ranking.league}
                </div>
             </div>
             
             {/* Small secondary stat */}
             <div className="bg-white/40 backdrop-blur-md border border-white/50 px-4 py-2 rounded-2xl flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-gray-500">12 alumnos activos</span>
             </div>
          </motion.div>

          {/* CENTER: PROGRESS CIRCLE */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col items-center order-1 xl:order-2"
          >
            <div className="relative group p-2 md:p-4">
               {/* Arc Progress Ring */}
               <div className="absolute inset-0 pointer-events-none scale-110">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  <circle
                    cx="50" cy="50" r="46"
                    stroke="currentColor" strokeWidth="1.5" fill="transparent"
                    className="text-gray-100"
                  />
                  <motion.circle
                    cx="50" cy="50" r="46"
                    stroke="currentColor" strokeWidth="2" fill="transparent"
                    strokeLinecap="round" strokeDasharray="289"
                    initial={{ strokeDashoffset: 289 }}
                    animate={{ strokeDashoffset: 289 - (lastUnit.progress / 100) * 289 }}
                    transition={{ duration: 1.8, ease: "circOut", delay: 0.5 } as any}
                    className="text-[#632EB0]"
                  />
                </svg>
               </div>

               {/* Main Visual Component - CLICKABLE */}
               <Link href={`/portal-alumno/dashboard/unidad/${lastUnit.id}`}>
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 } as any}
                  className="w-48 h-48 md:w-64 md:h-64 bg-white rounded-full shadow-[0_30px_60px_rgba(99,46,176,0.1)] border-4 border-white flex items-center justify-center relative z-10 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none" />
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-[#632EB0] rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/40 relative group-hover:scale-110 transition-transform duration-500">
                    <Play className="w-10 h-10 md:w-14 md:h-14 text-white fill-white ml-2" />
                  </div>
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/[0.02] transition-colors" />
                </motion.div>
               </Link>

               {/* Glow Effect */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 md:w-80 md:h-80 bg-purple-400/5 blur-[60px] rounded-full group-hover:bg-purple-400/20 transition-all duration-1000" />
            </div>

            {/* Resume Label below circle */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="mt-6 md:mt-10 flex flex-col items-center gap-2"
            >
              <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Pulsa para continuar</p>
              <div className="w-px h-6 md:h-8 bg-gradient-to-b from-purple-200 to-transparent" />
            </motion.div>
          </motion.div>

          {/* RIGHT: NEXT CLASS INSIGHT */}
          <motion.div variants={itemVariants} className="hidden xl:flex flex-col items-center gap-6 w-56 order-3">
             <div className="bg-white/60 backdrop-blur-xl border border-white p-5 rounded-[2.5rem] shadow-xl shadow-black/[0.03] w-full group hover:scale-105 transition-all">
                <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center mb-3 border border-purple-100">
                  <Play className="w-6 h-6 text-[#632EB0]" />
                </div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Próxima Clase</p>
                <div className="text-left">
                  <span className="text-base font-black text-gray-900 leading-tight block truncate">{nextClass.title}</span>
                  <span className="text-[11px] font-bold text-[#632EB0] mt-1 block">{nextClass.time}</span>
                </div>
                
                <button className="mt-5 w-full py-2.5 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-wider hover:bg-[#632EB0] transition-colors">
                  Reservar Lugar
                </button>
             </div>

             {/* Instructor bit */}
             <div className="bg-white/40 backdrop-blur-md border border-white/50 px-4 py-2 rounded-2xl flex items-center gap-3">
                <div className="w-7 h-7 bg-gray-200 rounded-full overflow-hidden border border-white">
                   <div className="w-full h-full bg-gradient-to-tr from-purple-500 to-blue-500 opacity-20" />
                </div>
                <span className="text-[10px] font-bold text-gray-500">Con {nextClass.instructor}</span>
             </div>
          </motion.div>

        </div>

        {/* BOTTOM: FOOTER NAVIGATION (Very discrete) */}
        <motion.div 
          variants={itemVariants}
          className="mt-12 md:mt-16 lg:mt-24 flex items-center gap-8 md:gap-12 text-gray-400"
        >
          <Link href="/portal-alumno/dashboard/cursos" className="flex items-center gap-2 text-xs md:sm font-bold hover:text-[#632EB0] transition-colors group">
            <BookOpen className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span>Mapa de Unidades</span>
          </Link>
          <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-gray-100 rounded-full" />
          <Link href="/portal-alumno/dashboard/materiales" className="flex items-center gap-2 text-xs md:sm font-bold hover:text-orange-500 transition-colors">
            <Star className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span>Flashcards</span>
          </Link>
          <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-gray-100 rounded-full" />
          <Link href="/portal-alumno/dashboard/perfil" className="flex items-center gap-2 text-xs md:sm font-bold hover:text-blue-500 transition-colors">
            <GraduationCap className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span>Progreso Total</span>
          </Link>
        </motion.div>

      </div>

    </motion.div>
  );
}
