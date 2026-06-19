'use client';

import React, { useEffect, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import {
  Sparkles,
  Trophy,
  ArrowRight,
  Compass,
  ScrollText,
  Backpack,
  BookOpen,
  Headphones,
  PenTool,
  Mic,
  Eye,
  Check,
  X,
  ChevronDown,
  ListChecks,
} from 'lucide-react';
import { QuestionLevel, QuestionCategory } from '@/app/portal-alumno/evaluacion/questions';

const LEVEL_PROGRESSION: QuestionLevel[] = ['Pre-A1', 'A1', 'A1-alto', 'A2', 'A2-alto', 'B1'];

const getBandaFromLevel = (level: QuestionLevel | null): number => {
  if (!level) return 1;
  switch (level) {
    case 'Pre-A1':
    case 'A1':
      return 1;
    case 'A1-alto':
    case 'A2':
      return 2;
    case 'A2-alto':
    case 'B1':
      return 3;
    default:
      return 1;
  }
};

const BAND_META: Record<number, { title: string; gradient: string; ring: string; chip: string }> = {
  1: { title: 'Iniciación Inmersiva', gradient: 'from-blue-400 to-blue-500', ring: 'shadow-blue-500/30', chip: 'bg-blue-50 text-blue-700' },
  2: { title: 'Básico Funcional', gradient: 'from-emerald-400 to-emerald-500', ring: 'shadow-emerald-500/30', chip: 'bg-emerald-50 text-emerald-700' },
  3: { title: 'Aventurero Independiente', gradient: 'from-amber-400 to-orange-500', ring: 'shadow-orange-500/30', chip: 'bg-orange-50 text-orange-700' },
};

const CATEGORY_META: Record<
  QuestionCategory,
  { icon: LucideIcon; tone: string; bar: string; bg: string; label: string }
> = {
  'Gramática y Vocabulario': { icon: BookOpen, tone: 'text-[#632EB0]', bar: 'from-[#632EB0] to-purple-400', bg: 'bg-purple-50', label: 'Gramática' },
  'Comprensión Auditiva': { icon: Headphones, tone: 'text-blue-600', bar: 'from-blue-500 to-blue-400', bg: 'bg-blue-50', label: 'Escucha' },
  'Producción Escrita': { icon: PenTool, tone: 'text-amber-600', bar: 'from-amber-500 to-amber-400', bg: 'bg-amber-50', label: 'Escritura' },
  'Producción Oral': { icon: Mic, tone: 'text-pink-600', bar: 'from-pink-500 to-pink-400', bg: 'bg-pink-50', label: 'Oral' },
  'Identificación Visual': { icon: Eye, tone: 'text-teal-600', bar: 'from-teal-500 to-teal-400', bg: 'bg-teal-50', label: 'Visual' },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 260, damping: 24 } as never,
  },
};

// Animated number counter
function AnimatedNumber({ value, duration = 1.2 }: { value: number; duration?: number }) {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) => Math.round(latest));
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const unsub = rounded.on('change', (v) => setDisplay(v));
    const controls = animate(motionValue, value, { duration, ease: 'easeOut' });
    return () => {
      unsub();
      controls.stop();
    };
  }, [value, duration, motionValue, rounded]);

  return <>{display}</>;
}

interface AdventurerReportProps {
  calculatedBanda: number | null;
  finalCategoryLevels: Record<QuestionCategory, QuestionLevel> | null;
  evaluationHistory: Array<{
    question: string;
    category: string;
    userAnswer: string;
    isCorrect: boolean;
    feedback: string | null;
    level: QuestionLevel;
  }>;
  isCheckingOut: boolean;
  handleCheckout: () => void;
  error: string | null;
  aiOracleVerdict?: string;
  achievements?: Array<{ title: string; icon: string }>;
}

export default function AdventurerReport({
  calculatedBanda,
  finalCategoryLevels,
  evaluationHistory,
  handleCheckout,
  error,
  aiOracleVerdict,
  achievements = [],
}: AdventurerReportProps) {
  const [showAllMissions, setShowAllMissions] = useState(false);

  const visibleHistory = showAllMissions ? evaluationHistory : evaluationHistory.slice(0, 5);
  const groupedMissions = visibleHistory.reduce((acc, item) => {
    const banda = getBandaFromLevel(item.level);
    if (!acc[banda]) acc[banda] = [];
    acc[banda].push(item);
    return acc;
  }, {} as Record<number, typeof evaluationHistory>);
  const sortedBands = Object.keys(groupedMissions).map(Number).sort((a, b) => a - b);

  const defaultVision =
    '¡Gran trabajo, aventurero! He analizado tu desempeño a lo largo de las pruebas. Posees una base sólida que promete mucho potencial. Tu próxima meta será afianzar ese conocimiento para comunicarte de manera más fluida con los aldeanos y sortear obstáculos de nivel intermedio con total seguridad.';

  const banda = calculatedBanda ?? 1;
  const bandaInfo = BAND_META[banda] ?? BAND_META[1];

  // Stats
  const totalAnswers = evaluationHistory.length;
  const correctAnswers = evaluationHistory.filter((e) => e.isCorrect).length;
  const accuracy = totalAnswers ? Math.round((correctAnswers / totalAnswers) * 100) : 0;

  return (
    <div className="relative w-full bg-white min-h-screen overflow-x-hidden">
      {/* Background orbs */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-purple-100/30 blur-[150px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-amber-100/30 blur-[140px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-emerald-50/40 blur-[120px] rounded-full pointer-events-none -z-10" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 flex flex-col gap-8"
      >
        {/* HERO */}
        <motion.div variants={itemVariants} className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50 border border-purple-100 mb-6">
            <Trophy className="w-4 h-4 text-[#632EB0]" />
            <span className="text-[10px] font-black text-[#632EB0] uppercase tracking-[0.3em]">
              Reporte de Habilidades
            </span>
          </div>

          <div className="flex flex-col items-center gap-5">
            <motion.div
              initial={{ scale: 0, rotate: -25 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 16, delay: 0.3 } as never}
              className={`relative w-28 h-28 md:w-32 md:h-32 rounded-[2rem] bg-gradient-to-br ${bandaInfo.gradient} flex items-center justify-center shadow-2xl ${bandaInfo.ring}`}
            >
              <span className="text-white font-black text-5xl md:text-6xl tracking-tighter drop-shadow-sm">
                {banda}
              </span>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 14, repeat: Infinity, ease: 'linear' } as never}
                className="absolute -inset-2 rounded-[2.5rem] border-2 border-white/60 border-dashed"
              />
            </motion.div>

            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-1">
                Banda alcanzada
              </p>
              <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter leading-tight">
                {bandaInfo.title}
              </h1>
            </div>

            {/* Quick stats chips */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
              <div className="px-4 py-2 bg-white border border-gray-100 rounded-2xl flex items-center gap-2 shadow-sm">
                <ListChecks className="w-4 h-4 text-[#632EB0]" />
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Respuestas</p>
                  <p className="text-base font-black text-gray-900 leading-tight">
                    <AnimatedNumber value={totalAnswers} />
                  </p>
                </div>
              </div>
              <div className="px-4 py-2 bg-white border border-gray-100 rounded-2xl flex items-center gap-2 shadow-sm">
                <Check className="w-4 h-4 text-emerald-500" />
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Aciertos</p>
                  <p className="text-base font-black text-gray-900 leading-tight">
                    <AnimatedNumber value={correctAnswers} />
                  </p>
                </div>
              </div>
              <div className="px-4 py-2 bg-white border border-gray-100 rounded-2xl flex items-center gap-2 shadow-sm">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Precisión</p>
                  <p className="text-base font-black text-gray-900 leading-tight">
                    <AnimatedNumber value={accuracy} />%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ORACLE NARRATIVE */}
        <motion.div variants={itemVariants}>
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_8px_30px_rgba(99,46,176,0.06)] p-6 md:p-8 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-100/40 blur-3xl rounded-full" />
            <div className="relative flex items-start gap-4 md:gap-6">
              <div className="shrink-0 relative">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-[#632EB0] to-[#4E248B] flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <img
                    src="/images/evaluacion/oraculo.webp"
                    alt="Oráculo"
                    className="w-12 h-12 md:w-14 md:h-14 object-contain [image-rendering:pixelated]"
                  />
                </div>
                <motion.span
                  animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' } as never}
                  className="absolute -inset-1 rounded-2xl border-2 border-[#632EB0]/40"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-[#632EB0] uppercase tracking-[0.3em] mb-1">
                  Visión de Ludora
                </p>
                <h3 className="text-lg md:text-xl font-black text-gray-900 tracking-tight mb-3">
                  Lectura del Oráculo
                </h3>
                <p className="text-gray-600 font-medium text-sm md:text-base leading-relaxed italic">
                  &ldquo;{aiOracleVerdict || defaultVision}&rdquo;
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* SKILL BARS */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-6 md:p-8 h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                  <Compass className="w-5 h-5 text-[#632EB0]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900 tracking-tight">Estadísticas Académicas</h3>
                  <p className="text-xs text-gray-400 font-bold">Tu desempeño por habilidad</p>
                </div>
              </div>

              {finalCategoryLevels && (
                <div className="space-y-5">
                  {(Object.entries(finalCategoryLevels) as [QuestionCategory, QuestionLevel][]).map(
                    ([category, level], i) => {
                      const meta = CATEGORY_META[category];
                      const lvlIndex = LEVEL_PROGRESSION.indexOf(level);
                      const lvlPct = ((lvlIndex + 1) / LEVEL_PROGRESSION.length) * 100;
                      const catBanda = getBandaFromLevel(level);
                      const catLabel = catBanda === 1 ? 'Iniciación' : catBanda === 2 ? 'Funcional' : 'Avanzado';

                      return (
                        <motion.div
                          key={category}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + i * 0.08 } as never}
                          className="flex flex-col gap-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-7 h-7 ${meta.bg} rounded-lg flex items-center justify-center`}>
                                <meta.icon className={`w-3.5 h-3.5 ${meta.tone}`} />
                              </div>
                              <span className="text-sm font-black text-gray-800 tracking-tight">
                                {meta.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                {level}
                              </span>
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${meta.bg} ${meta.tone}`}>
                                {catLabel}
                              </span>
                            </div>
                          </div>
                          <div className="relative w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${lvlPct}%` }}
                              transition={{ duration: 1.1, delay: 0.5 + i * 0.08, ease: 'easeOut' } as never}
                              className={`h-full bg-gradient-to-r ${meta.bar} rounded-full relative`}
                            >
                              <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent rounded-full" />
                            </motion.div>
                          </div>
                        </motion.div>
                      );
                    }
                  )}
                </div>
              )}
            </div>
          </motion.div>

          {/* RIGHT COLUMN: Next mission + Achievements */}
          <motion.div variants={itemVariants} className="lg:col-span-1 flex flex-col gap-6">
            {/* Next Mission */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-[2.5rem] border border-orange-100 p-6 md:p-7 relative overflow-hidden">
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-orange-200/30 blur-2xl rounded-full" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-xl flex items-center justify-center shadow-sm">
                    <ScrollText className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-gray-900 tracking-tight">Siguientes pasos</h3>
                    <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Tu próxima misión</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 font-medium leading-relaxed">
                  Para subir de banda, tu reto en la <strong className="text-orange-600">Banda {banda}</strong> es
                  superar los desafíos recurrentes y aplicar lo aprendido en situaciones menos controladas.
                </p>
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-6 md:p-7">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <Backpack className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-900 tracking-tight">Mochila de Logros</h3>
                  <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Has desbloqueado</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {(achievements.length > 0
                  ? achievements
                  : [
                      { title: 'Estructuras Base Dominadas', icon: '★' },
                      { title: 'Comprensión de Instrucciones', icon: '★' },
                    ]
                ).map((achievement, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + idx * 0.1 } as never}
                    whileHover={{ y: -2 }}
                    className="group flex items-center gap-3 p-3 rounded-2xl bg-emerald-50/60 hover:bg-emerald-50 border border-emerald-100 transition-all"
                  >
                    <div className="shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-black text-base shadow-sm">
                      {achievement.icon}
                    </div>
                    <p className="text-xs font-black text-emerald-900 leading-tight tracking-tight uppercase">
                      {achievement.title}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* HISTORY ACCORDION */}
        <motion.div variants={itemVariants}>
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-base font-black text-gray-900 tracking-tight">Registro de Evaluación</h3>
                <p className="text-xs text-gray-400 font-bold">Cada respuesta con su feedback</p>
              </div>
            </div>

            <div className="space-y-6">
              {sortedBands.map((b) => (
                <div key={b} className="flex flex-col gap-3">
                  <h4 className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
                    <span className={`inline-block w-1.5 h-1.5 rounded-full bg-gradient-to-br ${BAND_META[b]?.gradient ?? BAND_META[1].gradient}`} />
                    Preguntas de Banda {b}
                  </h4>
                  <div className="flex flex-col gap-2">
                    {groupedMissions[b].map((item, idx) => (
                      <HistoryItem key={`${b}-${idx}`} item={item} />
                    ))}
                  </div>
                </div>
              ))}

              {evaluationHistory.length > 5 && (
                <div className="flex justify-center pt-2">
                  <button
                    onClick={() => setShowAllMissions(!showAllMissions)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-black uppercase tracking-wider transition-all"
                  >
                    {showAllMissions ? 'Ocultar detalles' : `Ver ${evaluationHistory.length - 5} más`}
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform ${showAllMissions ? 'rotate-180' : ''}`}
                    />
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* ERROR */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold text-center"
          >
            {error}
          </motion.div>
        )}

        {/* CTA */}
        <motion.div variants={itemVariants}>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#632EB0] to-[#4E248B] p-8 md:p-12 text-center shadow-2xl shadow-purple-500/25">
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 blur-3xl rounded-full" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-300/20 blur-3xl rounded-full" />

            <div className="relative flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center mb-5">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl md:text-4xl font-black text-white tracking-tighter mb-3">
                Tu aventura comienza ahora
              </h3>
              <p className="text-white/80 font-medium text-sm md:text-base max-w-xl mb-7">
                Preparamos tu ruta de aprendizaje basada en tu desempeño. Tienes acceso a los 3 primeros niveles de la{' '}
                <strong className="text-white">Banda {banda}</strong> gratis.
              </p>
              <motion.button
                onClick={handleCheckout}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white text-[#632EB0] font-black tracking-tight shadow-lg shadow-black/10 transition-all hover:shadow-xl"
              >
                Ir al portal del alumno
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

// ===================== HistoryItem =====================

function HistoryItem({ item }: { item: AdventurerReportProps['evaluationHistory'][number] }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`rounded-2xl border transition-all ${
        open ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50/50 hover:bg-gray-50'
      }`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-3 md:p-4 text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span
            className={`shrink-0 flex items-center justify-center w-7 h-7 rounded-lg text-white text-xs font-black ${
              item.isCorrect ? 'bg-emerald-500' : 'bg-red-500'
            }`}
          >
            {item.isCorrect ? <Check className="w-4 h-4" strokeWidth={3} /> : <X className="w-4 h-4" strokeWidth={3} />}
          </span>
          <div className="min-w-0">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none">
              {item.category}
            </p>
            <p className="text-sm font-bold text-gray-700 truncate mt-0.5">{item.question}</p>
          </div>
        </div>
        <ChevronDown
          className={`shrink-0 w-4 h-4 text-gray-300 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' } as never}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 flex flex-col gap-3">
              <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                  Tu respuesta
                </p>
                <p className="text-sm text-gray-700 italic">&ldquo;{item.userAnswer}&rdquo;</p>
              </div>
              {item.feedback && (
                <div className="rounded-xl bg-indigo-50/50 border border-indigo-100 p-3">
                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">
                    Feedback del Oráculo
                  </p>
                  <p className="text-sm text-indigo-900 font-medium leading-relaxed">{item.feedback}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
