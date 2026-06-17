'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Zap, Newspaper, BookOpen, Video, GraduationCap, Calendar } from 'lucide-react';
import { usePathname } from 'next/navigation';
import HapticTrigger, { HapticHandle } from '@/components/ui/HapticTrigger';
import { useGamification } from '@/lib/useGamification';

function DashboardLogo() {
    return (
        <svg
            viewBox="0 0 184.08 72.96"
            className="h-6 w-auto fill-[#632eaf] shrink-0"
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
    );
}

interface MobileSubHeaderProps {
  hideNav?: boolean;
}

export default function MobileSubHeader({ hideNav = false }: MobileSubHeaderProps) {
  const pathname = usePathname();
  const hapticRef = useRef<HapticHandle>(null);
  const g = useGamification(); // XP, racha, monedas reales

  const triggerHaptic = () => {
    hapticRef.current?.trigger();
  };

  const navItems = [
    { title: 'Noticias', icon: Newspaper, href: '/portal-alumno/dashboard/noticias' },
    { title: 'Materiales', icon: BookOpen, href: '/portal-alumno/dashboard/materiales' },
    { title: 'Videos', icon: Video, href: '/portal-alumno/dashboard/videos' },
  ];

  return (
    <>
      <HapticTrigger ref={hapticRef} />
      {/* 1. FIXED TOP BAR: XP - LOGO - STREAK (Always Visible) */}
      <div className="sticky top-0 z-[110] w-full bg-white/95 backdrop-blur-xl border-b border-gray-100 grid grid-cols-3 items-center px-4 pt-5 pb-4 shadow-sm md:hidden">
          <div className="flex justify-start">
            <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-100 rounded-full text-blue-600 font-black text-[9px]">
                <Star className="w-2.5 h-2.5 fill-blue-500" />
                <span>{(g?.xp ?? 0).toLocaleString('es-MX')} XP</span>
            </div>
          </div>

          <Link href="/portal-alumno/dashboard" className="flex justify-center" aria-label="Inicio">
            <DashboardLogo />
          </Link>

          <div className="flex justify-end">
            <div className="flex items-center gap-1 px-2 py-1 bg-yellow-50 border border-yellow-200 rounded-full text-yellow-600 font-black text-[9px]">
                <Zap className="w-2.5 h-2.5 fill-yellow-500" />
                <span>{g?.streak ?? 0}</span>
            </div>
          </div>
      </div>

      {/* 2. NAVIGATION BUTTONS (Always Visible) */}
      {!hideNav && (
        <div className="sticky top-[56px] left-0 right-0 z-[100] px-4 pt-4 md:hidden bg-white/50 backdrop-blur-md pb-4 border-b border-gray-50">
          <div className="grid grid-cols-3 gap-2 w-full">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.icon;
              
              return (
                <Link 
                  key={item.href}
                  href={item.href}
                  onClick={triggerHaptic}
                  className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-2xl border transition-all active:scale-95 shadow-lg ${
                    isActive 
                      ? 'bg-purple-50 border-purple-200 text-[#632EB0] shadow-purple-100' 
                      : 'bg-white/90 backdrop-blur-md border-gray-100 text-gray-400 hover:text-[#632EB0]'
                  }`}
                >
                  <Icon className={`w-5 h-5 mb-1 ${isActive ? 'text-[#632EB0]' : ''}`} strokeWidth={isActive ? 3 : 2} />
                  <span className={`text-[10px] font-black ${isActive ? 'text-[#632EB0]' : ''}`}>
                    {item.title}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
