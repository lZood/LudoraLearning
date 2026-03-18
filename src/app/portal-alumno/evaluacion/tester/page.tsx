'use client';
import React, { useState, useEffect } from 'react';
import { questionBank, Question, QuestionLevel, QuestionCategory } from '../questions';
import { ChevronLeft, Play, Info, CheckCircle, XCircle, Settings, Filter, Search } from 'lucide-react';

const LEVEL_PROGRESSION: QuestionLevel[] = ['Pre-A1', 'A1', 'A1-alto', 'A2', 'A2-alto', 'B1'];
const CATEGORIES: QuestionCategory[] = [
    'Gramática y Vocabulario',
    'Comprensión Auditiva',
    'Producción Escrita',
    'Producción Oral',
    'Identificación Visual'
];

export default function QuestionTester() {
    const [selectedLevel, setSelectedLevel] = useState<QuestionLevel | 'All'>('All');
    const [selectedCategory, setSelectedCategory] = useState<QuestionCategory | 'All'>('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
    const [showAnswer, setShowAnswer] = useState(false);
    const [userAnswer, setUserAnswer] = useState('');

    const filteredQuestions = questionBank.filter(q => {
        const levelMatch = selectedLevel === 'All' || q.level === selectedLevel;
        const categoryMatch = selectedCategory === 'All' || q.category === selectedCategory;
        const searchMatch = q.text.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           q.id.toLowerCase().includes(searchQuery.toLowerCase());
        return levelMatch && categoryMatch && searchMatch;
    });

    const handleSelectQuestion = (q: Question) => {
        setSelectedQuestion(q);
        setShowAnswer(false);
        setUserAnswer('');
    };

    return (
        <div className="min-h-screen bg-[#f8f9fa] flex flex-col font-sans">
            {/* Header */}
            <header className="bg-white border-b-2 border-purple-100 p-6 sticky top-0 z-20 shadow-sm">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-purple-600 p-2 rounded-lg">
                            <Settings className="text-white w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Probador de Preguntas</h1>
                            <p className="text-sm text-gray-500 font-medium">Ludora Learning Evaluation System</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            <select 
                                value={selectedLevel}
                                onChange={(e) => setSelectedLevel(e.target.value as any)}
                                className="pl-10 pr-4 py-2 bg-white border-2 border-gray-100 rounded-xl text-sm font-bold text-gray-700 outline-none focus:border-purple-500 transition-all appearance-none cursor-pointer"
                            >
                                <option value="All">Todos los Niveles</option>
                                {LEVEL_PROGRESSION.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                            </select>
                        </div>

                        <div className="relative">
                            <select 
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value as any)}
                                className="px-4 py-2 bg-white border-2 border-gray-100 rounded-xl text-sm font-bold text-gray-700 outline-none focus:border-purple-500 transition-all appearance-none cursor-pointer"
                            >
                                <option value="All">Todas las Categorías</option>
                                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            <input 
                                type="text"
                                placeholder="Buscar pregunta..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-white border-2 border-gray-100 rounded-xl text-sm font-bold text-gray-700 outline-none focus:border-purple-500 transition-all w-64"
                            />
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden">
                {/* Sidebar - Question List */}
                <div className="w-1/3 border-r-2 border-gray-100 bg-white overflow-y-auto">
                    <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Resultados: {filteredQuestions.length}</p>
                    </div>
                    {filteredQuestions.length > 0 ? (
                        <div className="divide-y divide-gray-50">
                            {filteredQuestions.map(q => (
                                <button
                                    key={q.id}
                                    onClick={() => handleSelectQuestion(q)}
                                    className={`w-full text-left p-6 hover:bg-purple-50 transition-all group relative ${selectedQuestion?.id === q.id ? 'bg-purple-50 border-l-4 border-purple-600' : ''}`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter ${
                                            q.level === 'B1' ? 'bg-red-100 text-red-600' :
                                            q.level.includes('A2') ? 'bg-orange-100 text-orange-600' :
                                            'bg-green-100 text-green-600'
                                        }`}>
                                            {q.level}
                                        </span>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase">{q.type}</span>
                                    </div>
                                    <p className="text-sm font-bold text-gray-800 line-clamp-2 leading-relaxed">{q.text}</p>
                                    <p className="text-[10px] font-medium text-gray-400 mt-2 uppercase tracking-wide">{q.category}</p>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ChevronLeft className="w-4 h-4 text-purple-400 rotate-180" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="p-20 text-center flex flex-col items-center justify-center opacity-20">
                            <Search className="w-16 h-16 mb-4" />
                            <p className="font-black uppercase tracking-tighter">No hay preguntas</p>
                        </div>
                    )}
                </div>

                {/* Content Area - Question Runner & Details */}
                <div className="flex-1 overflow-y-auto bg-gray-50/30 p-8 md:p-12">
                    {selectedQuestion ? (
                        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                            {/* Question Canvas */}
                            <div className="bg-white rounded-3xl shadow-xl shadow-purple-900/5 border border-purple-100 overflow-hidden">
                                <div className="bg-purple-600 px-8 py-4 flex items-center justify-between">
                                    <span className="text-xs font-black text-purple-100 uppercase tracking-widest">{selectedQuestion.category}</span>
                                    <span className="text-xs font-black text-purple-200 bg-white/10 px-3 py-1 rounded-full">{selectedQuestion.id}</span>
                                </div>
                                
                                <div className="p-8 md:p-12 space-y-10">
                                    {/* Audio Player if applicable */}
                                    {selectedQuestion.type === 'audio-listening' && selectedQuestion.audioUrl && (
                                        <div className="bg-purple-50 p-6 rounded-2xl flex flex-col space-y-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white">
                                                    <Play fill="currentColor" className="w-5 h-5" />
                                                </div>
                                                <h3 className="font-bold text-purple-900">Audio de la Misión</h3>
                                            </div>
                                            <audio controls className="w-full" src={selectedQuestion.audioUrl} />
                                        </div>
                                    )}

                                    <h2 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight">
                                        {selectedQuestion.text}
                                    </h2>

                                    {/* Interaction Area */}
                                    <div className="space-y-4">
                                        {/* Multiple Choice / Image Choice */}
                                        {(selectedQuestion.type === 'multiple-choice' || selectedQuestion.type === 'audio-listening' || selectedQuestion.type === 'image-choice') && (
                                            <div className={selectedQuestion.type === 'image-choice' ? "grid grid-cols-2 gap-6" : "grid grid-cols-1 md:grid-cols-2 gap-4"}>
                                                {selectedQuestion.options?.map((option, idx) => (
                                                    <div 
                                                        key={idx}
                                                        className={`p-6 rounded-2xl border-2 transition-all flex items-center gap-4 relative ${
                                                            showAnswer 
                                                                ? option.isCorrect 
                                                                    ? 'border-green-500 bg-green-50' 
                                                                    : 'border-red-100 bg-white opacity-50'
                                                                : 'border-gray-100 bg-white hover:border-purple-300 hover:shadow-lg'
                                                        }`}
                                                    >
                                                        {option.imageUrl && (
                                                            <div className="shrink-0">
                                                                <img src={option.imageUrl} alt={option.text} className="w-16 h-16 object-contain" />
                                                            </div>
                                                        )}
                                                        <p className="font-bold text-gray-800">{option.text}</p>
                                                        {showAnswer && option.isCorrect && (
                                                            <CheckCircle className="absolute right-4 top-4 text-green-600 w-5 h-5" />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Text Input / Oral (mockup for tester) */}
                                        {(selectedQuestion.type === 'text-input' || selectedQuestion.type === 'audio-record') && (
                                            <div className="space-y-4">
                                                <div className="bg-gray-50 p-8 rounded-3xl border-2 border-dashed border-gray-200 text-center">
                                                    {selectedQuestion.type === 'text-input' ? (
                                                        <textarea 
                                                            placeholder="Simula escritura aquí..."
                                                            className="w-full bg-white border-2 border-gray-100 rounded-2xl p-6 outline-none focus:border-purple-400 transition-all min-h-[150px] font-medium"
                                                        />
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-4">
                                                            <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center text-white shadow-lg">
                                                                <Settings className="w-8 h-8" />
                                                            </div>
                                                            <p className="font-black text-gray-400 uppercase tracking-tighter">[ Simulación de Audio ]</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-8 border-t border-gray-100 flex justify-center">
                                    {!showAnswer ? (
                                        <button 
                                            onClick={() => setShowAnswer(true)}
                                            className="bg-purple-600 hover:bg-purple-700 text-white font-black py-4 px-12 rounded-2xl shadow-lg shadow-purple-600/20 transition-all uppercase tracking-widest"
                                        >
                                            Verificar Respuesta Correcta
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => setShowAnswer(false)}
                                            className="bg-gray-200 hover:bg-gray-300 text-gray-600 font-black py-4 px-12 rounded-2xl transition-all uppercase tracking-widest"
                                        >
                                            Ocultar Respuesta
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Metadata Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-500">
                                {/* Rubric & Logic */}
                                <div className="bg-white rounded-3xl border border-gray-100 p-8 space-y-6">
                                    <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                                        <Info className="text-blue-500 w-5 h-5" />
                                        <h3 className="font-black text-gray-900 uppercase tracking-tighter text-sm">Rúbrica y Lógica (AI)</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Criterio de Evaluación:</p>
                                            <p className="text-sm font-medium text-gray-600 leading-relaxed italic">
                                                {selectedQuestion.gradingRubric || "Usa comparación directa de opciones seleccionadas."}
                                            </p>
                                        </div>
                                        {selectedQuestion.expectedKeywords && selectedQuestion.expectedKeywords.length > 0 && (
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Palabras Clave Esperadas:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedQuestion.expectedKeywords.map(word => (
                                                        <span key={word} className="bg-blue-50 text-blue-600 text-[10px] font-bold px-3 py-1 rounded-full">{word}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Skills & Identifiers */}
                                <div className="bg-white rounded-3xl border border-gray-100 p-8 space-y-6">
                                    <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                                        <Search className="text-purple-500 w-5 h-5" />
                                        <h3 className="font-black text-gray-900 uppercase tracking-tighter text-sm">Skill & Identificadores</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                                            <span className="text-[10px] font-black text-gray-400 uppercase">Skill ID</span>
                                            <span className="text-xs font-mono font-bold text-gray-800">{selectedQuestion.skillId}</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                                            <span className="text-[10px] font-black text-gray-400 uppercase">Nivel</span>
                                            <span className="text-xs font-bold text-purple-600">{selectedQuestion.level}</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                                            <span className="text-[10px] font-black text-gray-400 uppercase">Tipo</span>
                                            <span className="text-xs font-bold text-gray-800">{selectedQuestion.type}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-30 select-none">
                            <div className="bg-purple-100 p-10 rounded-full mb-6">
                                <Play className="w-20 h-20 text-purple-400 translate-x-1" />
                            </div>
                            <h2 className="text-3xl font-black text-purple-900 uppercase tracking-tighter">Selecciona una misión</h2>
                            <p className="text-gray-600 font-bold mt-2">Usa el panel de la izquierda para explorar el banco de preguntas</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
