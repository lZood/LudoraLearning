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
  lastUnit: { id: string; title: string; progress: number };
}

export default function MobileDashboardContent({
  bandaNumber,
  bandaTitle,
  isPremium,
  lastUnit: propLastUnit
}: MobileDashboardContentProps) {
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
    activity: 'Continuar unidad'
  };

  return (
    <div className="flex flex-col gap-4 pb-48">
      <MobileSubHeader />
      
      <div className="px-4 flex flex-col gap-4">
        {/* 1. CENTER: LAST UNIT CARD */}
        <div className="flex flex-col items-center text-center gap-4 py-2">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              {lastUnit.title}
            </h2>
            <span className="text-[#632EB0] font-black text-xs uppercase tracking-[0.2em]">
              {lastUnit.level}
            </span>
          </div>

          {/* Big Illustration / Icon Plate - Height Aware */}
          <div className="relative w-full aspect-square max-w-[250px] max-h-[35vh] bg-gradient-to-b from-transparent to-purple-50/30 rounded-full flex items-center justify-center">
             <motion.div 
               animate={{ y: [0, -8, 0] }}
               transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
               className="w-40 h-40 xs:w-48 xs:h-48 bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(99,46,176,0.1)] flex items-center justify-center border border-purple-50 relative z-10"
             >
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 xs:w-20 xs:h-20 bg-purple-600 rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-purple-200">
                    <Play className="w-8 h-8 xs:w-10 xs:h-10 text-white fill-white ml-1" />
                  </div>
                  <div className="h-1.5 w-20 xs:w-24 bg-gray-100 rounded-full overflow-hidden mt-3 xs:mt-4">
                    <div className="h-full bg-purple-600 rounded-full" style={{ width: `${lastUnit.progress}%` }}></div>
                  </div>
                </div>
             </motion.div>
             
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-purple-200/20 blur-3xl rounded-full"></div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full border border-green-100">
            <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
            <span className="text-[10px] font-bold text-green-700">¡Buen trabajo hoy!</span>
          </div>
        </div>

        {/* 2. FLOATING ACTION BUTTON (PORTAL) */}
        {mounted && createPortal(
          <div className="fixed bottom-[95px] left-0 right-0 z-[990] pointer-events-none px-4 flex justify-center w-full md:hidden">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="w-full max-w-[400px] pointer-events-auto"
            >
              <div className="bg-white/95 backdrop-blur-xl border border-gray-100 rounded-[1.75rem] p-3 shadow-[0_8px_40px_rgba(0,0,0,0.12)] flex flex-col items-center gap-2">
                <div className="flex items-center gap-3 w-full px-2">
                   <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                      <Zap className="w-4 h-4 text-gray-400" />
                   </div>
                   <div className="flex-1 min-w-0 text-left">
                      <p className="text-[11px] text-gray-500 font-bold truncate tracking-tight">Continuar estudiando</p>
                      <p className="text-[14px] text-black font-black truncate">{lastUnit.activity}</p>
                   </div>
                   <div className="w-5 h-5 rounded-full border-2 border-purple-200 flex items-center justify-center shrink-0">
                      <div className="w-2.5 h-2.5 bg-purple-600 rounded-full"></div>
                   </div>
                </div>
                
                <Link 
                  href={`/portal-alumno/dashboard/unidad/${lastUnit.id}`}
                  className="w-full bg-[#632EB0] hover:bg-[#522594] text-white font-black py-3.5 rounded-xl text-[15px] transition-all active:scale-[0.98] shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
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
