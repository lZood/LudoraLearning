'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText, Gamepad2, Headphones, ClipboardCheck, MessageSquare, Award, Check, Layers, Loader2, BookOpen, PenTool, Mic, Volume2, MessagesSquare } from 'lucide-react';
import { useParams } from 'next/navigation';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import MobileSubHeader from '@/components/dashboard/MobileSubHeader';
import { createClient } from '@/utils/supabase/client';

const TYPE_META: Record<string, { icon: React.ElementType; subtitle: string; isFinal?: boolean }> = {
  theory:   { icon: FileText, subtitle: 'Teoría' },
  exercise: { icon: Gamepad2, subtitle: 'Práctica' },
  audio:    { icon: Headphones, subtitle: 'Listening' },
  midterm:  { icon: ClipboardCheck, subtitle: 'Repaso' },
  chat:     { icon: MessageSquare, subtitle: 'Conversación' },
  final:    { icon: Award, subtitle: 'Final de unidad', isFinal: true },
};

const SKILL_META: Record<string, { icon: React.ElementType; subtitle: string }> = {
  listening: { icon: Headphones, subtitle: 'Listening' },
  reading: { icon: BookOpen, subtitle: 'Reading' },
  writing: { icon: PenTool, subtitle: 'Writing' },
  speaking: { icon: Mic, subtitle: 'Speaking' },
  pronunciation: { icon: Volume2, subtitle: 'Pronunciation' },
  conversation: { icon: MessagesSquare, subtitle: 'Conversación' },
  simple: { icon: Gamepad2, subtitle: 'Repaso y juego' },
};

type Act = { id: string; type: string; skill?: string | null; title: string; xp_reward: number; completed: boolean };

const metaFor = (a: Act) => (a.skill && SKILL_META[a.skill]) || TYPE_META[a.type] || TYPE_META.theory;
const hrefFor = (a: Act, unitExt: string) => a.type === 'lesson'
  ? `/portal-alumno/dashboard/leccion/${a.id}`
  : `/portal-alumno/dashboard/unidad/${unitExt}/actividad/${a.id}`;

export default function UnitViewPage() {
  const params = useParams();
  const id = params.id as string;
  const supabase = createClient();

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [unitId, setUnitId] = useState<string | null>(null);
  const [unitTitle, setUnitTitle] = useState('');
  const [levelTitle, setLevelTitle] = useState('');
  const [activities, setActivities] = useState<Act[]>([]);
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const activeRef = useRef<HTMLDivElement>(null);
  const [showHeader, setShowHeader] = useState(true);
  const lastY = useRef(0);

  // Al cargar el mapa: empieza ARRIBA y luego baja con scroll suave hasta la actividad actual
  // (se ve el recorrido del avance, no aparece ya posicionado).
  useEffect(() => {
    if (loading) return;
    try { window.scrollTo({ top: 0, behavior: 'auto' }); } catch { /* noop */ }
    const t = setTimeout(() => activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 700);
    return () => clearTimeout(t);
  }, [loading]);

  // El header se minimiza al bajar y reaparece al subir.
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0;
      if (y < 48 || y < lastY.current - 2) setShowHeader(true);
      else if (y > lastY.current + 6) setShowHeader(false);
      lastY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMounted(true);
    const mainEl = document.querySelector('main');
    if (mainEl) { mainEl.style.overflow = 'visible'; mainEl.style.overflowX = 'visible'; }

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);

      const { data: unit } = await supabase
        .from('units')
        .select('id, title, level_id')
        .eq('external_id', id)
        .maybeSingle();
      if (!unit) { setMissing(true); setLoading(false); return; }
      setUnitId(unit.id);
      setUnitTitle(unit.title);

      const { data: level } = await supabase.from('levels').select('title').eq('id', unit.level_id).maybeSingle();
      setLevelTitle(level?.title ?? '');

      const { data: acts } = await supabase
        .from('activities')
        .select('id, type, skill, title, xp_reward, order_index')
        .eq('unit_id', unit.id)
        .order('order_index');

      let progressIds = new Set<string>();
      if (user && acts && acts.length) {
        const { data: prog } = await supabase
          .from('user_activity_progress')
          .select('activity_id, completed_at')
          .eq('user_id', user.id)
          .in('activity_id', acts.map((a) => a.id));
        progressIds = new Set((prog ?? []).filter((p) => p.completed_at).map((p) => p.activity_id as string));
      }

      const mapped: Act[] = (acts ?? []).map((a) => ({
        id: a.id as string,
        type: a.type as string,
        skill: (a.skill as string) ?? null,
        title: a.title as string,
        xp_reward: (a.xp_reward as number) ?? 10,
        completed: progressIds.has(a.id as string),
      }));
      setActivities(mapped);
      const firstIncomplete = mapped.findIndex((a) => !a.completed);
      setCurrentActivityIndex(firstIncomplete === -1 ? mapped.length : firstIncomplete);
      setLoading(false);
    })();

    return () => { if (mainEl) { mainEl.style.overflow = ''; mainEl.style.overflowX = ''; } };
  }, [id]);

  if (loading) {
    return <div className="min-h-screen bg-white flex items-center justify-center"><Loader2 className="w-8 h-8 text-[#632EB0] animate-spin" /></div>;
  }
  if (missing) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-xl font-black text-gray-900">Unidad no encontrada</p>
        <Link href="/portal-alumno/dashboard/cursos" className="bg-[#632EB0] text-white font-bold px-6 py-3 rounded-2xl">Volver a cursos</Link>
      </div>
    );
  }

  const allDone = currentActivityIndex >= activities.length;
  const currentActivity = activities[currentActivityIndex];
  const unitNum = id.includes('-') ? id.split('-')[1] : id;

  return (
    <motion.div
      initial={{ x: '-100%' }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', damping: 30, stiffness: 300, mass: 0.8 }}
      className="min-h-screen bg-white pb-32 overflow-x-hidden"
    >
      <MobileSubHeader hideNav={true} />

      <div className={`md:hidden sticky top-[52px] left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-100 px-4 py-3 flex items-center justify-between gap-3 shadow-sm transition-transform duration-300 ${showHeader ? 'translate-y-0' : '-translate-y-[200%]'}`}>
        <Link href="/portal-alumno/dashboard/cursos" className="flex items-center gap-2 min-w-0 active:scale-95">
          <span className="p-1 hover:bg-gray-100 rounded-full transition-colors"><ArrowLeft className="w-6 h-6 text-black" /></span>
          <span className="flex flex-col min-w-0">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-0.5">{levelTitle.split(':')[0]}</span>
            <span className="text-sm font-black text-black leading-tight truncate max-w-[180px]">Unidad {unitNum} - {unitTitle}</span>
          </span>
        </Link>
        <Link href="/portal-alumno/dashboard" className="shrink-0 font-black text-[#632EB0] text-lg tracking-tight active:scale-95">Ludora</Link>
      </div>

      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 flex flex-col md:flex-row gap-8 lg:gap-16 items-start relative pt-8">
        <div className="w-full md:w-[380px] lg:w-[400px] flex-shrink-0 md:sticky md:top-24 flex flex-col gap-6 z-20">
          <Link href="/portal-alumno/dashboard/cursos" className="hidden md:inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-bold">
            <ArrowLeft className="w-6 h-6 text-black" />
            <div className="flex flex-col ml-2">
              <span className="text-gray-500 font-bold text-sm tracking-wide">{levelTitle.split(':')[0]}</span>
              <h1 className="text-3xl md:text-3xl lg:text-4xl font-extrabold text-black tracking-tight" style={{ fontFamily: 'Inter, sans-serif' }}>Unidad {unitNum} - {unitTitle}</h1>
            </div>
          </Link>

          <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="w-full aspect-[4/3] bg-gray-200 rounded-xl relative flex items-center justify-center mb-6 group">
              <div className="w-0 h-0 border-t-[20px] border-t-transparent border-l-[32px] border-l-black border-b-[20px] border-b-transparent ml-2"></div>
            </div>

            <h3 className="text-xl font-bold text-black mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>¿Qué vas a aprender?</h3>
            <p className="text-[13px] leading-relaxed text-black/80 font-medium mb-6">
              Esta unidad refuerza vocabulario y estructuras prácticas para comunicarte con confianza en situaciones reales de juego.
            </p>

            <div className="flex items-center gap-6 mb-8 text-black/70 text-xs font-bold">
              <div className="flex items-center gap-2"><Layers className="w-4 h-4" /><span>{activities.length} actividades</span></div>
              <div className="flex items-center gap-2"><Check className="w-4 h-4" /><span>{activities.filter((a) => a.completed).length} completadas</span></div>
            </div>

            <div className="border border-gray-100 rounded-3xl p-4 flex flex-col items-center gap-3">
              <span className="text-sm font-bold text-black text-center">
                {allDone ? '¡Unidad completada! 🎉' : currentActivity?.title}
              </span>
              {allDone ? (
                <button disabled className="w-full bg-gray-100 text-gray-400 font-semibold py-3 rounded-2xl">Completada ✓</button>
              ) : currentActivity ? (
                <Link href={hrefFor(currentActivity, id)} className="w-full bg-[#632EB0] hover:bg-[#522594] text-white font-semibold py-3 rounded-2xl transition-colors active:scale-95 shadow-lg shadow-purple-500/10 text-center block">
                  Empezar
                </Link>
              ) : null}
            </div>
          </div>
        </div>

        <div className="w-full flex-1 relative flex flex-col pt-4 md:pt-[100px] mb-32 z-10 px-8 sm:px-0">
          <div className="flex flex-col items-center justify-start w-full gap-8">
            {activities.map((activity, index) => {
              const meta = metaFor(activity);
              const ActIcon = meta.icon;
              const isCompleted = activity.completed;
              const isActive = index === currentActivityIndex;
              const isLocked = index > currentActivityIndex;
              const isEven = index % 2 === 0;
              const offsetClass = isEven ? '-translate-x-3 sm:-translate-x-12 lg:-translate-x-24' : 'translate-x-3 sm:translate-x-12 lg:translate-x-24';

              return (
                <div key={activity.id} ref={index === currentActivityIndex ? activeRef : null} className="relative flex flex-col items-center w-full min-h-[140px] md:min-h-[180px]">
                  <div className={`flex items-center gap-4 md:gap-6 w-full justify-center relative z-10 ${offsetClass}`}>
                    {isEven && <div className="flex-1 flex justify-end opacity-0 pointer-events-none hidden md:flex"></div>}
                    {!isEven && (
                      <div className="flex-1 flex flex-col items-end text-right pr-2">
                        <h4 className={`font-black text-[14px] md:text-[15px] leading-tight ${isLocked ? 'text-gray-200' : 'text-[#1c244b]'}`}>{activity.title}</h4>
                        <p className={`text-[10px] md:text-[11px] font-bold mt-1 ${isLocked ? 'text-gray-200' : 'text-gray-400'}`}>{meta.subtitle}</p>
                      </div>
                    )}

                    {isLocked ? (
                      <div className="relative flex items-center justify-center flex-shrink-0">
                        <div className="w-14 h-14 md:w-[68px] md:h-[68px] rounded-full flex items-center justify-center relative z-10 border-b-4 bg-gray-100 border-gray-200">
                          <ActIcon className="w-7 h-7 md:w-8 md:h-8 text-gray-300" />
                        </div>
                      </div>
                    ) : (
                      <Link href={hrefFor(activity, id)} className="relative flex items-center justify-center flex-shrink-0">
                        {isActive && <div className="absolute inset-[-8px] border-2 border-[#632EB0]/10 rounded-full z-0 animate-pulse"></div>}
                        {isActive && !isCompleted && (
                          <motion.div initial={{ opacity: 0, y: 6, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.35, type: 'spring', stiffness: 300 }}
                            className="absolute -top-7 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap bg-[#632EB0] text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-lg">¡Aquí vas! ✨</motion.div>
                        )}
                        <motion.div
                          initial={isActive ? { scale: 0.5 } : false}
                          animate={isActive ? { scale: [0.5, 1.18, 1] } : {}}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                          className={`w-14 h-14 md:w-[68px] md:h-[68px] rounded-full flex items-center justify-center relative z-10 border-b-4 ${
                            isCompleted ? 'bg-[#88e04f] border-[#6dc536]' : 'bg-[#632EB0] border-[#4E248B]'
                          } active:scale-95 cursor-pointer hover:scale-105`}>
                          {isCompleted ? <Check className="w-8 h-8 text-white" strokeWidth={3} /> : <ActIcon className="w-7 h-7 md:w-8 md:h-8 text-white" />}
                        </motion.div>
                      </Link>
                    )}

                    {isEven && (
                      <div className="flex-1 flex flex-col items-start text-left pl-2">
                        <h4 className={`font-black text-[14px] md:text-[15px] leading-tight ${isLocked ? 'text-gray-200' : 'text-[#1c244b]'}`}>{activity.title}</h4>
                        <p className={`text-[10px] md:text-[11px] font-bold mt-1 ${isLocked ? 'text-gray-200' : 'text-gray-400'}`}>{meta.subtitle}</p>
                      </div>
                    )}
                    {!isEven && <div className="flex-1 flex justify-start opacity-0 pointer-events-none hidden md:flex"></div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {mounted && !allDone && currentActivity && createPortal(
        <div className="fixed bottom-6 left-0 right-0 z-[999] pointer-events-none px-4 flex justify-center w-full">
          <div className="w-full max-w-[1200px] flex md:justify-end justify-center px-4 sm:px-6">
            <div className="bg-white/95 backdrop-blur-xl border border-gray-100 rounded-[2rem] p-4 shadow-[0_8px_40px_rgba(0,0,0,0.15)] pointer-events-auto flex flex-col items-center justify-center gap-3 w-full max-w-[350px] mr-0 md:mr-16 lg:mr-24">
              <h3 className="text-black font-bold text-[15px] text-center">{currentActivity.title}</h3>
              <Link href={hrefFor(currentActivity, id)} className="w-full bg-[#632EB0] hover:bg-[#522594] text-white font-semibold py-3 px-8 rounded-2xl text-[15px] transition-colors text-center block">
                Empezar
              </Link>
            </div>
          </div>
        </div>,
        document.body
      )}
    </motion.div>
  );
}
