'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Play, FileText, Gamepad2, Headphones, ClipboardCheck, MessageSquare, Award, Check, Layers } from 'lucide-react';
import { notFound, useParams } from 'next/navigation';
import { COURSE_DATA, Unit, Level } from '@/constants/courseData';

import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';

const ACTIVITIES = [
  { id: 1, title: 'Teoría', icon: FileText, type: 'theory' },
  { id: 2, title: 'Actividades', icon: Gamepad2, type: 'practice' },
  { id: 3, title: 'Conversaciones de audio', subtitle: 'Listening', icon: Headphones, type: 'audio' },
  { id: 4, title: 'Examen parcial', subtitle: 'Sobre lo estudiado', icon: ClipboardCheck, type: 'quiz' },
  { id: 5, title: 'Actividad de Chat', subtitle: 'Simulación práctica', icon: MessageSquare, type: 'chat' },
  { id: 6, title: 'Evaluación final', subtitle: 'Final de unidad', icon: Award, type: 'exam', isFinal: true },
];

export default function UnitViewPage() {
  const params = useParams();
  const id = params.id as string;

  const [unitData, setUnitData] = useState<{ unit: Unit; level: Level } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    let foundUnit = null;
    let foundLevel = null;
    for (const level of COURSE_DATA) {
      const un = level.units.find(u => u.id === id);
      if (un) {
        foundUnit = un;
        foundLevel = level;
        break;
      }
    }
    if (foundUnit && foundLevel) {
      setUnitData({ unit: foundUnit, level: foundLevel });
    }

    // Workaround: Fix layout constraints that break sticky/fixed elements
    const mainEl = document.querySelector('main');
    if (mainEl) {
      mainEl.style.overflow = 'visible';
      mainEl.style.overflowX = 'visible';
    }
    const animatedDivs = document.querySelectorAll('.animate-in');
    animatedDivs.forEach((el) => {
      (el as HTMLElement).style.transform = 'none';
    });

    return () => {
      if (mainEl) {
        mainEl.style.overflow = '';
        mainEl.style.overflowX = '';
      }
    };
  }, [id]);

  if (!unitData) {
    return <div className="min-h-screen bg-white"></div>;
  }

  const { unit, level } = unitData;

  // Static mock states for the design demonstration
  const currentActivityIndex = 2; // 0-based index (Conversaciones de audio is active)

  return (
    <motion.div 
      initial={{ x: '-100%' }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', damping: 30, stiffness: 300, mass: 0.8 }}
      className="min-h-screen bg-white pb-32 overflow-x-hidden"
    >
      {/* MOBILE STICKY HEADER */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-100 px-4 py-3 flex items-center gap-4 shadow-sm">
        <Link href="/portal-alumno/dashboard/cursos" className="p-1 hover:bg-gray-100 rounded-full transition-colors active:scale-90">
          <ArrowLeft className="w-6 h-6 text-black" />
        </Link>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-0.5">
            {level.title.split(':')[0]}
          </span>
          <h1 className="text-sm font-black text-black leading-tight truncate max-w-[240px]">
            Unidad {unit.id.split('-')[1]} - {unit.title}
          </h1>
        </div>
      </div>

      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 flex flex-col md:flex-row gap-8 lg:gap-16 items-start relative pt-20 md:pt-8">
        
        {/* Left Column: Header + Info Card (Sticky) */}
        <div className="w-full md:w-[380px] lg:w-[400px] flex-shrink-0 md:sticky md:top-24 flex flex-col gap-6 z-20">
          
          {/* Header (Desktop Only) */}
          <Link 
            href="/portal-alumno/dashboard/cursos" 
            className="hidden md:inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-bold"
          >
            <ArrowLeft className="w-6 h-6 text-black" />
            <div className="flex flex-col ml-2">
              <span className="text-gray-500 font-bold text-sm tracking-wide">{level.title.split(':')[0]}</span>
              <h1 className="text-3xl md:text-3xl lg:text-4xl font-extrabold text-black tracking-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
                Unidad {unit.id.split('-')[1]} - {unit.title}
              </h1>
            </div>
          </Link>

          {/* Info Card */}
          <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden">
            
            {/* Video Placeholder */}
            <div className="w-full aspect-[4/3] bg-gray-200 rounded-xl relative flex items-center justify-center cursor-pointer mb-6 group">
              <div className="w-0 h-0 border-t-[20px] border-t-transparent border-l-[32px] border-l-black border-b-[20px] border-b-transparent ml-2 group-hover:scale-110 transition-transform"></div>
            </div>

            {/* Description */}
            <h3 className="text-xl font-bold text-black mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>¿Qué vas a aprender?</h3>
            <p className="text-[13px] leading-relaxed text-black/80 font-medium mb-6">
              Esta unidad se enfoca en el vocabulario esencial y estructuras prácticas para comunicarte con confianza. Descubre cómo aplicar estos conceptos en situaciones reales de juego.
            </p>

            <div className="flex items-center gap-6 mb-8 text-black/70 text-xs font-bold">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                <span>29 Lecciones</span>
              </div>
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-4 h-4" />
                <span>243 Ejercicios</span>
              </div>
            </div>

            {/* Card Internal Button */}
            <div className="border border-gray-100 rounded-3xl p-4 flex flex-col items-center gap-3">
              <span className="text-sm font-bold text-black text-center">
                {ACTIVITIES[currentActivityIndex].title}
              </span>
              <button className="w-full bg-[#632EB0] hover:bg-[#522594] text-white font-semibold py-3 rounded-2xl transition-colors active:scale-95 shadow-lg shadow-purple-500/10">
                Empezar
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Path */}
        <div className="w-full flex-1 relative flex flex-col pt-4 md:pt-[100px] mb-32 z-10 px-8 sm:px-0">
          
          <div className="flex flex-col items-center justify-start w-full gap-8">
            {ACTIVITIES.map((activity, index) => {
              const isCompleted = index < currentActivityIndex;
              const isActive = index === currentActivityIndex;
              const isLocked = index > currentActivityIndex;
              
              // Layout offsets for zigzag - Even smaller for mobile to stay centered
              const isEven = index % 2 === 0; // 0, 2, 4 are left
              const offsetClass = isEven 
                ? '-translate-x-3 sm:-translate-x-12 lg:-translate-x-24' 
                : 'translate-x-3 sm:translate-x-12 lg:translate-x-24';
              
              return (
                <div key={activity.id} className="relative flex flex-col items-center w-full min-h-[140px] md:min-h-[180px]">
                  {/* Node Item */}
                  <div className={`flex items-center gap-4 md:gap-6 w-full justify-center relative z-10 ${offsetClass}`}>
                    
                    {/* Text Right (when Even) - Now with better mobile handling */}
                    {isEven && (
                       <div className="flex-1 flex justify-end opacity-0 pointer-events-none hidden md:flex"></div>
                    )}
                    {!isEven && (
                       <div className="flex-1 flex flex-col items-end text-right pr-2">
                          <h4 className={`font-black text-[14px] md:text-[15px] leading-tight ${isLocked ? 'text-gray-200' : 'text-[#1c244b]'}`}>{activity.title}</h4>
                          {activity.subtitle && <p className={`text-[10px] md:text-[11px] font-bold mt-1 ${isLocked ? 'text-gray-200' : 'text-gray-400'}`}>{activity.subtitle}</p>}
                       </div>
                    )}

                    {/* Icon Node */}
                    <div className="relative flex items-center justify-center flex-shrink-0">
                      {/* Ring for Active */}
                      {isActive && (
                        <div className="absolute inset-[-8px] border-2 border-[#632EB0]/10 rounded-full z-0 animate-pulse"></div>
                      )}
                      
                      {/* Circle - Responsive sizing */}
                      <div className={`w-14 h-14 md:w-[68px] md:h-[68px] rounded-full flex items-center justify-center relative z-10 transition-all border-b-4 ${
                        isCompleted ? 'bg-[#88e04f] border-[#6dc536]' : 
                        isActive ? 'bg-[#632EB0] border-[#4E248B]' : 
                        'bg-gray-100 border-gray-200'
                      } active:scale-95 cursor-pointer`}>
                          {isCompleted ? (
                            <Check className="w-8 h-8 text-white" strokeWidth={3} />
                          ) : (
                            <activity.icon className={`w-7 h-7 md:w-8 md:h-8 ${isLocked ? 'text-gray-300' : 'text-white'}`} />
                          )}
                      </div>
                    </div>

                    {/* Text Left (when Odd) */}
                    {isEven && (
                       <div className="flex-1 flex flex-col items-start text-left pl-2">
                          <h4 className={`font-black text-[14px] md:text-[15px] leading-tight ${isLocked ? 'text-gray-200' : 'text-[#1c244b]'}`}>{activity.title}</h4>
                          {activity.subtitle && <p className={`text-[10px] md:text-[11px] font-bold mt-1 ${isLocked ? 'text-gray-200' : 'text-gray-400'}`}>{activity.subtitle}</p>}
                       </div>
                    )}
                    {!isEven && (
                       <div className="flex-1 flex justify-start opacity-0 pointer-events-none hidden md:flex"></div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* Floating Bottom Bar using React Portal to absolutely ensure it breaks out of any transforms */}
      {mounted && createPortal(
        <div className="fixed bottom-6 left-0 right-0 z-[999] pointer-events-none px-4 flex justify-center w-full">
          <div className="w-full max-w-[1200px] flex md:justify-end justify-center px-4 sm:px-6">
            <div className="bg-white/95 backdrop-blur-xl border border-gray-100 rounded-[2rem] p-4 shadow-[0_8px_40px_rgba(0,0,0,0.15)] pointer-events-auto flex flex-col items-center justify-center gap-3 w-full max-w-[350px] mr-0 md:mr-16 lg:mr-24">
                <h3 className="text-black font-bold text-[15px] text-center">
                  {ACTIVITIES[currentActivityIndex].title}
                </h3>
                <button className="w-full bg-[#632EB0] hover:bg-[#522594] text-white font-semibold py-3 px-8 rounded-2xl text-[15px] transition-colors">
                   Empezar
                </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </motion.div>
  );
}
