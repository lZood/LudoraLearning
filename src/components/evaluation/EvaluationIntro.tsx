'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Mic,
  PenTool,
  Headphones,
  Eye,
  BookOpen,
  ArrowRight,
  Timer,
  Compass,
  Zap,
} from 'lucide-react';

interface EvaluationIntroProps {
  onStart: () => void;
  userName?: string;
}

const SKILLS = [
  { name: 'Gramática', icon: BookOpen, color: 'text-[#632EB0]', bg: 'bg-purple-50', ring: 'border-purple-100' },
  { name: 'Comprensión', icon: Headphones, color: 'text-blue-600', bg: 'bg-blue-50', ring: 'border-blue-100' },
  { name: 'Escritura', icon: PenTool, color: 'text-amber-600', bg: 'bg-amber-50', ring: 'border-amber-100' },
  { name: 'Oral', icon: Mic, color: 'text-pink-600', bg: 'bg-pink-50', ring: 'border-pink-100' },
  { name: 'Visual', icon: Eye, color: 'text-teal-600', bg: 'bg-teal-50', ring: 'border-teal-100' },
];

const BANDS = [
  { num: 1, title: 'Iniciación Inmersiva', desc: 'Interacción simple con apoyo.', color: 'from-blue-400 to-blue-500' },
  { num: 2, title: 'Básico Funcional', desc: 'Tareas rutinarias y comunicación directa.', color: 'from-green-400 to-emerald-500' },
  { num: 3, title: 'Aventurero Independiente', desc: 'Justifica planes y negocia soluciones.', color: 'from-amber-400 to-orange-500' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 280, damping: 24 } as never,
  },
};

export default function EvaluationIntro({ onStart, userName }: EvaluationIntroProps) {
  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-white">
      {/* Background blur orbs */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-purple-100/40 blur-[150px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-orange-50/50 blur-[140px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-blue-50/40 blur-[120px] rounded-full pointer-events-none -z-10" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 lg:py-20"
      >
        {/* Top tag */}
        <motion.div variants={itemVariants} className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-100 rounded-full">
            <Sparkles className="w-4 h-4 text-[#632EB0]" />
            <span className="text-[11px] font-black text-[#632EB0] uppercase tracking-widest">
              Prueba de Ubicación
            </span>
          </div>
        </motion.div>

        {/* Hero */}
        <motion.div variants={itemVariants} className="text-center max-w-3xl mx-auto mb-10 md:mb-14">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 tracking-tighter leading-[1.05] mb-5">
            {userName ? (
              <>
                Hola <span className="text-[#632EB0]">{userName.split(' ')[0]}</span>,
                <br />comencemos tu aventura
              </>
            ) : (
              <>
                Descubre tu <span className="text-[#632EB0]">nivel</span>
                <br />de aventura
              </>
            )}
          </h1>
          <p className="text-gray-500 font-medium text-base md:text-lg leading-relaxed max-w-xl mx-auto">
            Una prueba adaptativa que se ajusta a tu nivel mientras juegas.
            Descubriremos juntos en qué <strong className="text-gray-700">Banda de Aventura</strong> te ubicas.
          </p>
        </motion.div>

        {/* Skills row */}
        <motion.div variants={itemVariants} className="mb-12 md:mb-16">
          <p className="text-center text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mb-5">
            Evaluaremos 5 habilidades
          </p>
          <div className="flex flex-wrap justify-center gap-3 md:gap-4">
            {SKILLS.map((skill, i) => (
              <motion.div
                key={skill.name}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 20,
                  delay: 0.4 + i * 0.08,
                } as never}
                whileHover={{ y: -4, scale: 1.04 }}
                className={`flex flex-col items-center gap-2 px-4 py-3 ${skill.bg} border ${skill.ring} rounded-2xl min-w-[100px]`}
              >
                <div className={`w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm ${skill.color}`}>
                  <skill.icon className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-black text-gray-700 uppercase tracking-wider">
                  {skill.name}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Two-column main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 mb-10 md:mb-14">
          {/* Left: Bands */}
          <motion.div variants={itemVariants} className="lg:col-span-3">
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-6 md:p-8 h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                  <Compass className="w-5 h-5 text-[#632EB0]" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-900 tracking-tight">Bandas de Aventura</h3>
                  <p className="text-[11px] text-gray-400 font-bold">Tu ruta de progreso</p>
                </div>
              </div>

              <div className="space-y-3">
                {BANDS.map((band, i) => (
                  <motion.div
                    key={band.num}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.1 } as never}
                    className="group flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all"
                  >
                    <div
                      className={`shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${band.color} flex items-center justify-center shadow-md text-white font-black text-lg`}
                    >
                      {band.num}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">
                        Banda {band.num}
                      </p>
                      <p className="text-sm font-black text-gray-900 leading-tight">{band.title}</p>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">{band.desc}</p>
                    </div>
                  </motion.div>
                ))}

                <div className="flex items-center gap-3 p-4 rounded-2xl border-2 border-dashed border-gray-200 opacity-60">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">
                      Próximas Fronteras
                    </p>
                    <p className="text-xs text-gray-500 font-medium">Dominio avanzado (post-prueba)</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: What to expect */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <div className="bg-gradient-to-br from-[#632EB0] to-[#4E248B] rounded-[2.5rem] p-6 md:p-8 h-full text-white relative overflow-hidden shadow-xl shadow-purple-500/20">
              {/* Decorative glow */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 blur-3xl rounded-full" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-300/20 blur-3xl rounded-full" />

              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-white/15 backdrop-blur-md rounded-xl flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white fill-white" />
                  </div>
                  <h3 className="text-sm font-black tracking-tight">Antes de comenzar</h3>
                </div>

                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-start gap-3">
                    <div className="shrink-0 w-7 h-7 bg-white/15 rounded-lg flex items-center justify-center mt-0.5">
                      <Timer className="w-3.5 h-3.5 text-white" />
                    </div>
                    <p className="text-sm font-medium text-white/90 leading-snug">
                      Duración estimada: <strong className="text-white">10–30 min</strong>. La prueba se adapta a tu nivel.
                    </p>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="shrink-0 w-7 h-7 bg-white/15 rounded-lg flex items-center justify-center mt-0.5">
                      <Mic className="w-3.5 h-3.5 text-white" />
                    </div>
                    <p className="text-sm font-medium text-white/90 leading-snug">
                      Necesitarás <strong className="text-white">micrófono</strong> para los ejercicios de pronunciación.
                    </p>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="shrink-0 w-7 h-7 bg-white/15 rounded-lg flex items-center justify-center mt-0.5">
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                    <p className="text-sm font-medium text-white/90 leading-snug">
                      Al terminar recibirás tu <strong className="text-white">ruta personalizada</strong> de aprendizaje.
                    </p>
                  </li>
                </ul>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onStart}
                  className="group w-full bg-white text-[#632EB0] font-black py-4 px-6 rounded-2xl text-base flex items-center justify-between transition-all shadow-lg shadow-black/10 hover:shadow-xl"
                >
                  <span className="tracking-tight">Iniciar aventura</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer hint */}
        <motion.p
          variants={itemVariants}
          className="text-center text-[11px] font-bold text-gray-300 uppercase tracking-[0.3em]"
        >
          ¿Listo? • Las respuestas honestas dan los mejores resultados
        </motion.p>
      </motion.div>
    </div>
  );
}
