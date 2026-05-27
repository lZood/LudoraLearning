'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Sparkles, ArrowRight } from 'lucide-react';

interface CompletionTransitionProps {
  onSeeResults: () => void;
  userName?: string;
}

const PHRASES = [
  '¡Lo lograste!',
  '¡Misión cumplida!',
  '¡Aventura completa!',
  '¡Bien hecho!',
];

export default function CompletionTransition({ onSeeResults, userName }: CompletionTransitionProps) {
  const [phraseIdx, setPhraseIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setPhraseIdx((i) => (i + 1) % PHRASES.length), 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative w-full min-h-screen bg-white flex items-center justify-center overflow-hidden px-4 py-10">
      {/* Background blur orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-200/30 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-amber-100/40 blur-[140px] rounded-full pointer-events-none" />

      {/* Floating sparkles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 12 }).map((_, i) => {
          const left = (i * 83) % 100;
          const delay = i * 0.4;
          const duration = 4 + (i % 3);
          return (
            <motion.span
              key={i}
              initial={{ y: '110vh', opacity: 0 }}
              animate={{ y: '-10vh', opacity: [0, 1, 0] }}
              transition={{ duration, delay, repeat: Infinity, ease: 'easeOut' } as never}
              className="absolute text-amber-400"
              style={{ left: `${left}%` }}
            >
              <Sparkles className="w-4 h-4" />
            </motion.span>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' } as never}
        className="relative z-10 max-w-xl w-full"
      >
        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-[0_20px_60px_rgba(99,46,176,0.08)] p-8 md:p-12 text-center flex flex-col items-center">
          {/* Trophy with bounce */}
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.2 } as never}
            className="relative mb-6"
          >
            <div className="absolute inset-0 bg-amber-200/60 blur-2xl rounded-full scale-110" />
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' } as never}
              className="relative w-28 h-28 rounded-[2rem] bg-gradient-to-br from-amber-400 via-orange-400 to-orange-500 flex items-center justify-center shadow-2xl shadow-orange-500/40"
            >
              <Trophy className="w-14 h-14 text-white" strokeWidth={2.5} />
            </motion.div>
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 14, repeat: Infinity, ease: 'linear' } as never}
              className="absolute -inset-3 rounded-[2.5rem] border-2 border-amber-200 border-dashed"
            />
          </motion.div>

          {/* Rotating headline */}
          <motion.p
            key={phraseIdx}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[11px] font-black text-[#632EB0] uppercase tracking-[0.3em] mb-3"
          >
            {PHRASES[phraseIdx]}
          </motion.p>

          <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter leading-tight mb-4">
            {userName ? `Excelente, ${userName.split(' ')[0]}` : 'Completaste tu evaluación'}
          </h2>
          <p className="text-gray-500 font-medium text-base max-w-md mx-auto mb-8">
            Tu perfil de aventurero ya está listo. Vamos a revelar tu Banda, tus habilidades y la ruta que sigue.
          </p>

          <motion.button
            onClick={onSeeResults}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-[#632EB0] hover:bg-[#522594] text-white font-black tracking-tight shadow-lg shadow-purple-500/20 transition-all"
          >
            Ver resultados
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>

          <p className="mt-6 text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">
            Hemos analizado todas tus respuestas
          </p>
        </div>
      </motion.div>
    </div>
  );
}
