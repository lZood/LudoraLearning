'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { 
  Zap,
  Play,
} from 'lucide-react';
import { motion } from 'framer-motion';
import MobileSubHeader from './MobileSubHeader';

interface MobileDashboardContentProps {
  bandaNumber: string;
  bandaTitle: string;
  isPremium: boolean;
}

export default function MobileDashboardContent({ 
  bandaNumber, 
  bandaTitle, 
  isPremium 
}: MobileDashboardContentProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const lastUnit = {
    id: 'u1-2',
    title: 'Colores',
    level: `NIVEL ${bandaNumber}`,
    progress: 65,
    activity: 'Conversaciones de audio'
  };

  return (
    <div className="flex flex-col gap-6 pb-40">
      <MobileSubHeader />
      
      <div className="px-4 flex flex-col gap-8">
        {/* 1. CENTER: LAST UNIT CARD */}
        <div className="flex flex-col items-center text-center gap-6 py-4">
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">
              {lastUnit.title}
            </h2>
            <span className="text-[#632EB0] font-black text-sm uppercase tracking-[0.2em]">
              {lastUnit.level}
            </span>
          </div>

          {/* Big Illustration / Icon Plate */}
          <div className="relative w-full aspect-square max-w-[280px] bg-gradient-to-b from-transparent to-purple-50/30 rounded-full flex items-center justify-center">
             <motion.div 
               animate={{ y: [0, -10, 0] }}
               transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
               className="w-48 h-48 bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(99,46,176,0.1)] flex items-center justify-center border border-purple-50 relative z-10"
             >
                <div className="flex flex-col items-center gap-2">
                  <div className="w-20 h-20 bg-purple-600 rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-purple-200">
                    <Play className="w-10 h-10 text-white fill-white ml-1" />
                  </div>
                  <div className="h-2 w-24 bg-gray-100 rounded-full overflow-hidden mt-4">
                    <div className="h-full bg-purple-600 rounded-full" style={{ width: `${lastUnit.progress}%` }}></div>
                  </div>
                </div>
             </motion.div>
             
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-200/20 blur-3xl rounded-full"></div>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full border border-green-100">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <span className="text-xs font-bold text-green-700">¡Buen trabajo hoy!</span>
          </div>
        </div>

        {/* 2. FLOATING ACTION BUTTON (PORTAL) */}
        {mounted && createPortal(
          <div className="fixed bottom-[110px] left-0 right-0 z-[990] pointer-events-none px-4 flex justify-center w-full">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="w-full max-w-[400px] pointer-events-auto"
            >
              <div className="bg-white/95 backdrop-blur-xl border border-gray-100 rounded-[2rem] p-4 shadow-[0_8px_40px_rgba(0,0,0,0.12)] flex flex-col items-center gap-3">
                <div className="flex items-center gap-3 w-full px-2">
                   <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                      <Zap className="w-5 h-5 text-gray-400" />
                   </div>
                   <div className="flex-1 min-w-0 text-left">
                      <p className="text-[13px] text-gray-500 font-bold truncate">Continuar estudiando</p>
                      <p className="text-[15px] text-black font-black truncate">{lastUnit.activity}</p>
                   </div>
                   <div className="w-6 h-6 rounded-full border-2 border-purple-200 flex items-center justify-center shrink-0">
                      <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                   </div>
                </div>
                
                <Link 
                  href={`/portal-alumno/dashboard/unidad/${lastUnit.id}`}
                  className="w-full bg-[#632EB0] hover:bg-[#522594] text-white font-black py-4 rounded-2xl text-[16px] transition-all active:scale-[0.98] shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
                >
                  Continuar Unidad
                </Link>
              </div>
            </motion.div>
          </div>,
          document.body
        )}
      </div>
    </div>
  );
}
