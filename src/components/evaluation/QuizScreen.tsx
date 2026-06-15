'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  Square,
  Send,
  RotateCcw,
  SkipForward,
  Zap,
  Flame,
  Settings,
  ChevronRight,
  Play,
  Sparkles,
  Loader2,
  BookOpen,
  Headphones,
  PenTool,
  Eye,
} from 'lucide-react';
import { Question, QuestionLevel, QuestionCategory } from '@/app/portal-alumno/evaluacion/questions';

const CATEGORIES: QuestionCategory[] = [
  'Gramática y Vocabulario',
  'Comprensión Auditiva',
  'Producción Escrita',
  'Producción Oral',
  'Identificación Visual',
];

const CATEGORY_META: Record<QuestionCategory, { short: string; icon: React.ElementType; color: string; bg: string }> = {
  'Gramática y Vocabulario': { short: 'Gramática', icon: BookOpen, color: 'text-[#632EB0]', bg: 'bg-purple-50' },
  'Comprensión Auditiva': { short: 'Escucha', icon: Headphones, color: 'text-blue-600', bg: 'bg-blue-50' },
  'Producción Escrita': { short: 'Escritura', icon: PenTool, color: 'text-amber-600', bg: 'bg-amber-50' },
  'Producción Oral': { short: 'Oral', icon: Mic, color: 'text-pink-600', bg: 'bg-pink-50' },
  'Identificación Visual': { short: 'Visual', icon: Eye, color: 'text-teal-600', bg: 'bg-teal-50' },
};

const LOADING_PHRASES = [
  'Analizando tu respuesta…',
  'Consultando al Oráculo…',
  'Midiendo tu pronunciación…',
  'Revisando cada palabra…',
];

const LEVEL_PROGRESSION: QuestionLevel[] = ['Pre-A1', 'A1', 'A1-alto', 'A2', 'A2-alto', 'B1'];

// ===================== Sub-components =====================

interface XpFloaterData {
  id: number;
  amount: number;
}

function XpFloater({ floaters }: { floaters: XpFloaterData[] }) {
  return (
    <div className="pointer-events-none fixed top-20 left-1/2 -translate-x-1/2 z-50">
      <AnimatePresence>
        {floaters.map((f) => (
          <motion.div
            key={f.id}
            initial={{ y: 30, opacity: 0, scale: 0.6 }}
            animate={{ y: -60, opacity: 1, scale: 1.1 }}
            exit={{ y: -120, opacity: 0, scale: 0.8 }}
            transition={{ duration: 1.4, ease: 'easeOut' } as never}
            className="absolute left-0 -translate-x-1/2 flex items-center gap-1.5 px-4 py-2 bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-black text-sm rounded-full shadow-lg shadow-orange-500/30 whitespace-nowrap"
          >
            <Zap className="w-4 h-4 fill-white" />
            +{f.amount} XP
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function MotivationalToast({ message, id }: { message: string | null; id: number }) {
  return (
    <div className="pointer-events-none fixed top-24 left-1/2 -translate-x-1/2 z-40">
      <AnimatePresence mode="wait">
        {message && (
          <motion.div
            key={id}
            initial={{ y: -20, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -10, opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 } as never}
            className="px-5 py-2 bg-white/90 backdrop-blur-md border border-purple-100 rounded-full shadow-lg shadow-purple-500/10 flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#632EB0]" />
            <span className="text-xs font-black text-gray-900 tracking-tight">{message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StreakBadge({ streak }: { streak: number }) {
  if (streak < 2) return null;
  const milestone = streak >= 10 ? 'legendaria' : streak >= 5 ? 'caliente' : 'iniciando';
  const gradient =
    streak >= 10
      ? 'from-pink-500 via-orange-500 to-yellow-400'
      : streak >= 5
      ? 'from-orange-400 to-red-500'
      : 'from-amber-300 to-orange-400';

  return (
    <motion.div
      key={streak}
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: [0.5, 1.25, 1], opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' } as never}
      className={`flex items-center gap-1.5 pl-2 pr-3 py-1 bg-gradient-to-r ${gradient} text-white rounded-full shadow-md`}
      title={`Racha ${milestone}`}
    >
      <motion.span
        animate={streak >= 5 ? { rotate: [-8, 8, -8] } : {}}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' } as never}
        className="text-base leading-none"
      >
        <Flame className="w-4 h-4 fill-yellow-200" />
      </motion.span>
      <span className="text-xs font-black tabular-nums">{streak}</span>
    </motion.div>
  );
}

interface CategoryDotsProps {
  categoryLevels: Record<QuestionCategory, QuestionLevel>;
  activeCategory: QuestionCategory | null;
  completed: Set<QuestionCategory>;
}

function CategoryDots({ categoryLevels, activeCategory, completed }: CategoryDotsProps) {
  return (
    <div className="flex items-center justify-center gap-2 md:gap-3">
      {CATEGORIES.map((cat) => {
        const meta = CATEGORY_META[cat];
        const isActive = cat === activeCategory;
        const isComplete = completed.has(cat);
        const levelIdx = LEVEL_PROGRESSION.indexOf(categoryLevels[cat]);
        const progress = ((levelIdx + 1) / LEVEL_PROGRESSION.length) * 100;

        return (
          <div
            key={cat}
            className={`group flex flex-col items-center gap-1 transition-all ${isActive ? 'scale-105' : 'opacity-60 hover:opacity-100'}`}
          >
            <div
              className={`relative w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center transition-all ${
                isComplete ? 'bg-green-100 border border-green-200' : isActive ? `${meta.bg} border-2 border-current ${meta.color} shadow-md` : 'bg-gray-50 border border-gray-100'
              }`}
            >
              <meta.icon className={`w-4 h-4 md:w-4.5 md:h-4.5 ${isComplete ? 'text-green-600' : isActive ? meta.color : 'text-gray-400'}`} />
              {isActive && (
                <motion.span
                  animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' } as never}
                  className={`absolute inset-0 rounded-xl border-2 ${meta.color}`}
                />
              )}
            </div>
            <div className="w-9 md:w-10 h-1 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${isComplete ? 'bg-green-500' : 'bg-[#632EB0]'}`}
                initial={false}
                animate={{ width: `${isComplete ? 100 : progress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' } as never}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ===================== Audio Recorder =====================

interface AudioRecorderProps {
  isRecording: boolean;
  showPreview: boolean;
  recordedAudioUrl: string | null;
  isEvaluating: boolean;
  onStart: () => void;
  onStop: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}

function AudioRecorder({
  isRecording,
  showPreview,
  recordedAudioUrl,
  isEvaluating,
  onStart,
  onStop,
  onConfirm,
  onCancel,
}: AudioRecorderProps) {
  return (
    <div className="bg-gray-50/60 border border-gray-100 rounded-3xl p-6 md:p-8">
      {!showPreview ? (
        <div className="flex flex-col items-center text-center">
          <motion.button
            onClick={isRecording ? onStop : onStart}
            disabled={isEvaluating}
            whileHover={{ scale: isEvaluating ? 1 : 1.05 }}
            whileTap={{ scale: 0.9 }}
            className={`relative w-24 h-24 rounded-full flex items-center justify-center text-white mb-5 transition-colors disabled:opacity-50 ${
              isRecording ? 'bg-red-500 shadow-xl shadow-red-500/40' : 'bg-[#632EB0] hover:bg-[#522594] shadow-xl shadow-purple-500/30'
            }`}
          >
            {isRecording && (
              <>
                <span className="absolute inset-0 rounded-full bg-red-500/30 animate-ping" />
                <span className="absolute -inset-2 rounded-full border-2 border-red-300/50 animate-pulse" />
              </>
            )}
            {isRecording ? <Square className="w-9 h-9 fill-white" /> : <Mic className="w-10 h-10" />}
          </motion.button>

          {/* Waveform visualizer */}
          {isRecording && (
            <div className="flex items-end justify-center gap-1 h-8 mb-3">
              {[...Array(7)].map((_, i) => (
                <motion.span
                  key={i}
                  initial={{ height: 8 }}
                  animate={{ height: [8, 24, 12, 28, 10, 22, 8] }}
                  transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut', delay: i * 0.08 } as never}
                  className="w-1.5 rounded-full bg-red-400"
                />
              ))}
            </div>
          )}

          <p className="font-black text-gray-900 text-sm tracking-tight mb-1">
            {isRecording ? 'Grabando…' : 'Toca para grabar'}
          </p>
          <p className="text-xs text-gray-500 font-medium max-w-[260px]">
            {isRecording
              ? 'Habla con claridad. Toca de nuevo para detener.'
              : 'Asegúrate de permitir acceso al micrófono.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center text-center gap-4">
          <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Escucha tu grabación</p>
          <audio src={recordedAudioUrl!} controls className="w-full max-w-md" />
          <div className="grid grid-cols-2 gap-3 w-full max-w-md mt-2">
            <button
              onClick={onCancel}
              className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-white border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-all active:scale-95"
            >
              <RotateCcw className="w-4 h-4" /> Repetir
            </button>
            <button
              onClick={onConfirm}
              className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#632EB0] hover:bg-[#522594] text-white font-bold text-sm transition-all active:scale-95 shadow-lg shadow-purple-500/20"
            >
              <Send className="w-4 h-4" /> Enviar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ===================== Main Quiz Screen =====================

export interface QuizScreenProps {
  currentQuestion: Question | null;
  categoryLevels: Record<QuestionCategory, QuestionLevel>;
  completedCategories: Set<QuestionCategory>;
  currentGlobalBanda: number;
  xpPercentage: number;
  streak: number;
  motivationalMessage: string | null;
  motivationalKey: number;
  xpFloaters: XpFloaterData[];
  isEvaluatingAI: boolean;
  isSaving: boolean;
  error: string | null;
  textInputValue: string;
  setTextInputValue: (v: string) => void;
  isRecording: boolean;
  showAudioPreview: boolean;
  recordedAudioUrl: string | null;
  startRecording: () => void;
  stopRecording: () => void;
  onConfirmAudio: () => void;
  onCancelAudio: () => void;
  // Grading de opción server-side: la página recibe el optionId y consulta grade_choice.
  onChooseOption: (optionId: string, text: string) => void;
  onSubmitText: () => void;
  onSkip: () => void;
  // Dev mode
  showDevMode: boolean;
  toggleDevMode: () => void;
  onSetCategoryLevel: (cat: QuestionCategory, lvl: QuestionLevel) => void;
  onFinishQuiz: () => void;
  onOpenTester: () => void;
}

export default function QuizScreen(props: QuizScreenProps) {
  const {
    currentQuestion,
    categoryLevels,
    completedCategories,
    currentGlobalBanda,
    xpPercentage,
    streak,
    motivationalMessage,
    motivationalKey,
    xpFloaters,
    isEvaluatingAI,
    isSaving,
    error,
    textInputValue,
    setTextInputValue,
    isRecording,
    showAudioPreview,
    recordedAudioUrl,
    startRecording,
    stopRecording,
    onConfirmAudio,
    onCancelAudio,
    onChooseOption,
    onSubmitText,
    onSkip,
    showDevMode,
    toggleDevMode,
    onSetCategoryLevel,
    onFinishQuiz,
    onOpenTester,
  } = props;

  const activeCategory = currentQuestion?.category ?? null;
  const activeMeta = activeCategory ? CATEGORY_META[activeCategory] : null;

  // Rotating loading message
  const [loadingPhraseIdx, setLoadingPhraseIdx] = useState(0);
  useEffect(() => {
    if (!isEvaluatingAI && !isSaving) return;
    const id = setInterval(() => setLoadingPhraseIdx((i) => (i + 1) % LOADING_PHRASES.length), 1800);
    return () => clearInterval(id);
  }, [isEvaluatingAI, isSaving]);

  return (
    <div className="relative w-full min-h-screen bg-white overflow-x-hidden">
      {/* Background blur orbs */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[700px] h-[700px] bg-purple-100/30 blur-[160px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-orange-50/40 blur-[140px] rounded-full pointer-events-none -z-10" />

      {/* Sticky top progress header */}
      <div className="sticky top-0 z-30 bg-white/85 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between gap-3 mb-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 bg-purple-50 rounded-xl flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4 text-[#632EB0] fill-[#632EB0]" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">
                  Experiencia
                </p>
                <p className="text-sm font-black text-gray-900 tracking-tight leading-tight">
                  Banda <span className="text-[#632EB0]">{currentGlobalBanda}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <AnimatePresence>
                {streak >= 2 && <StreakBadge streak={streak} />}
              </AnimatePresence>
              <button
                onClick={toggleDevMode}
                className="text-[9px] font-black text-gray-300 hover:text-orange-500 uppercase tracking-widest transition-colors"
                title="Modo desarrollador"
              >
                Dev
              </button>
            </div>
          </div>

          {/* XP bar */}
          <div className="relative w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#632EB0] to-purple-400 rounded-full"
              initial={false}
              animate={{ width: `${xpPercentage}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' } as never}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse" />
            </motion.div>
          </div>

          {/* Category dots */}
          <div className="mt-3">
            <CategoryDots
              categoryLevels={categoryLevels}
              activeCategory={activeCategory}
              completed={completedCategories}
            />
          </div>
        </div>
      </div>

      {/* Floating feedback layers */}
      <XpFloater floaters={xpFloaters} />
      <MotivationalToast message={motivationalMessage} id={motivationalKey} />

      {/* Main content */}
      <div className="relative w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 md:py-10">
        {/* Dev mode */}
        <AnimatePresence>
          {showDevMode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="bg-orange-50/60 border border-orange-200 rounded-3xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Settings className="w-4 h-4 text-orange-600" />
                  <h3 className="text-xs font-black text-orange-700 uppercase tracking-widest">
                    Modo desarrollador
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  {CATEGORIES.map((cat) => (
                    <div key={cat} className="flex flex-col gap-1">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider">
                        {CATEGORY_META[cat].short}
                      </label>
                      <select
                        value={categoryLevels[cat]}
                        onChange={(e) => onSetCategoryLevel(cat, e.target.value as QuestionLevel)}
                        className="p-2 rounded-xl bg-white border border-orange-200 text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-orange-300"
                      >
                        {LEVEL_PROGRESSION.map((lvl) => (
                          <option key={lvl} value={lvl}>{lvl}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={onFinishQuiz}
                    className="py-2.5 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-black uppercase tracking-wider transition-all active:scale-95"
                  >
                    Finalizar ahora
                  </button>
                  <button
                    onClick={onOpenTester}
                    className="py-2.5 px-4 rounded-xl bg-white hover:bg-orange-50 border border-orange-200 text-orange-600 text-xs font-black uppercase tracking-wider transition-all active:scale-95"
                  >
                    Probador
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold text-center"
          >
            {error}
          </motion.div>
        )}

        {/* Saving full-page state */}
        {isSaving ? (
          <div className="flex flex-col items-center justify-center py-20 gap-6 text-center">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 rounded-full border-[6px] border-purple-100" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.3, repeat: Infinity, ease: 'linear' } as never}
                className="absolute inset-0 rounded-full border-[6px] border-[#632EB0] border-t-transparent"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-9 h-9 text-[#632EB0]" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-gray-900 tracking-tighter">
                ¡Evaluación completada!
              </h3>
              <AnimatePresence mode="wait">
                <motion.p
                  key={loadingPhraseIdx}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="text-sm font-bold text-gray-500"
                >
                  {LOADING_PHRASES[loadingPhraseIdx]}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        ) : isEvaluatingAI ? (
          <div className="flex flex-col items-center justify-center py-20 gap-5 text-center">
            <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-[#632EB0] animate-spin" />
            </div>
            <AnimatePresence mode="wait">
              <motion.p
                key={loadingPhraseIdx}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="text-sm font-black text-[#632EB0] uppercase tracking-widest"
              >
                {LOADING_PHRASES[loadingPhraseIdx]}
              </motion.p>
            </AnimatePresence>
          </div>
        ) : currentQuestion ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ type: 'spring', stiffness: 260, damping: 26 } as never}
              className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.05)] p-6 md:p-10"
            >
              {/* Category label */}
              {activeMeta && activeCategory && (
                <div className="flex items-center gap-2 mb-5">
                  <div className={`w-8 h-8 rounded-lg ${activeMeta.bg} flex items-center justify-center`}>
                    <activeMeta.icon className={`w-4 h-4 ${activeMeta.color}`} />
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${activeMeta.color}`}>
                    {activeCategory}
                  </span>
                  <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-auto">
                    Nivel {categoryLevels[activeCategory]}
                  </span>
                </div>
              )}

              {/* Audio player */}
              {currentQuestion.type === 'audio-listening' && currentQuestion.audioUrl && (
                <div className="mb-6 p-4 bg-purple-50/70 border border-purple-100 rounded-2xl flex items-center gap-3">
                  <div className="shrink-0 w-10 h-10 bg-[#632EB0] rounded-xl flex items-center justify-center text-white">
                    <Play className="w-4 h-4 fill-white ml-0.5" />
                  </div>
                  <audio controls className="w-full" src={currentQuestion.audioUrl}></audio>
                </div>
              )}

              <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight leading-snug mb-7">
                {currentQuestion.text}
              </h2>

              {/* Multiple choice / image / audio */}
              {(currentQuestion.type === 'multiple-choice' ||
                currentQuestion.type === 'audio-listening' ||
                currentQuestion.type === 'image-choice') && (
                <div className={currentQuestion.type === 'image-choice' ? 'grid grid-cols-2 gap-3 md:gap-4' : 'space-y-3'}>
                  {currentQuestion.options?.map((option, idx) => (
                    <motion.button
                      key={option.id ?? idx}
                      onClick={() => onChooseOption(option.id ?? '', option.text)}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      className={`group w-full text-left p-4 md:p-5 rounded-2xl border-2 border-gray-100 hover:border-[#632EB0] hover:bg-purple-50/40 transition-all font-bold text-gray-800 ${
                        currentQuestion.type === 'image-choice' ? 'flex flex-col items-center justify-center text-center' : 'flex items-center gap-3'
                      }`}
                    >
                      {option.imageUrl ? (
                        <img
                          src={option.imageUrl}
                          alt={option.text}
                          className="w-24 h-24 object-contain mb-3 [image-rendering:pixelated]"
                        />
                      ) : (
                        <div className="shrink-0 w-7 h-7 rounded-full border-2 border-gray-200 group-hover:border-[#632EB0] flex items-center justify-center text-[11px] font-black text-gray-400 group-hover:text-[#632EB0] transition-colors">
                          {String.fromCharCode(65 + idx)}
                        </div>
                      )}
                      <span className="flex-1 text-sm md:text-base">{option.text}</span>
                      {currentQuestion.type !== 'image-choice' && (
                        <ChevronRight className="w-4 h-4 text-gray-200 group-hover:text-[#632EB0] transition-colors" />
                      )}
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Text input */}
              {currentQuestion.type === 'text-input' && (
                <div className="space-y-4">
                  <textarea
                    value={textInputValue}
                    onChange={(e) => setTextInputValue(e.target.value)}
                    placeholder="Escribe tu respuesta en inglés…"
                    className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:border-[#632EB0] outline-none min-h-[140px] resize-none text-gray-800 font-medium transition-all bg-gray-50/40 focus:bg-white"
                  />
                  <motion.button
                    onClick={onSubmitText}
                    disabled={textInputValue.trim().length === 0}
                    whileHover={{ scale: textInputValue.trim().length === 0 ? 1 : 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-[#632EB0] hover:bg-[#522594] text-white font-black tracking-tight shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <Send className="w-4 h-4" /> Enviar respuesta
                  </motion.button>
                </div>
              )}

              {/* Audio record */}
              {currentQuestion.type === 'audio-record' && (
                <AudioRecorder
                  isRecording={isRecording}
                  showPreview={showAudioPreview}
                  recordedAudioUrl={recordedAudioUrl}
                  isEvaluating={isEvaluatingAI}
                  onStart={startRecording}
                  onStop={stopRecording}
                  onConfirm={onConfirmAudio}
                  onCancel={onCancelAudio}
                />
              )}

              {/* Skip */}
              {!isRecording && !showAudioPreview && (
                <div className="mt-7 text-center">
                  <button
                    onClick={onSkip}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <SkipForward className="w-3.5 h-3.5" />
                    No lo sé / Saltar pregunta
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        ) : null}
      </div>
    </div>
  );
}
