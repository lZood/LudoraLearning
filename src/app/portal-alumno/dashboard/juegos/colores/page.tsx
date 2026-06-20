'use client';
// Actividad "Colores" (PREVIEW jugable) — aprendizaje real de vocabulario de colores en inglés, 3D vertical.
// Rondas que escalan: color → color+objeto → escucha. Voz + feedback. (XP se conecta al integrarla al curriculum.)
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { X, Loader2, Volume2, ArrowRight, Star } from 'lucide-react';
import { playAudio, playSfx, loadAudioManifest, stopAudio } from '@/lib/lessonAudio';
import type { ColorObj, RoundStatus } from '@/components/three/ColorsFindScene';

const ColorsFindScene = dynamic(() => import('@/components/three/ColorsFindScene'), {
    ssr: false,
    loading: () => <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 text-[#632EB0] animate-spin" /></div>,
});

type Round = { say: string; es: string; word: string; listen?: boolean; objects: ColorObj[]; answer: string };

const ROUNDS: Round[] = [
    // 1) Rojo → manzana (vs diamante, lingote de oro, bloque verde)
    { say: 'Find the red one.', es: 'Toca el rojo', word: 'Red', answer: 'a', objects: [
        { id: 'a', shape: 'apple', color: '#e23b3b' }, { id: 'b', shape: 'gem', color: '#39d3e0' }, { id: 'c', shape: 'ingot', color: '#f5c542' }, { id: 'd', shape: 'block', color: '#6fbf4a' }] },
    // 2) Azul → gema azul (lapislázuli) vs cerdo, oro, calabaza
    { say: 'Find the blue one.', es: 'Toca el azul', word: 'Blue', answer: 'b', objects: [
        { id: 'a', shape: 'pig', color: '#e88aa0' }, { id: 'b', shape: 'gem', color: '#3b78e2' }, { id: 'c', shape: 'ingot', color: '#f5c542' }, { id: 'd', shape: 'pumpkin', color: '#f5871f' }] },
    // 3) Dorado/amarillo → lingote de oro
    { say: 'Find the gold one.', es: 'Toca el dorado', word: 'Gold', answer: 'c', objects: [
        { id: 'a', shape: 'apple', color: '#e23b3b' }, { id: 'b', shape: 'gem', color: '#39d3e0' }, { id: 'c', shape: 'ingot', color: '#f5c542' }, { id: 'd', shape: 'pig', color: '#e88aa0' }] },
    // 4) Color + objeto → manzana verde (distractores: manzana roja, gema verde)
    { say: 'Find the green apple.', es: 'Toca la manzana verde', word: 'Green apple', answer: 'a', objects: [
        { id: 'a', shape: 'apple', color: '#5bbf3a' }, { id: 'b', shape: 'apple', color: '#e23b3b' }, { id: 'c', shape: 'gem', color: '#3ecb6a' }, { id: 'd', shape: 'block', color: '#5bbf3a' }] },
    // 5) Rosa → cerdo
    { say: 'Find the pink one.', es: 'Toca el rosa', word: 'Pink', answer: 'a', objects: [
        { id: 'a', shape: 'pig', color: '#e88aa0' }, { id: 'b', shape: 'gem', color: '#39d3e0' }, { id: 'c', shape: 'block', color: '#8a5a3b' }, { id: 'd', shape: 'ingot', color: '#f5c542' }] },
    // 6) (escucha) Naranja → calabaza
    { say: 'Orange.', es: 'Escucha y toca', word: 'Orange', listen: true, answer: 'a', objects: [
        { id: 'a', shape: 'pumpkin', color: '#f5871f' }, { id: 'b', shape: 'gem', color: '#9b5cf0' }, { id: 'c', shape: 'apple', color: '#e23b3b' }, { id: 'd', shape: 'block', color: '#3b78e2' }] },
];

export default function ColoresActivity() {
    const [idx, setIdx] = useState(0);
    const [status, setStatus] = useState<RoundStatus>('playing');
    const [picked, setPicked] = useState<string | null>(null);
    const [correctCount, setCorrectCount] = useState(0);
    const [finished, setFinished] = useState(false);

    const round = ROUNDS[idx];

    useEffect(() => { loadAudioManifest(); return () => stopAudio(); }, []);
    // Reproduce la instrucción al entrar a cada ronda.
    useEffect(() => {
        if (finished) return;
        const t = setTimeout(() => playAudio(round.say, 'narrator'), 400);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idx, finished]);

    function pick(id: string) {
        if (status !== 'playing') return;
        setPicked(id);
        if (id === round.answer) {
            setStatus('right'); playSfx('correct');
            setCorrectCount((c) => c + 1);
            setTimeout(() => playAudio(round.word, 'narrator'), 250);
        } else {
            setStatus('wrong'); playSfx('wrong');
        }
    }
    function retry() { stopAudio(); setStatus('playing'); setPicked(null); }
    function next() {
        stopAudio();
        if (idx + 1 >= ROUNDS.length) { setFinished(true); return; }
        setIdx((i) => i + 1); setStatus('playing'); setPicked(null);
    }

    if (finished) {
        return (
            <div className="fixed inset-0 z-50 bg-gradient-to-b from-[#efeaff] to-[#e3f0ff] flex flex-col items-center justify-center gap-5 text-center px-6">
                <div className="text-6xl">🎉</div>
                <h1 className="text-3xl font-black text-[#3a2b6b] drop-shadow-sm">¡Colores completados!</h1>
                <div className="flex gap-1">{Array.from({ length: ROUNDS.length }).map((_, i) => (
                    <Star key={i} className={`w-7 h-7 ${i < correctCount ? 'text-[#ffd23f] fill-[#ffd23f]' : 'text-gray-300'}`} />
                ))}</div>
                <p className="text-[#5a4b8a] font-bold">Acertaste {correctCount} de {ROUNDS.length}</p>
                <Link href="/portal-alumno/dashboard/juegos" className="bg-[#632EB0] text-white font-black px-10 py-4 rounded-2xl shadow-lg active:scale-95">Volver</Link>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
            {/* HUD */}
            <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100">
                <Link href="/portal-alumno/dashboard/juegos" className="p-1 text-gray-400 hover:text-gray-700"><X className="w-6 h-6" /></Link>
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#632EB0] rounded-full transition-all" style={{ width: `${(idx / ROUNDS.length) * 100}%` }} />
                </div>
                <span className="text-xs font-black text-gray-400 tabular-nums">{idx + 1}/{ROUNDS.length}</span>
            </div>

            {/* Instrucción + voz */}
            <div className="px-4 pt-4 pb-1 max-w-xl mx-auto w-full">
                <button onClick={() => playAudio(round.say, 'narrator')} className="w-full flex items-center gap-3 bg-[#f4f1ff] rounded-2xl px-4 py-3 active:scale-[0.99]">
                    <span className="w-10 h-10 rounded-full bg-[#632EB0] flex items-center justify-center shrink-0"><Volume2 className="w-5 h-5 text-white" /></span>
                    <span className="text-left">
                        <span className="block text-lg font-black text-gray-900 leading-tight">{round.listen ? '🔊 Escucha y toca' : round.say}</span>
                        <span className="block text-xs font-bold text-gray-400">{round.es}</span>
                    </span>
                </button>
            </div>

            {/* Escena 3D (flex-1 → el Canvas tiene altura definida y llena el espacio) */}
            <div className="flex-1 min-h-0 w-full">
                <ColorsFindScene objects={round.objects} status={status} picked={picked} onPick={pick} disabled={status !== 'playing'} />
            </div>

            {/* Feedback */}
            {status === 'right' && (
                <div className="bg-[#d7ffb8] border-t-2 border-[#88e04f] px-4 py-4">
                    <div className="max-w-xl mx-auto flex items-center gap-4">
                        <span className="text-3xl">🌟</span>
                        <div className="flex-1"><p className="text-lg font-black text-[#4a8a1f]">¡Muy bien! {round.word}</p></div>
                        <button onClick={next} className="px-6 py-3 rounded-2xl font-black uppercase tracking-wide text-white bg-[#58a700] shadow-[0_4px_0_#4a8a1f] active:scale-95">
                            {idx + 1 >= ROUNDS.length ? 'Terminar' : 'Continuar'} <ArrowRight className="w-4 h-4 inline" />
                        </button>
                    </div>
                </div>
            )}
            {status === 'wrong' && (
                <div className="bg-[#ffdfe0] border-t-2 border-red-300 px-4 py-4">
                    <div className="max-w-xl mx-auto flex items-center gap-4">
                        <span className="text-3xl">🤔</span>
                        <div className="flex-1"><p className="text-lg font-black text-red-600">Casi… inténtalo de nuevo</p></div>
                        <button onClick={retry} className="px-6 py-3 rounded-2xl font-black uppercase tracking-wide text-white bg-red-500 shadow-[0_4px_0_#c43d3d] active:scale-95">Reintentar</button>
                    </div>
                </div>
            )}
            {status === 'playing' && <p className="text-center text-gray-400 text-xs font-bold pb-3 px-4">Toca el objeto correcto</p>}
        </div>
    );
}
