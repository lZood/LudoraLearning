'use client';

// DEMO PÚBLICA del flujo de aprendizaje v2 ("Aprende Crafteando" — método Duolingo + Minecraft).
// Recorre el arco TE MUESTRO -> PRACTICAS -> LO APLICAS -> COFRE usando los componentes REALES
// (PresentStep, LessonHud, PhaseRibbon, HintTorch, Celebrate). Ejercicios simulados (los renderers
// reales viven en el player). No toca BD ni auth; sirve para ver/validar la UX nueva.

import React, { useState } from 'react';
import Link from 'next/link';
import { Volume2, Check, X } from 'lucide-react';
import PresentStep from '@/components/lesson/PresentStep';
import LessonHud from '@/components/lesson/LessonHud';
import PhaseRibbon from '@/components/lesson/PhaseRibbon';
import HintTorch from '@/components/lesson/HintTorch';
import Celebrate from '@/components/lesson/Celebrate';
import Mascot from '@/components/lesson/Mascot';
import { playAudio, playSfx } from '@/lib/lessonAudio';
import type { PresentStep as PresentStepData, LessonSection } from '@/lib/lessonContent';

// ── Lección piloto: Unidad 1 · "Saludos" (destreza conversation, bioma Pradera) ──
const PILOT_PRESENT: PresentStepData = {
  title: 'Saludos en inglés',
  intro: 'Toca cada bloque para escucharlo. ¡Estos son los ingredientes de hoy!',
  theme: 'recipe_book',
  items: [
    { conceptId: 'func.greetings.hello', headline: 'Hello', en: 'Hello', es: 'Hola', icon: '👋' },
    { conceptId: 'func.greetings.goodbye', headline: 'Goodbye', en: 'Goodbye', es: 'Adiós', icon: '🖐️' },
    { conceptId: 'func.greetings.how_are_you', headline: 'How are you?', en: 'How are you?', es: '¿Cómo estás?', icon: '😊' },
  ],
};

type DemoEx = { section: LessonSection; prompt: string; options: string[]; correct: number; hint?: string };
const PILOT_EXERCISES: DemoEx[] = [
  { section: 'recognize', prompt: '¿Cómo se dice "Hola" en inglés?', options: ['Hello', 'Goodbye', 'Apple'], correct: 0, hint: 'Es el saludo de bienvenida que viste en la receta.' },
  { section: 'recognize', prompt: 'Empareja: "Goodbye" significa…', options: ['Adiós', 'Hola', 'Gracias'], correct: 0 },
  { section: 'produce', prompt: 'Completa el saludo: "____, how are you?"', options: ['Hello', 'Red', 'Three'], correct: 0, hint: 'Empieza saludando.' },
  { section: 'apply', prompt: 'Un aldeano te dice "Hello!". ¿Qué respondes?', options: ['Hello!', 'Goodbye forever', 'Blue'], correct: 0, hint: 'Devuelve el saludo de forma amistosa.' },
];

export default function LeccionDemoPage() {
  const [phase, setPhase] = useState<'present' | 'practice' | 'finished'>('present');
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [result, setResult] = useState<{ correct: boolean } | null>(null);
  const [celebrateN, setCelebrateN] = useState(0);
  const [correct, setCorrect] = useState(0);

  const ex = PILOT_EXERCISES[idx];

  const check = () => {
    if (sel === null) return;
    const ok = sel === ex.correct;
    setResult({ correct: ok });
    playSfx(ok ? 'block_break' : 'block_thud');
    if (ok) { setCorrect((c) => c + 1); setCelebrateN((n) => n + 1); }
  };
  const next = () => {
    if (idx + 1 >= PILOT_EXERCISES.length) { playSfx('chest_open'); setPhase('finished'); return; }
    setIdx(idx + 1); setSel(null); setResult(null);
  };

  if (phase === 'present') {
    return <PresentStep present={PILOT_PRESENT} skill="conversation" onContinue={() => setPhase('practice')} />;
  }

  if (phase === 'finished') {
    const pct = Math.round((correct / PILOT_EXERCISES.length) * 100);
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-5 px-6 text-center relative overflow-hidden">
        <Celebrate trigger={celebrateN + 1} intensity={2} />
        <Mascot mood="happy" className="w-40 h-40" />
        <h2 className="text-3xl font-black text-gray-900">¡Cofre abierto! 🎉</h2>
        <div className="flex gap-3">
          <div className="border-2 border-yellow-200 rounded-2xl px-5 py-3"><p className="text-2xl font-black text-yellow-500">+20</p><p className="text-[10px] font-black text-gray-400 uppercase">XP</p></div>
          <div className="border-2 border-green-200 rounded-2xl px-5 py-3"><p className="text-2xl font-black text-[#58a700]">{pct}%</p><p className="text-[10px] font-black text-gray-400 uppercase">Aciertos</p></div>
        </div>
        <p className="text-sm font-bold text-gray-500 max-w-xs">Subiste a <strong className="text-[var(--mc-emerald-d)]">Saludos II</strong> ✦ (encantamiento de tu Pico)</p>
        <button onClick={() => { setPhase('present'); setIdx(0); setSel(null); setResult(null); setCorrect(0); }} className="mt-2 bg-[#88e04f] text-[#1a1a1a] font-black px-10 py-4 rounded-2xl shadow-[0_4px_0_#6dc536]">Repetir demo</button>
        <Link href="/" className="text-xs font-bold text-gray-400 underline">Salir</Link>
      </div>
    );
  }

  // phase === 'practice'
  return (
    <div className="min-h-screen bg-white pb-28">
      <div className="sticky top-0 z-20 bg-white">
        <LessonHud
          index={idx + (result ? 1 : 0)}
          total={PILOT_EXERCISES.length}
          phaseSection={ex.section}
          emeralds={12}
          biomeKey="pradera"
          livesEnabled={false}
          onExit={() => setPhase('present')}
        />
      </div>

      <div className="max-w-xl mx-auto px-4 py-6 relative">
        <PhaseRibbon section={ex.section} className="mb-4" />
        <Celebrate trigger={celebrateN} />

        {/* Ejercicio simulado (en el player real es el Renderer de 19 tipos) */}
        <div className="flex items-start gap-3 mb-6">
          <Mascot character="granjerita" mood={result ? (result.correct ? 'happy' : 'sad') : 'curious'} className="w-16 h-16 shrink-0 -mt-1" />
          <div className="relative flex-1 bg-white border-2 border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
            <span className="absolute -left-[9px] top-4 w-3.5 h-3.5 bg-white border-l-2 border-b-2 border-gray-100 rotate-45" />
            <p className="text-lg font-black text-gray-900 leading-snug inline-flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-[#632EB0] cursor-pointer" onClick={() => playAudio(ex.options[ex.correct])} /> {ex.prompt}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {ex.options.map((o, i) => {
            const isSel = sel === i;
            const frozen = result !== null;
            const cls = frozen && isSel
              ? (result!.correct ? 'border-[#58a700] bg-[#d7ffb8] text-[#3a6b00]' : 'border-red-400 bg-red-50 text-red-600')
              : isSel ? 'border-[#632EB0] bg-purple-50 text-[#632EB0]' : 'border-gray-200 text-gray-800';
            return (
              <button key={i} disabled={frozen} onClick={() => setSel(i)} className={`w-full text-left p-4 rounded-2xl border-2 font-bold transition-all ${cls}`}>
                {o}{frozen && i === ex.correct && <Check className="inline w-4 h-4 ml-2" />}
              </button>
            );
          })}
        </div>

        {!result && ex.hint && (
          <div className="mt-5"><HintTorch hint={ex.hint} free character="granjerita" /></div>
        )}
      </div>

      {/* Barra inferior: Comprobar / feedback con respuesta correcta */}
      <div className="fixed bottom-0 inset-x-0 z-30">
        {result ? (
          <div className={`${result.correct ? 'bg-[#d7ffb8]' : 'bg-[#ffdfe0]'} border-t-2 ${result.correct ? 'border-[#88e04f]' : 'border-red-300'} px-4 py-4`}>
            <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Mascot mood={result.correct ? 'happy' : 'sad'} className="w-12 h-12 shrink-0" />
                <div>
                  <p className={`text-lg font-black ${result.correct ? 'text-[#4a8a1f]' : 'text-red-600'}`}>{result.correct ? '¡Encaja! 🟩' : 'Ese bloque no encaja'}</p>
                  {!result.correct && <p className="text-sm font-bold text-red-600/90 inline-flex items-center gap-1.5"><Volume2 className="w-4 h-4 cursor-pointer" onClick={() => playAudio(ex.options[ex.correct])} /> Respuesta: {ex.options[ex.correct]}</p>}
                </div>
              </div>
              <button onClick={next} className={`shrink-0 px-7 py-3.5 rounded-2xl font-black uppercase tracking-wide text-white active:scale-95 ${result.correct ? 'bg-[#58a700] shadow-[0_4px_0_#3a6b00]' : 'bg-red-500 shadow-[0_4px_0_#b91c1c]'}`}>
                {idx + 1 >= PILOT_EXERCISES.length ? 'Abrir cofre' : 'Continuar'}
              </button>
            </div>
          </div>
        ) : (
          <div className="border-t border-gray-100 bg-white px-4 py-4">
            <div className="max-w-xl mx-auto">
              <button onClick={check} disabled={sel === null} className={`w-full py-4 rounded-2xl font-black uppercase tracking-wide transition-all active:scale-[0.98] ${sel === null ? 'bg-gray-100 text-gray-300' : 'bg-[#88e04f] text-[#1a1a1a] shadow-[0_4px_0_#6dc536]'}`}>
                Comprobar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* salida rápida */}
      <Link href="/" className="fixed top-3 right-3 z-40 p-1 text-gray-300 hover:text-gray-500"><X className="w-5 h-5" /></Link>
    </div>
  );
}
