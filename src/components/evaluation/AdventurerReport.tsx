import React, { useState } from 'react';
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
}

export default function AdventurerReport({
    calculatedBanda,
    finalCategoryLevels,
    evaluationHistory,
    isCheckingOut,
    handleCheckout,
    error
}: AdventurerReportProps) {
    const [showAllMissions, setShowAllMissions] = useState(false);

    // Grouping the mission log for the Results UI
    const visibleHistory = showAllMissions ? evaluationHistory : evaluationHistory.slice(0, 5);
    const groupedMissions = visibleHistory.reduce((acc, item) => {
        const banda = getBandaFromLevel(item.level);
        if (!acc[banda]) acc[banda] = [];
        acc[banda].push(item);
        return acc;
    }, {} as Record<number, typeof evaluationHistory>);
    const sortedBands = Object.keys(groupedMissions).map(Number).sort((a, b) => a - b);

    return (
        <div className="w-full flex flex-col gap-6 lg:gap-8 animate-fade-in-up">
            {/* Header Reporte */}
            <div className="w-full text-center mb-4">
                <h1 className="text-3xl md:text-5xl font-black text-[#374151] drop-shadow-sm mb-3">Reporte de Habilidades</h1>
                <p className="text-gray-700 text-lg font-medium drop-shadow-sm">Nivel de Aventura: <span className="text-white font-black bg-[#4b5563] px-3 py-1 rounded-sm border-2 border-[#1f2937] shadow-md inline-block mt-2 md:mt-0 md:ml-2">Banda {calculatedBanda}</span></p>
            </div>

            {/* Narrativa del Oráculo */}
            <div className="w-full bg-white border-4 border-[#815a9b] rounded-sm p-6 shadow-[8px_8px_0_rgba(129,90,155,0.3)] relative">
                <div className="absolute -top-10 -left-6 w-20 h-20 flex items-center justify-center z-10">
                    <img src="/images/evaluacion/oraculo.webp" alt="Oráculo" className="w-full h-full object-contain drop-shadow-lg" />
                </div>
                <h3 className="font-bold text-[#815a9b] text-xl mb-2 ml-12">Vision de Ludora:</h3>
                <p className="text-gray-700 italic border-l-4 border-[#815a9b] pl-4 py-2 bg-purple-50 font-medium text-sm md:text-base">
                    "¡Gran trabajo, aventurero! He analizado tu desempeño a lo largo de las pruebas. Posees una base sólida que promete mucho potencial. Tu próxima meta será afianzar ese conocimiento para comunicarte de manera más fluida con los aldeanos y sortear obstáculos de nivel intermedio con total seguridad."
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 w-full">
                {/* Panel de Competencias */}
                <div className="bg-white border-4 border-[#3b82f6]/20 rounded-sm p-6 shadow-[12px_12px_0_rgba(59,130,246,0.1)] h-full flex flex-col md:col-span-1 lg:col-span-2">
                    <h3 className="font-black text-[#2563eb] text-xl border-b-2 border-blue-100 pb-3 mb-5 uppercase tracking-wide flex items-center gap-2">
                        <span className="text-2xl"></span> Estadísticas Academicas
                    </h3>
                    {finalCategoryLevels && (
                        <div className="flex flex-col gap-5 flex-1 justify-center">
                            {Object.entries(finalCategoryLevels).map(([category, level]) => {
                                const lvlIndex = LEVEL_PROGRESSION.indexOf(level as QuestionLevel);
                                const lvlPct = ((lvlIndex + 1) / LEVEL_PROGRESSION.length) * 100;
                                const catBanda = getBandaFromLevel(level as QuestionLevel);
                                const catLabel = catBanda === 1 ? 'Iniciación' : (catBanda === 2 ? 'Funcional' : 'Avanzado');

                                // RPG Mapping for Categories
                                let rpgCategoryName = category;
                                if (category.includes('Gramática')) rpgCategoryName = 'Gramática y Vocabulario';
                                if (category.includes('Auditiva')) rpgCategoryName = 'Comprensión Auditiva';
                                if (category.includes('Oral')) rpgCategoryName = 'Producción Oral';
                                if (category.includes('Escrita')) rpgCategoryName = 'Producción Escrita';
                                if (category.includes('Visual')) rpgCategoryName = 'Identificación Visual';

                                // Color scheme based on RPG attributes
                                let barColor = 'from-[#3b82f6] to-[#1d4ed8]'; // Default azul
                                if (category.includes('Auditiva')) barColor = 'from-[#60a5fa] to-[#2563eb]';
                                if (category.includes('Oral')) barColor = 'from-[#f472b6] to-[#db2777]';
                                if (category.includes('Escrita')) barColor = 'from-[#fbbf24] to-[#d97706]';
                                if (category.includes('Visual')) barColor = 'from-[#2dd4bf] to-[#0d9488]';

                                return (
                                    <div key={category} className="flex flex-col gap-1.5">
                                        <div className="flex justify-between items-end">
                                            <span className="text-gray-700 font-bold text-xs uppercase tracking-tight">{rpgCategoryName}</span>
                                            <span className="font-black text-gray-800 text-[10px] bg-gray-100 px-2 py-0.5 rounded border border-gray-200">Rango {lvlIndex + 1} ({catLabel})</span>
                                        </div>
                                        <div className="w-full bg-blue-50 h-5 border-2 border-blue-100 p-0.5 rounded-sm relative overflow-hidden shadow-inner">
                                            <div className={`h-full bg-gradient-to-r ${barColor} transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,255,255,0.3)]`} style={{ width: `${lvlPct}%` }}>
                                                <div className="w-full h-full bg-gradient-to-b from-white/40 to-transparent"></div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-6 lg:gap-8 h-full md:col-span-1 lg:col-span-1">
                    {/* Tu Próxima Misión (Quest Log) */}
                    <div className="bg-[#fffbeb] border-4 border-[#f59e0b] rounded-sm p-6 shadow-[8px_8px_0_rgba(245,158,11,0.3)] relative overflow-hidden flex-1 flex flex-col justify-center">
                        <div className="absolute -top-2 -right-2 w-16 h-16 opacity-20">
                            <img src="/images/evaluacion/paper.webp" alt="Papel" className="w-full h-full object-contain rotate-12" />
                        </div>
                        <h3 className="font-black text-[#d97706] text-xl border-b-2 border-[#d97706]/30 pb-3 mb-4 uppercase tracking-wide flex items-center gap-2 relative z-10">
                            <img src="/images/evaluacion/paper.webp" alt="Log" className="w-8 h-8 object-contain" /> Siguientes pasos
                        </h3>
                        <p className="text-gray-800 font-medium leading-relaxed text-sm relative z-10">
                            Para llegar al siguiente nivel, tu misión en la <strong className="text-[#d97706]">Banda {calculatedBanda}</strong> es superar los desafíos recurrentes y aplicar los patrones aprendidos en entornos menos controlados. ¡Prepárate para nuevas interacciones!
                        </p>
                    </div>

                    {/* Logros Desbloqueados */}
                    <div className="bg-white border-4 border-[#10b981] rounded-sm p-6 shadow-[8px_8px_0_rgba(16,185,129,0.3)] flex-1 flex flex-col justify-center">
                        <h3 className="font-black text-[#059669] text-xl border-b-2 border-green-100 pb-3 mb-4 uppercase tracking-wide flex items-center gap-2">
                            <img src="/images/evaluacion/backpack.webp" alt="Backpack" className="w-10 h-10 object-contain" /> Mochila de Logros
                        </h3>
                        <div className="grid grid-cols-1 gap-3">
                            <div className="bg-green-50 border-2 border-green-100 rounded p-3 flex items-start gap-3 hover:-translate-y-0.5 transition-transform duration-200 cursor-default">
                                <span className="text-xl leading-none text-green-600">★</span>
                                <p className="text-[11px] text-green-900 font-bold leading-tight uppercase tracking-tight">Estructuras Base Dominadas</p>
                            </div>
                            <div className="bg-green-50 border-2 border-green-100 rounded p-3 flex items-start gap-3 hover:-translate-y-0.5 transition-transform duration-200 cursor-default">
                                <span className="text-xl leading-none text-green-600">★</span>
                                <p className="text-[11px] text-green-900 font-bold leading-tight uppercase tracking-tight">Comprensión de Instrucciones</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* DETAILED RESULTS SECTION (ACCORDION) */}
            <div className="w-full bg-white border-4 border-[#6366f1] rounded-sm p-6 shadow-[8px_8px_0_rgba(99,102,241,0.3)]">
                <h3 className="font-black text-[#4f46e5] text-xl border-b-2 border-indigo-50 pb-3 mb-5 uppercase tracking-wide flex items-center gap-3">
                    <img src="/images/estrategia-page/book.webp" alt="Libro" className="w-10 h-10 object-contain" /> Registros de Evaluación
                </h3>
                <div className="flex flex-col gap-6">
                    {sortedBands.map(banda => (
                        <div key={banda} className="flex flex-col gap-2">
                            <h4 className="font-black text-gray-500 text-xs uppercase tracking-widest pl-2 border-l-4 border-gray-300">
                                Preguntas de Banda {banda}
                            </h4>
                            <div className="flex flex-col gap-2">
                                {groupedMissions[banda].map((item, idx) => (
                                    <details key={idx} className="group bg-gray-50 border-2 border-gray-200 rounded cursor-pointer [&_summary::-webkit-details-marker]:hidden open:bg-white open:border-gray-300 transition-colors">
                                        <summary className="flex items-center justify-between p-3 focus:outline-none hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <span className={`flex items-center justify-center w-6 h-6 rounded-sm font-bold text-white text-xs shadow-sm border-b-2 ${item.isCorrect ? 'bg-[#8bc34a] border-[#689f38]' : 'bg-red-500 border-red-700'}`}>
                                                    {item.isCorrect ? '✓' : '✗'}
                                                </span>
                                                <span className="font-bold text-sm text-gray-700 uppercase tracking-tight">{item.category}</span>
                                            </div>
                                            <span className="text-[10px] font-bold text-indigo-400 group-open:rotate-180 transition-transform uppercase tracking-wider bg-indigo-50 px-2 py-1 rounded">▼ Detalles</span>
                                        </summary>
                                        <div className="p-4 bg-white border-t-2 border-gray-100 text-sm flex flex-col gap-3">
                                            <p className="text-gray-800 font-semibold">{item.question}</p>
                                            <div className="bg-gray-50 rounded p-3 border border-gray-200 relative overflow-hidden">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-gray-300"></div>
                                                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1 pl-2">Tu Respuesta:</p>
                                                <p className="text-gray-700 italic pl-2">"{item.userAnswer}"</p>
                                            </div>
                                            {item.feedback && (
                                                <div className="bg-indigo-50/50 rounded p-3 border border-indigo-100 relative overflow-hidden">
                                                    <div className="absolute top-0 left-0 w-1 h-full bg-[#6366f1]"></div>
                                                    <p className="text-[10px] text-indigo-500 uppercase font-black tracking-widest mb-1 pl-2">Feedback del Oráculo:</p>
                                                    <p className="text-indigo-900 leading-relaxed pl-2 text-xs font-medium">{item.feedback}</p>
                                                </div>
                                            )}
                                        </div>
                                    </details>
                                ))}
                            </div>
                        </div>
                    ))}

                    {evaluationHistory.length > 5 && (
                        <div className="flex justify-center mt-6">
                            <button
                                onClick={() => setShowAllMissions(!showAllMissions)}
                                className="bg-white hover:bg-indigo-50 text-[#4f46e5] font-black py-3 px-8 rounded-sm border-b-4 border-r-4 border-t-2 border-l-2 border-[#4f46e5] transition-all hover:-translate-y-1 active:translate-y-0 active:border-b-2 active:border-r-2 uppercase tracking-widest text-xs shadow-md"
                            >
                                {showAllMissions ? '↑ Ocultar Detalles' : `↓ Ver las ${evaluationHistory.length - 5} misiones restantes`}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* ACTIVATION SECTION */}
            <div className="w-full bg-rose-50 border-4 border-[#e11d48] rounded-sm p-6 md:p-10 shadow-[8px_8px_0_rgba(225,29,72,0.3)] text-center flex flex-col items-center">
                <h3 className="font-black text-[#be123c] text-2xl md:text-3xl uppercase tracking-wide mb-3 drop-shadow-sm">Desbloquea tu Próxima Aventura</h3>
                <p className="text-rose-900 font-medium mb-8 max-w-2xl mx-auto text-sm md:text-base">Activa tu suscripción para acceder a clases grupales guiadas, métricas en tiempo real y asegurar tu ascenso directo desde la <strong className="text-[#be123c]">Banda {calculatedBanda}</strong>.</p>

                <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 justify-center w-full max-w-3xl">
                    <div className="bg-white border-4 border-[#e11d48] py-3 px-6 rounded-sm shadow-sm flex items-center justify-center min-w-[200px]">
                        <span className="text-2xl font-black text-gray-900">$1,400 <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">MXN / mes</span></span>
                    </div>
                    <button
                        onClick={handleCheckout}
                        disabled={isCheckingOut}
                        className="w-full md:w-auto bg-[#e11d48] hover:bg-[#be123c] border-b-4 border-r-4 border-t-2 border-l-2 border-[#9f1239] border-t-[#fda4af] border-l-[#fda4af] text-white font-black py-4 px-8 text-xl transition-all hover:-translate-y-1 focus:outline-none uppercase tracking-widest flex items-center justify-center flex-1 disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_4px_10px_rgba(225,29,72,0.4)]"
                    >
                        {isCheckingOut ? (
                            <span className="animate-pulse flex items-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Procesando...
                            </span>
                        ) : 'Iniciar Suscripción ➜'}
                    </button>
                </div>
                {error && <div className="mt-6 border-4 border-red-500 bg-red-50 text-red-700 font-bold p-3 text-sm uppercase max-w-lg w-full">{error}</div>}
            </div>
        </div>
    );
}
