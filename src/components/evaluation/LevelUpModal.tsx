'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronsUp, ChevronsDown, Sparkles } from 'lucide-react';

interface LevelModalProps {
  banda: number;
  title: string;
  type: 'up' | 'down';
  onClose: () => void;
}

const CONFETTI_COUNT = 16;
const CONFETTI_COLORS = ['#fbbf24', '#a855f7', '#22d3ee', '#f472b6', '#84cc16', '#fb923c'];

export default function LevelModal({ banda, title, type, onClose }: LevelModalProps) {
  useEffect(() => {
    if (type === 'up') {
      const audio = new Audio('/audios/sounds-effect/Random_levelup.ogg');
      audio.volume = 0.5;
      audio.play().catch((e) => console.error('Error playing sound', e));
    }

    const timer = setTimeout(() => onClose(), 3000);
    return () => clearTimeout(timer);
  }, [onClose, type]);

  const isUp = type === 'up';

  // Pre-compute confetti positions once per mount via lazy useState initializer
  // (lazy init is the React-blessed way to run impure code once, not useMemo).
  const [confetti] = useState(() =>
    Array.from({ length: CONFETTI_COUNT }).map((_, i) => {
      const angle = (i / CONFETTI_COUNT) * Math.PI * 2;
      const distance = 140 + Math.random() * 60;
      return {
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        rotate: Math.random() * 360,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      };
    })
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 } as never}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.7, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 22 } as never}
          onClick={(e) => e.stopPropagation()}
          className={`relative bg-white rounded-[2.5rem] p-8 md:p-10 max-w-sm w-full overflow-hidden shadow-2xl ${
            isUp ? 'shadow-purple-500/30' : 'shadow-gray-500/30'
          }`}
        >
          {/* Confetti / particles */}
          {isUp && (
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              {confetti.map((p, i) => (
                <motion.span
                  key={i}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                  animate={{ x: p.x, y: p.y, opacity: 0, scale: 1, rotate: p.rotate }}
                  transition={{ duration: 1.4, delay: 0.1, ease: 'easeOut' } as never}
                  className="absolute top-1/2 left-1/2 w-2 h-3 rounded-sm"
                  style={{ backgroundColor: p.color }}
                />
              ))}
            </div>
          )}

          {/* Blur background glow */}
          <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full blur-3xl pointer-events-none ${
              isUp ? 'bg-purple-200/60' : 'bg-gray-200/60'
            }`}
          />

          <div className="relative flex flex-col items-center text-center">
            {/* Badge */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.15 } as never}
              className={`relative w-24 h-24 rounded-3xl flex items-center justify-center mb-5 shadow-xl ${
                isUp
                  ? 'bg-gradient-to-br from-[#632EB0] to-[#4E248B] shadow-purple-500/40 text-white'
                  : 'bg-gradient-to-br from-gray-500 to-gray-700 shadow-gray-500/40 text-white'
              }`}
            >
              {isUp ? <ChevronsUp className="w-12 h-12" strokeWidth={3} /> : <ChevronsDown className="w-12 h-12" strokeWidth={3} />}
              {isUp && (
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' } as never}
                  className="absolute -inset-2 rounded-3xl border-2 border-purple-200/50 border-dashed"
                />
              )}
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35 } as never}
            >
              <p className={`text-[10px] font-black uppercase tracking-[0.3em] mb-1 ${isUp ? 'text-[#632EB0]' : 'text-gray-500'}`}>
                {isUp ? '¡Subiste de nivel!' : 'Nivel reducido'}
              </p>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tighter">
                Banda {banda}
              </h2>
              <p className="text-sm font-bold text-gray-500 mt-1 flex items-center justify-center gap-1.5">
                {isUp && <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
                &ldquo;{title}&rdquo;
              </p>
            </motion.div>

            {/* Dots */}
            <div className="mt-6 flex gap-2">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 } as never}
                  className={`w-2 h-2 rounded-full ${isUp ? 'bg-[#632EB0]' : 'bg-gray-500'}`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
