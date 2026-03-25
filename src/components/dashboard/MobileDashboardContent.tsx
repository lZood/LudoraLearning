'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { 
  Newspaper, 
  BookOpen, 
  Video, 
  ChevronRight, 
  Zap,
  Play,
  Star
} from 'lucide-react';
import { motion } from 'framer-motion';

interface MobileDashboardContentProps {
  bandaNumber: string;
  bandaTitle: string;
  isPremium: boolean;
}

function DashboardLogo({ className = "" }: { className?: string }) {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <svg
                viewBox="0 0 184.08 72.96"
                className="h-7 w-auto fill-[#632eaf] shrink-0"
                aria-hidden="true"
            >
                <g>
                    <path d="M172.51,0H11.57C5.18,0,0,5.18,0,11.57v27.75c0,6.39,5.18,11.57,11.57,11.57l146.64,.96c1.83,.01,3.32-1.47,3.32-3.3h0c0-1.82-1.48-3.3-3.3-3.3l-146.66,.04c-3.29,0-5.96-2.67-5.96-5.96V11.57c0-3.29,2.67-5.96,5.96-5.96H172.51c3.29,0,5.96,2.67,5.96,5.96V45.09c0,5.04-1.93,5.48-4.22,6.28-4.53,1.58-4.99,3.68-5.29,4.22-2.07,3.95-.07,11.69,7.67,17.37-2.88-4.78-3.61-8.74-3.83-11.03-.18-1.95,.01-2.77,.4-3.43,1.47-2.55,5.03-1.66,7.76-3.81,1.33-1.05,2.82-3.09,3.12-7.52V11.57c0-6.39-5.18-11.57-11.57-11.57Z" />
                    <g>
                        <path d="M137.88,26.91h-3.93v-1.15s6.73-.36,6.73-5.41v-1.81s-.13-5.94-6.96-5.94h-14.76v25.87h6.2v-9.2h9.84v9.2h6.12v-8.3c0-.82-.31-1.58-.81-2.15-.6-.67-1.47-1.1-2.44-1.1Zm-12.92-3.08v-6.25h7.85c2.03,0,2.16,1.99,2.16,1.99v1.7c0,2.39-2.59,2.56-2.59,2.56h-7.41Z" />
                        <path d="M164.21,38.46h6.47l-9.49-26h-9.04l-9.13,26h6.47l2.15-6.85h10.38l2.18,6.85Zm-11.06-11.64l2.9-9.22h1.51l2.94,9.22h-7.35Z" />
                    </g>
                    <g>
                        <path d="M76.18,11.88h-12.33v25.86h12.33c6.19,0,11.2-5.02,11.2-11.2v-3.46c0-6.19-5.02-11.2-11.2-11.2Zm5.6,14.66c0,3.09-2.51,5.6-5.6,5.6h-6.73v-14.65h6.73c3.09,0,5.6,2.51,5.6,5.6v3.46Z" />
                        <path d="M104.37,11.88h-3.16c-6.28,0-11.37,5.09-11.37,11.37v3.12c0,6.28,5.09,11.37,11.37,11.37h3.16c6.19,0,11.2-5.02,11.2-11.2v-3.46c0-6.19-5.02-11.2-11.2-11.2Zm5.6,14.66c0,3.09-2.51,5.6-5.6,5.6h-3.16c-3.18,0-5.76-2.58-5.76-5.76v-3.12c0-3.18,2.58-5.76,5.76-5.76h3.16c3.09,0,5.6,2.51,5.6,5.6v3.46Z" />
                    </g>
                    <g>
                        <path d="M20.94,12.11h-5.61v23.36c0,1.55,1.26,2.81,2.81,2.81h15.17v-5.61h-12.38V12.11Z" />
                        <path d="M54.67,12.11v15.51c0,3.08-2.51,5.59-5.6,5.59h-1.69c-3.18,0-5.77-2.58-5.77-5.76V12.11h-5.61v15.34c0,6.28,5.09,11.37,11.37,11.37h1.69c6.19,0,11.2-5.02,11.2-11.2V12.11h-5.61Z" />
                    </g>
                </g>
            </svg>
        </div>
    );
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
    <div className="flex flex-col gap-6 px-4 pt-8 pb-40">
      
      {/* HEADER SECTION: XP - LOGO - STREAK (3-Column Grid for Perfect Centering) */}
      <div className="grid grid-cols-3 items-center w-full px-2 mb-4">
          <div className="flex justify-start">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-blue-600 font-extrabold text-[10px]">
                <Star className="w-3 h-3 fill-blue-500" />
                <span>150 XP</span>
            </div>
          </div>
          
          <div className="flex justify-center">
            <DashboardLogo />
          </div>

          <div className="flex justify-end">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-full text-yellow-600 font-extrabold text-[10px]">
                <Zap className="w-3 h-3 fill-yellow-500" />
                <span>1</span>
            </div>
          </div>
      </div>

      {/* 1. TOP BUTTONS: Independent Cards */}
      <div className="grid grid-cols-3 gap-3 w-full">
        <Link 
          href="/portal-alumno/dashboard/noticias"
          className="flex flex-col items-center justify-center py-4 px-2 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-[2rem] shadow-sm transition-all active:scale-95 text-gray-400 hover:text-[#632EB0]"
        >
          <Newspaper className="w-6 h-6 mb-1.5" strokeWidth={2} />
          <span className="text-[11px] font-bold">Noticias</span>
        </Link>

        <Link 
          href="/portal-alumno/dashboard/materiales"
          className="flex flex-col items-center justify-center py-4 px-2 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-[2rem] shadow-sm transition-all active:scale-95 text-gray-400 hover:text-[#632EB0]"
        >
          <BookOpen className="w-6 h-6 mb-1.5" strokeWidth={2} />
          <span className="text-[11px] font-bold">Materiales</span>
        </Link>

        <Link 
          href="/portal-alumno/dashboard/videos"
          className="flex flex-col items-center justify-center py-4 px-2 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-[2rem] shadow-sm transition-all active:scale-95 text-gray-400 hover:text-[#632EB0]"
        >
          <Video className="w-6 h-6 mb-1.5" strokeWidth={2} />
          <span className="text-[11px] font-bold">Videos</span>
        </Link>
      </div>

      {/* 2. CENTER: LAST UNIT CARD */}
      <div className="flex flex-col items-center text-center gap-6 py-4 mt-4">
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

      {/* 3. FLOATING ACTION BUTTON (PORTAL) */}
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
  );
}
