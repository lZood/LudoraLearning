'use client';

import React, { useState } from 'react';
import { X, Play, Award, CheckCircle2, ChevronRight, HelpCircle, User, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuizQuestion {
    question: string;
    options: string[];
    correctIndex: number;
}

interface VideoPlayerModalProps {
    video: {
        id: number;
        title: string;
        url: string; // YouTube embed ID (e.g., dQw4w9WgXcQ)
        category: string;
        description: string;
        instructor: string;
        quiz: QuizQuestion[];
    } | null;
    onClose: () => void;
    onCompleteQuiz: (xp: number) => void;
}

export default function VideoPlayerModal({ video, onClose, onCompleteQuiz }: VideoPlayerModalProps) {
    const [activeTab, setActiveTab] = useState<'info' | 'quiz'>('info');
    const [quizStarted, setQuizStarted] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [quizFinished, setQuizFinished] = useState(false);
    const [score, setScore] = useState(0);

    if (!video) return null;

    const handleOptionSelect = (index: number) => {
        setSelectedOption(index);
        if (index === video.quiz[currentQuestion].correctIndex) {
            setScore(prev => prev + 1);
        }
        
        setTimeout(() => {
            if (currentQuestion < video.quiz.length - 1) {
                setCurrentQuestion(prev => prev + 1);
                setSelectedOption(null);
            } else {
                setQuizFinished(true);
            }
        }, 800);
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] bg-black/98 backdrop-blur-2xl flex items-center justify-center md:p-6 lg:p-10"
        >
            <div className="relative w-full max-w-[1550px] h-full md:max-h-[92vh] bg-[#0A0A0A] md:rounded-[3.5rem] border-white/5 shadow-[0_0_120px_rgba(99,46,176,0.2)] overflow-hidden flex flex-col lg:flex-row">
                
                {/* Close Button - More prominent and positioned correctly for mobile */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 md:top-8 md:right-8 z-[60] p-3 md:p-4 bg-black/40 hover:bg-white/10 backdrop-blur-xl rounded-2xl text-white/80 hover:text-white transition-all active:scale-90 border border-white/10"
                >
                    <X className="w-6 h-6 md:w-7 md:h-7" />
                </button>

                {/* Left: Video Player Area - EDGE TO EDGE ON MOBILE */}
                <div className="w-full h-[40vh] md:h-auto lg:flex-grow flex flex-col bg-black relative shadow-2xl z-10">
                    <iframe 
                        src={`https://www.youtube.com/embed/${video.url}?autoplay=1&modestbranding=1&rel=0&iv_load_policy=3&showinfo=0`}
                        title={video.title}
                        className="w-full h-full border-none"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>

                {/* Right: Sidebar (Info & Quiz) - Scrolling on mobile, Sidebar on PC */}
                <div className="flex-grow md:flex-none w-full lg:w-[480px] flex flex-col bg-[#0F0F0F] lg:border-l border-white/5 relative z-20">
                    {/* Tabs Navigation - Sticky on mobile */}
                    <div className="sticky top-0 z-30 flex bg-[#0F0F0F]/80 backdrop-blur-xl border-b border-white/5 p-3 gap-3">
                        <button 
                            onClick={() => setActiveTab('info')}
                            className={`flex items-center justify-center gap-2.5 flex-1 py-4 px-2 rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${
                                activeTab === 'info' ? 'bg-white/10 text-white border border-white/10 shadow-lg' : 'text-gray-500 hover:text-white'
                            }`}
                        >
                            <Play className="w-3.5 h-3.5 md:w-4 h-4" />
                            <span>Contenido</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('quiz')}
                            className={`flex items-center justify-center gap-2.5 flex-1 py-4 px-2 rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${
                                activeTab === 'quiz' ? 'bg-[#632EB0] text-white shadow-lg shadow-purple-500/20' : 'text-gray-500 hover:text-white'
                            }`}
                        >
                            <Award className="w-3.5 h-3.5 md:w-4 h-4" />
                            <span>Challenge</span>
                        </button>
                    </div>

                    <div className="flex-grow overflow-y-auto p-6 md:p-10 custom-scrollbar pb-32 lg:pb-10">
                        <AnimatePresence mode="wait">
                            {activeTab === 'info' ? (
                                <motion.div 
                                    key="info"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="flex flex-col gap-8"
                                >
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-[9px] font-black uppercase tracking-widest">{video.category}</span>
                                        </div>
                                        <h2 className="text-2xl md:text-3xl font-black text-white leading-[1.1]">{video.title}</h2>
                                    </div>
                                    
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-3.5 p-1.5 pl-1.5 pr-5 bg-white/5 rounded-2xl border border-white/5">
                                            <div className="w-11 h-11 bg-gradient-to-br from-[#632EB0] to-[#7B3FE4] rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                                                <User className="w-5.5 h-5.5 text-white" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] text-gray-500 font-black uppercase tracking-wider">Instructor del Curso</span>
                                                <span className="text-sm text-white font-black">{video.instructor}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="h-px bg-white/5" />

                                    <p className="text-sm md:text-base text-gray-400 leading-relaxed font-medium">
                                        {video.description}
                                    </p>
                                    
                                    <div className="bg-gradient-to-br from-[#1A1A1A] to-[#121212] border border-white/5 rounded-[2.5rem] p-8 mt-4 flex flex-col gap-6 shadow-2xl">
                                        <div className="flex items-start gap-5">
                                            <div className="w-14 h-14 bg-[#632EB0] rounded-2xl flex items-center justify-center shrink-0 shadow-xl shadow-purple-500/20 border-t border-white/20">
                                                <Award className="w-7 h-7 text-white" />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <h4 className="text-base font-black text-white">Domina esta unidad</h4>
                                                <p className="text-xs text-gray-400 font-medium leading-relaxed">Completa el quiz al finalizar el video para obtener <span className="text-white font-black">+50 XP</span> y subir en el ranking.</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => setActiveTab('quiz')}
                                            className="w-full bg-white text-black font-black py-5 rounded-[1.5rem] text-[11px] uppercase tracking-[0.2em] hover:scale-[1.03] transition-all active:scale-95 shadow-xl shadow-white/5"
                                        >
                                            Empezar Desafío
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="quiz"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="flex flex-col h-full"
                                >
                                    {!quizStarted ? (
                                        <div className="flex flex-col items-center justify-center h-full text-center gap-8 py-12">
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-[#632EB0] blur-3xl opacity-20 animate-pulse"></div>
                                                <div className="relative w-28 h-28 bg-white/5 rounded-[3rem] flex items-center justify-center border border-white/10 animate-bounce-slow">
                                                    <HelpCircle className="w-12 h-12 text-[#632EB0]" />
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-3">
                                                <h3 className="text-2xl font-black text-white tracking-tight">¿Listo para el Quiz?</h3>
                                                <p className="text-sm text-gray-500 font-medium max-w-xs leading-relaxed">Pondremos a prueba tu atención con {video.quiz.length} preguntas interactivas.</p>
                                            </div>
                                            <button 
                                                onClick={() => setQuizStarted(true)}
                                                className="w-full mt-2 bg-[#632EB0] text-white font-black py-5 rounded-[2rem] text-xs uppercase tracking-[0.2em] shadow-2xl shadow-purple-500/40 active:scale-95 transition-all border-t border-white/10 hover:bg-[#7236C7]"
                                            >
                                                Comenzar Ahora
                                            </button>
                                        </div>
                                    ) : quizFinished ? (
                                        <div className="flex flex-col items-center justify-center h-full text-center gap-8 py-10 animate-in zoom-in-95 duration-500">
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-green-500 blur-3xl opacity-20"></div>
                                                <div className="relative w-28 h-28 bg-green-500 rounded-[3rem] flex items-center justify-center shadow-2xl shadow-green-500/40 border-b-8 border-green-700">
                                                    <CheckCircle2 className="w-12 h-12 text-white" />
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-3">
                                                <h3 className="text-3xl font-black text-white">¡Misión Cumplida!</h3>
                                                <p className="text-sm text-gray-400 font-medium">Lograste una puntuación de {score}/{video.quiz.length}.</p>
                                            </div>
                                            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6 w-full flex items-center justify-between mt-4">
                                                <div className="flex flex-col items-start gap-1">
                                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Recompensa</span>
                                                    <span className="text-2xl font-black text-white tracking-tight">Puntos de XP</span>
                                                </div>
                                                <span className="text-3xl font-black text-green-400">+50 XP</span>
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    onCompleteQuiz(50);
                                                    onClose();
                                                }}
                                                className="w-full mt-4 bg-white text-black font-black py-6 rounded-[2rem] text-[11px] uppercase tracking-[0.2em] active:scale-95 transition-all shadow-xl shadow-white/5"
                                            >
                                                Finalizar y Reclamar
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-10 py-4">
                                            {/* Progress bar */}
                                            <div className="flex flex-col gap-3">
                                                <div className="flex justify-between items-end px-1">
                                                    <span className="text-[10px] text-gray-500 font-black uppercase tracking-[0.15em]">Pregunta {currentQuestion + 1} de {video.quiz.length}</span>
                                                    <span className="text-[10px] text-[#632EB0] font-black uppercase tracking-[0.15em] flex items-center gap-1.5"><Trophy className="w-3 h-3" /> Mastery</span>
                                                </div>
                                                <div className="h-2 w-full bg-white/5 border border-white/5 rounded-full overflow-hidden p-0.5">
                                                    <motion.div 
                                                        className="h-full bg-gradient-to-r from-[#632EB0] to-[#8C52FF] rounded-full shadow-[0_0_15px_rgba(140,82,255,0.4)]"
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${((currentQuestion + 1) / video.quiz.length) * 100}%` }}
                                                    />
                                                </div>
                                            </div>

                                            <h3 className="text-xl md:text-2xl font-black text-white leading-tight mt-2">{video.quiz[currentQuestion].question}</h3>

                                            <div className="flex flex-col gap-5">
                                                {video.quiz[currentQuestion].options.map((option, index) => {
                                                    const isSelected = selectedOption === index;
                                                    const isCorrect = isSelected && index === video.quiz[currentQuestion].correctIndex;
                                                    const isWrong = isSelected && index !== video.quiz[currentQuestion].correctIndex;

                                                    return (
                                                        <button 
                                                            key={index}
                                                            onClick={() => selectedOption === null && handleOptionSelect(index)}
                                                            className={`w-full text-left p-6 md:p-7 rounded-[2.5rem] border-2 transition-all font-bold text-sm md:text-base ${
                                                                isCorrect ? 'bg-green-500/20 border-green-500 text-green-400' :
                                                                isWrong ? 'bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_30px_rgba(239,68,68,0.1)]' :
                                                                isSelected ? 'bg-[#632EB0]/20 border-[#632EB0] text-purple-200 shadow-[0_0_30px_rgba(99,46,176,0.2)]' :
                                                                'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:border-white/10'
                                                            }`}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <span className="pr-4 leading-relaxed">{option}</span>
                                                                {isCorrect && (
                                                                    <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center shrink-0">
                                                                        <CheckCircle2 className="w-4 h-4 text-white" />
                                                                    </div>
                                                                )}
                                                                {isWrong && (
                                                                    <div className="w-7 h-7 bg-red-500 rounded-full flex items-center justify-center shrink-0">
                                                                        <X className="w-4 h-4 text-white" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
