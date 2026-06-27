'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Zap, Play, Star, GraduationCap, BookOpen, Flame, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import type { DashboardStats } from '@/app/portal-alumno/dashboard/page';

interface DesktopDashboardContentProps {
  bandaNumber: string;
  bandaTitle: string;
  isPremium: boolean;
  lastUnit: { id: string; title: string; progress: number };
  stats: DashboardStats;
}

export default function DesktopDashboardContent({ bandaNumber, bandaTitle, lastUnit, stats }: DesktopDashboardContentProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } } };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } as any } };

  if (!mounted) return <div className="min-h-[80vh]" />;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible"
      className="relative w-full min-h-[calc(100vh-80px)] flex flex-col items-center justify-center overflow-hidden py-10 md:py-16 px-4">
      {/* Fondo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-purple-100/20 blur-[150px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/40 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-50/40 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="relative w-full max-w-7xl flex flex-col items-center">
        {/* Saludo + unidad */}
        <motion.div variants={itemVariants} className="text-center mb-10 md:mb-14 max-w-2xl px-4">
          <span className="text-[#632EB0] font-black text-[10px] md:text-xs uppercase tracking-[0.35em] mb-3 block">
            ¡Hola, {stats.name}! · Nivel {bandaNumber} · {bandaTitle}
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-[1.15] mb-4">
            {lastUnit.title}
          </h1>
          <p className="text-gray-500 font-medium text-base md:text-lg leading-relaxed max-w-xl mx-auto">
            Continúa donde lo dejaste y sigue sumando XP en tu aventura.
          </p>
        </motion.div>

        {/* Widgets orbitales */}
        <div className="w-full flex flex-col xl:flex-row items-center justify-center xl:justify-between gap-8 md:gap-12 px-4">
          {/* IZQUIERDA: racha + XP hoy (real) */}
          <motion.div variants={itemVariants} className="hidden xl:flex flex-col items-center gap-5 w-52 order-2 xl:order-1">
            <SideStat icon={<Flame className="w-6 h-6 text-orange-500" />} tint="bg-orange-50 border-orange-100" label="Racha" value={`${stats.streak} ${stats.streak === 1 ? 'día' : 'días'}`} />
            <SideStat icon={<Zap className="w-6 h-6 text-blue-500" />} tint="bg-blue-50 border-blue-100" label="XP de hoy" value={`${stats.todayXp.toLocaleString('es-MX')} XP`} />
          </motion.div>

          {/* CENTRO: círculo de progreso de la unidad */}
          <motion.div variants={itemVariants} className="flex flex-col items-center order-1 xl:order-2">
            <div className="relative group p-2 md:p-4">
              <div className="absolute inset-0 pointer-events-none scale-110">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="1.5" fill="transparent" className="text-gray-100" />
                  <motion.circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="2" fill="transparent" strokeLinecap="round" strokeDasharray="289"
                    initial={{ strokeDashoffset: 289 }} animate={{ strokeDashoffset: 289 - (lastUnit.progress / 100) * 289 }}
                    transition={{ duration: 1.8, ease: 'circOut', delay: 0.5 } as any} className="text-[#632EB0]" />
                </svg>
              </div>
              <Link href={`/portal-alumno/dashboard/unidad/${lastUnit.id}`} data-tour="continuar">
                <motion.div whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 400, damping: 15 } as any}
                  className="w-48 h-48 md:w-64 md:h-64 bg-white rounded-full shadow-[0_30px_60px_rgba(99,46,176,0.1)] border-4 border-white flex items-center justify-center relative z-10 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none" />
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-[#632EB0] rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/40 relative group-hover:scale-110 transition-transform duration-500">
                    <Play className="w-10 h-10 md:w-14 md:h-14 text-white fill-white ml-2" />
                  </div>
                </motion.div>
              </Link>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 md:w-80 md:h-80 bg-purple-400/5 blur-[60px] rounded-full group-hover:bg-purple-400/20 transition-all duration-1000" />
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="mt-6 md:mt-10 flex flex-col items-center gap-2">
              <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Pulsa para continuar · {lastUnit.progress}%</p>
              <div className="w-px h-6 md:h-8 bg-gradient-to-b from-purple-200 to-transparent" />
            </motion.div>
          </motion.div>

          {/* DERECHA: unidades completadas (real) */}
          <motion.div variants={itemVariants} className="hidden xl:flex flex-col items-center gap-5 w-52 order-3">
            <SideStat icon={<CheckCircle2 className="w-6 h-6 text-[#58a700]" />} tint="bg-green-50 border-green-100" label="Unidades" value={`${stats.unitsCompleted}`} />
          </motion.div>
        </div>

        {/* Footer navegación */}
        <motion.div variants={itemVariants} className="mt-12 md:mt-16 lg:mt-20 flex items-center gap-8 md:gap-12 text-gray-400">
          <Link href="/portal-alumno/dashboard/cursos" className="flex items-center gap-2 text-xs md:text-sm font-bold hover:text-[#632EB0] transition-colors">
            <BookOpen className="w-3.5 h-3.5 md:w-4 md:h-4" /> <span>Mapa de Unidades</span>
          </Link>
          <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-gray-100 rounded-full" />
          <Link href="/portal-alumno/dashboard/leaderboards" className="flex items-center gap-2 text-xs md:text-sm font-bold hover:text-orange-500 transition-colors">
            <Star className="w-3.5 h-3.5 md:w-4 md:h-4" /> <span>Ranking</span>
          </Link>
          <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-gray-100 rounded-full" />
          <Link href="/portal-alumno/dashboard/perfil" className="flex items-center gap-2 text-xs md:text-sm font-bold hover:text-blue-500 transition-colors">
            <GraduationCap className="w-3.5 h-3.5 md:w-4 md:h-4" /> <span>Mi Progreso</span>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}

function SideStat({ icon, tint, label, value }: { icon: React.ReactNode; tint: string; label: string; value: string }) {
  return (
    <div className="bg-white/70 backdrop-blur-xl border border-white p-5 rounded-[2.5rem] shadow-xl shadow-black/[0.03] w-full text-center">
      <div className={`w-12 h-12 ${tint} border rounded-2xl flex items-center justify-center mx-auto mb-3`}>{icon}</div>
      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <span className="text-2xl font-black text-gray-900">{value}</span>
    </div>
  );
}
