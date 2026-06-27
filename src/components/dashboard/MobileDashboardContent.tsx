'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { Zap, Play, Flame, CheckCircle2, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';
import MobileSubHeader from './MobileSubHeader';
import type { DashboardStats } from '@/app/portal-alumno/dashboard/page';

interface MobileDashboardContentProps {
  bandaNumber: string;
  bandaTitle: string;
  isPremium: boolean;
  lastUnit: { id: string; title: string; progress: number };
  stats: DashboardStats;
}

export default function MobileDashboardContent({ bandaNumber, bandaTitle, lastUnit, stats }: MobileDashboardContentProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="flex flex-col gap-4 pb-48">
      <MobileSubHeader />

      <div className="px-4 flex flex-col gap-5 pt-1">
        {/* Saludo + banda */}
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">¡Hola, {stats.name}! 👋</h1>
          <div className="inline-flex items-center gap-1.5 mt-1.5 px-3 py-1 bg-purple-50 rounded-full">
            <GraduationCap className="w-3.5 h-3.5 text-[#632EB0]" />
            <span className="text-[11px] font-black text-[#632EB0] uppercase tracking-wide">Nivel {bandaNumber} · {bandaTitle}</span>
          </div>
        </div>

        {/* Tira de estadísticas reales */}
        <div className="grid grid-cols-3 gap-2.5">
          <Stat icon={<Flame className="w-5 h-5 text-orange-500" />} value={stats.streak} label="Racha" tint="bg-orange-50" />
          <Stat icon={<Zap className="w-5 h-5 text-blue-500" />} value={stats.todayXp} label="XP hoy" tint="bg-blue-50" />
          <Stat icon={<CheckCircle2 className="w-5 h-5 text-[#58a700]" />} value={stats.unitsCompleted} label="Unidades" tint="bg-green-50" />
        </div>

        {/* Continuar unidad */}
        <div className="flex flex-col items-center text-center gap-3 py-1">
          <div className="flex flex-col gap-0.5">
            <span className="text-[#632EB0] font-black text-[10px] uppercase tracking-[0.2em]">Continúa donde quedaste</span>
            <h2 className="text-xl font-black text-gray-900 tracking-tight">{lastUnit.title}</h2>
          </div>
          <div className="relative w-full aspect-square max-w-[200px] max-h-[28vh] flex items-center justify-center">
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="w-36 h-36 bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(99,46,176,0.12)] flex items-center justify-center border border-purple-50 relative z-10">
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 bg-[#632EB0] rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-purple-200">
                  <Play className="w-8 h-8 text-white fill-white ml-1" />
                </div>
                <div className="h-1.5 w-20 bg-gray-100 rounded-full overflow-hidden mt-3">
                  <div className="h-full bg-[#632EB0] rounded-full" style={{ width: `${lastUnit.progress}%` }} />
                </div>
              </div>
            </motion.div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-52 h-52 bg-purple-200/20 blur-3xl rounded-full" />
          </div>
        </div>

        {/* Botón flotante de continuar (portal) */}
        {mounted && createPortal(
          <div className="fixed bottom-[95px] left-0 right-0 z-[990] pointer-events-none px-4 flex justify-center w-full md:hidden">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-[400px] pointer-events-auto">
              <Link href={`/portal-alumno/dashboard/unidad/${lastUnit.id}`} data-tour="continuar"
                className="w-full bg-[#632EB0] hover:bg-[#522594] text-white font-black py-4 rounded-2xl text-[15px] transition-all active:scale-[0.98] shadow-[0_8px_30px_rgba(99,46,176,0.35)] flex items-center justify-center gap-2">
                <Play className="w-5 h-5 fill-white" /> Continuar Unidad
              </Link>
            </motion.div>
          </div>,
          document.body
        )}
      </div>
    </div>
  );
}

function Stat({ icon, value, label, tint }: { icon: React.ReactNode; value: number; label: string; tint: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 bg-white border border-gray-100 rounded-2xl py-3.5 shadow-sm">
      <div className={`w-9 h-9 rounded-xl ${tint} flex items-center justify-center`}>{icon}</div>
      <span className="text-xl font-black text-gray-900 leading-none">{value.toLocaleString('es-MX')}</span>
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-wide">{label}</span>
    </div>
  );
}
