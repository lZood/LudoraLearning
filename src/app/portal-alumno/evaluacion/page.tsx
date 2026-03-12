'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
    import { questionBank, Question, QuestionLevel, QuestionCategory } from './questions';

    const CATEGORIES: QuestionCategory[] = [ // 5 domains
        'Gramática y Vocabulario', 
        'Comprensión Auditiva', 
        'Producción Escrita', 
        'Producción Oral', 
        'Identificación Visual'
    ];

    // Mapeo interno a bandas
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

    const LEVEL_PROGRESSION: QuestionLevel[] = ['Pre-A1', 'A1', 'A1-alto', 'A2', 'A2-alto', 'B1'];

    export default function EvaluacionYBanda() {
        const router = useRouter();
        const supabase = createClient();
        
        const [userId, setUserId] = useState<string | null>(null);
        
        // CAT States - Multidimensional
        const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
        
        // Rastreo individual de nivel por categoría
        const [categoryLevels, setCategoryLevels] = useState<Record<QuestionCategory, QuestionLevel>>({
            'Gramática y Vocabulario': 'Pre-A1',
            'Comprensión Auditiva': 'Pre-A1',
            'Producción Escrita': 'Pre-A1',
            'Producción Oral': 'Pre-A1',
            'Identificación Visual': 'Pre-A1'
        });

        // Historial individual para saber cuándo detener una categoría
        const [categoryHistory, setCategoryHistory] = useState<Record<QuestionCategory, Record<QuestionLevel, { correct: number, incorrect: number }>>>(() => {
            const initial: any = {};
            CATEGORIES.forEach(cat => {
                initial[cat] = {
                    'Pre-A1': { correct: 0, incorrect: 0 },
                    'A1': { correct: 0, incorrect: 0 },
                    'A1-alto': { correct: 0, incorrect: 0 },
                    'A2': { correct: 0, incorrect: 0 },
                    'A2-alto': { correct: 0, incorrect: 0 },
                    'B1': { correct: 0, incorrect: 0 },
                };
            });
            return initial;
        });

        const [activeCategoryIndex, setActiveCategoryIndex] = useState(0); // Round robin
        const [completedCategories, setCompletedCategories] = useState<Set<QuestionCategory>>(new Set());
        
        const [questionsAnsweredCount, setQuestionsAnsweredCount] = useState(0);
        const [answeredIds, setAnsweredIds] = useState<Set<string>>(new Set());

        // Multimedia and Input States
        const [textInputValue, setTextInputValue] = useState('');
        const [isRecording, setIsRecording] = useState(false);
        const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
        const [audioChunks, setAudioChunks] = useState<BlobPart[]>([]);
        const [audioUrlBlob, setAudioUrlBlob] = useState<string | null>(null);
        const [isEvaluatingAI, setIsEvaluatingAI] = useState(false);

        const [isQuizFinished, setIsQuizFinished] = useState(false);
        
        // El nivel final asignado a cada categoría
        const [finalCategoryLevels, setFinalCategoryLevels] = useState<Record<QuestionCategory, QuestionLevel> | null>(null);
        
        const [calculatedBanda, setCalculatedBanda] = useState<number | null>(null);
        const [isSaving, setIsSaving] = useState(false);
        const [isCheckingOut, setIsCheckingOut] = useState(false);
        const [error, setError] = useState<string | null>(null);

        // Preview & Skip States
        const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
        const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
        const [showAudioPreview, setShowAudioPreview] = useState(false);

        // Evaluation History for detailed results
        const [evaluationHistory, setEvaluationHistory] = useState<Array<{
            question: string;
            category: string;
            userAnswer: string;
            isCorrect: boolean;
            feedback: string | null;
            level: QuestionLevel;
        }>>([]);

    // Initial check for session
    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/portal-alumno'); // Not logged in
            } else {
                setUserId(user.id);
                // Check if already has a level (optional, assuming new user flow)
                const { data: userData } = await supabase
                    .from('users')
                    .select('english_level')
                    .eq('id', user.id)
                    .single();
                if (userData?.english_level) {
                    setIsQuizFinished(true);
                    setCalculatedBanda(parseInt(userData.english_level.replace('Banda ', '')));
                } else {
                    // Cargar primera pregunta Round Robin
                    loadNextQuestion(CATEGORIES[0], categoryLevels['Gramática y Vocabulario'], new Set(), 0);
                }
            }
        };
        checkAuth();
    }, [router, supabase]);

    const loadNextQuestion = (targetCategory: QuestionCategory, targetLevel: QuestionLevel, answered: Set<string>, categoryIndex: number) => {
        setTextInputValue('');
        setAudioUrlBlob(null);
        setAudioChunks([]);
        
        let availableQuestions = questionBank.filter(q => q.category === targetCategory && q.level === targetLevel && !answered.has(q.id));
        
        // Fallback robusto: Si no hay preguntas exactas de este nivel para esta categoría (banco incompleto),
        // busca cualquier pregunta disponible para la categoría, idealmente cercana.
        if (availableQuestions.length === 0) {
           availableQuestions = questionBank.filter(q => q.category === targetCategory && !answered.has(q.id));
        }

        if (availableQuestions.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableQuestions.length);
            setCurrentQuestion(availableQuestions[randomIndex]);
            setActiveCategoryIndex(categoryIndex);
        } else {
            // Si literalmente no hay MÁS preguntas de esta categoría en TODA la base de datos, márcala como completada y salta a la siguiente.
            handleCategoryComplete(targetCategory, targetLevel, answered, categoryIndex);
        }
    };

    const handleCategoryComplete = (category: QuestionCategory, finalLevel: QuestionLevel, answered: Set<string>, currentIndex: number) => {
        const newCompleted = new Set(completedCategories);
        newCompleted.add(category);
        setCompletedCategories(newCompleted);

        // Advance to next available category
        if (newCompleted.size >= CATEGORIES.length) {
            finishQuiz(); // Todas terminadas
            return;
        }

        // Find next non-completed category
        let nextIndex = (currentIndex + 1) % CATEGORIES.length;
        while (newCompleted.has(CATEGORIES[nextIndex])) {
            nextIndex = (nextIndex + 1) % CATEGORIES.length;
        }

        loadNextQuestion(CATEGORIES[nextIndex], categoryLevels[CATEGORIES[nextIndex]], answered, nextIndex);
    };

    // Subida de Audio
    const uploadAudioToSupabase = async (audioBlob: Blob): Promise<string | null> => {
        if (!userId) return null;
        const fileName = `${userId}/${Date.now()}_audio.webm`;
        const { data, error } = await supabase.storage.from('student_audios').upload(fileName, audioBlob);
        if (error) {
            console.error('Error subiendo audio:', error);
            return null;
        }
        const { data: { publicUrl } } = supabase.storage.from('student_audios').getPublicUrl(data.path);
        return publicUrl;
    };

    // Evaluación con IA
    const evaluateWithGemini = async (userAnswerText?: string, base64Audio?: string, mimeType?: string): Promise<{ isCorrect: boolean, feedback: string }> => {
        if (!currentQuestion) return { isCorrect: false, feedback: 'No question' };
        
        try {
            const bodyData: any = {
                questionType: currentQuestion.type,
                questionText: currentQuestion.text,
                userAnswerText: userAnswerText,
                gradingRubric: currentQuestion.gradingRubric,
                expectedKeywords: currentQuestion.expectedKeywords
            };

            if (base64Audio) {
                // Remove data:audio/xyz;base64, prefix if present mapping via split
                bodyData.audioBase64 = base64Audio.includes(',') ? base64Audio.split(',')[1] : base64Audio;
                bodyData.audioMimeType = mimeType;
            }

            const response = await fetch('/api/evaluate-answer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyData)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            return { isCorrect: data.isCorrect, feedback: data.feedback };
        } catch (error) {
            console.error('Error contacting Gemini:', error);
            // Fallback generously if AI fails during demo
            return { isCorrect: true, feedback: 'AI error, defaulting to true' };
        }
    };

    // Función principal para manejar CUALQUIER tipo de respuesta
    const handleAnswerSubmission = async (
        isCorrectVal: boolean, 
        userAnswerTextStr?: string, 
        audioBlobToUpload?: Blob,
        needsAIEvaluation: boolean = false
    ) => {
        if (!currentQuestion) return;
        if (needsAIEvaluation) setIsEvaluatingAI(true);
        setError(null);

        let finalIsCorrect = isCorrectVal;
        let aiFeedbackStr = '';
        let uploadedAudioUrl = null;

        try {
            let base64AudioData: string | undefined;
            let mimeTypeStr: string | undefined;

            if (audioBlobToUpload) {
                uploadedAudioUrl = await uploadAudioToSupabase(audioBlobToUpload);
                
                if (needsAIEvaluation) {
                    const reader = new FileReader();
                    reader.readAsDataURL(audioBlobToUpload);
                    await new Promise((resolve) => {
                        reader.onloadend = () => {
                            base64AudioData = reader.result as string;
                            mimeTypeStr = audioBlobToUpload.type;
                            resolve(null);
                        };
                    });
                }
            }

            if (needsAIEvaluation && (userAnswerTextStr || base64AudioData)) {
                const aiResult = await evaluateWithGemini(userAnswerTextStr, base64AudioData, mimeTypeStr);
                finalIsCorrect = aiResult.isCorrect;
                aiFeedbackStr = aiResult.feedback;
            }

            // Guardar granularmente en Supabase si el ID existe
            if (userId && currentQuestion) {
                await supabase.from('evaluation_results').insert({
                    user_id: userId,
                    skill_id: currentQuestion.skillId,
                    level: categoryLevels[currentQuestion.category],
                    is_correct: finalIsCorrect,
                    user_answer_text: userAnswerTextStr || null,
                    audio_url: uploadedAudioUrl,
                    ai_feedback: aiFeedbackStr || null
                });
            }
            
            // Guardar en historial local para el resumen final
            setEvaluationHistory(prev => [...prev, {
                question: currentQuestion.text,
                category: currentQuestion.category,
                userAnswer: userAnswerTextStr || (audioBlobToUpload ? "[Audio Recording]" : "[Skipped]"),
                isCorrect: finalIsCorrect,
                feedback: aiFeedbackStr || null,
                level: categoryLevels[currentQuestion.category]
            }]);

            // Procesamos el step de CAT
            processCatStep(finalIsCorrect);

        } catch (err: any) {
            setError('Error procesando tu respuesta. Intenta de nuevo.');
            console.error(err);
        } finally {
            if (needsAIEvaluation) setIsEvaluatingAI(false);
        }
    };

    const startRecording = async () => {
        setError(null);
        setRecordedAudioBlob(null);
        setRecordedAudioUrl(null);
        setShowAudioPreview(false);
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            setMediaRecorder(recorder);
            const chunks: BlobPart[] = [];
            
            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };
            
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                setRecordedAudioBlob(blob);
                setRecordedAudioUrl(URL.createObjectURL(blob));
                setShowAudioPreview(true);
                
                // Limpiar streams para apagar el icono rojo de micrófono del navegador
                stream.getTracks().forEach(track => track.stop());
                setIsRecording(false);
            };
            
            recorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error('Error al acceder al micrófono:', err);
            setError('Error accediendo al micrófono. Por favor permite el acceso en tu navegador e intenta de nuevo.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
        }
    };

    const handleConfirmAudio = () => {
        if (recordedAudioBlob) {
            handleAnswerSubmission(false, undefined, recordedAudioBlob, true);
            setShowAudioPreview(false);
            setRecordedAudioBlob(null);
            setRecordedAudioUrl(null);
        }
    };

    const handleCancelAudio = () => {
        setShowAudioPreview(false);
        setRecordedAudioBlob(null);
        setRecordedAudioUrl(null);
    };

    const handleSkipQuestion = () => {
        // Al saltar, marcamos como falso y avanzamos (penaliza nivel de categoría)
        handleAnswerSubmission(false, "[Saltado]", undefined, false);
    };

    const processCatStep = (isCorrect: boolean) => {
        if (!currentQuestion) return;

        const currentCat = currentQuestion.category;
        const currentCatLevel = categoryLevels[currentCat];
        const newCount = questionsAnsweredCount + 1;
        
        setQuestionsAnsweredCount(newCount);

        const newAnsweredIds = new Set(answeredIds);
        newAnsweredIds.add(currentQuestion.id);
        setAnsweredIds(newAnsweredIds);

        // Update history for this category
        const newHistory = { ...categoryHistory };
        if (isCorrect) {
            newHistory[currentCat][currentCatLevel].correct += 1;
        } else {
            newHistory[currentCat][currentCatLevel].incorrect += 1;
        }
        setCategoryHistory(newHistory);

        let nextCatLevel = currentCatLevel;
        const currentLevelIndex = LEVEL_PROGRESSION.indexOf(currentCatLevel);

        // --- ADAPTIVE LOGIC FOR THIS CATEGORY ---
        let categoryJustCompleted = false;

        if (isCorrect) {
            if (currentLevelIndex < LEVEL_PROGRESSION.length - 1) {
                // Sube de nivel para esta categoría
                nextCatLevel = LEVEL_PROGRESSION[currentLevelIndex + 1];
            } else {
                // Acierto en B1, ver si ya tiene maestría (ej. 2 correctas en B1)
                if (newHistory[currentCat]['B1'].correct >= 2) {
                    categoryJustCompleted = true;
                }
            }
        } else {
            // Falla
            if (currentLevelIndex > 0) {
                // Baja un nivel por fallo
                nextCatLevel = LEVEL_PROGRESSION[currentLevelIndex - 1];
            }
            // Si falla 3 veces en CUALQUIER nivel, encontramos su "techo" y terminamos esta categoría
            if (newHistory[currentCat][currentCatLevel].incorrect >= 3) {
                categoryJustCompleted = true;
                // Asignamos el nivel anterior como consolidado (o Pre-A1 si ya estaba ahí)
                nextCatLevel = currentLevelIndex > 0 ? LEVEL_PROGRESSION[currentLevelIndex - 1] : LEVEL_PROGRESSION[0];
            }
        }

        // Update categoryLevels state
        const newCategoryLevels = { ...categoryLevels, [currentCat]: nextCatLevel };
        setCategoryLevels(newCategoryLevels);

        if (categoryJustCompleted) {
            handleCategoryComplete(currentCat, nextCatLevel, newAnsweredIds, activeCategoryIndex);
            return;
        }

        // --- ROUND ROBIN TO NEXT CATEGORY ---
        // Find next non-completed category
        let nextIndex = (activeCategoryIndex + 1) % CATEGORIES.length;
        
        // Failsafe exit if all somehow completed or count is very high (max 30 qs for safety limit)
        if (completedCategories.size >= CATEGORIES.length || newCount >= 30) {
            finishQuiz();
            return;
        }

        while (completedCategories.has(CATEGORIES[nextIndex])) {
            nextIndex = (nextIndex + 1) % CATEGORIES.length;
            // Prevent infinite loop if logic fails
            if (nextIndex === activeCategoryIndex) break; 
        }
        
        loadNextQuestion(CATEGORIES[nextIndex], newCategoryLevels[CATEGORIES[nextIndex]], newAnsweredIds, nextIndex);
    };

    const finishQuiz = async () => {
        setIsSaving(true);
        setError(null);
        try {
            // El nivel de cada categoría es donde quedó al completar/terminar
            setFinalCategoryLevels(categoryLevels);
            
            // Calculamos una Banda Global promediando los índices
            let totalIndex = 0;
            CATEGORIES.forEach(cat => {
                totalIndex += LEVEL_PROGRESSION.indexOf(categoryLevels[cat]);
            });
            const averageIndex = Math.round(totalIndex / CATEGORIES.length);
            const globalLevel = LEVEL_PROGRESSION[averageIndex];
            
            const bandaResult = getBandaFromLevel(globalLevel);
            setCalculatedBanda(bandaResult);
            
            // Save to Supabase
            if (userId) {
                const { error: updateError } = await supabase
                    .from('users')
                    .update({ english_level: `Banda ${bandaResult}` })
                    .eq('id', userId);

                if (updateError) {
                    throw updateError;
                }
            }
            
            setIsQuizFinished(true);
        } catch (err: any) {
            setError('Error al guardar el nivel. Intenta de nuevo.');
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCheckout = async () => {
        setIsCheckingOut(true);
        setError(null);
        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ priceId: 'price_1T9w8q0qbWrTcjOeZ9z9n3ae' }), // Stripe Price ID
            });
            
            const data = await response.json();
            
            if (response.ok && data.url) {
                window.location.href = data.url;
            } else {
                throw new Error(data.error || 'Error al iniciar pago');
            }
        } catch (err: any) {
            setError(err.message || 'Error de conexión');
            console.error(err);
        } finally {
            setIsCheckingOut(false);
        }
    };

    return (
        <div className="min-h-[100dvh] w-full relative flex items-center justify-center font-sans overflow-x-hidden overflow-y-auto py-12">
            {/* Nether-inspired Background */}
            <div
                className="absolute inset-0 z-0 bg-[#361A27]"
                style={{
                    backgroundImage: `
            radial-gradient(circle at 40% 30%, rgba(55, 36, 73, 0.9) 0%, transparent 60%),
            radial-gradient(circle at 80% 80%, rgba(55, 36, 73, 0.8) 0%, transparent 50%),
            radial-gradient(circle at 10% 90%, rgba(15, 115, 87, 0.15) 0%, transparent 40%)
          `,
                    filter: 'contrast(1.2) brightness(0.9)',
                }}
            >
                <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] animate-[pulse_8s_ease-in-out_infinite]" />
            </div>

            {/* Main Container */}
            <div className="relative z-10 w-full max-w-2xl px-6">
                <div className="bg-white rounded-3xl p-8 shadow-2xl shadow-[#361A27]/50 border-t-4 border-[#0F5451] flex flex-col transition-all">
                    
                    {!isQuizFinished ? (
                        /* QUIZ SECTION */
                        <div className="flex flex-col gap-6 animate-fade-in">
                            <div className="text-center">
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">Evaluación de Nivel</h1>
                                <p className="text-gray-500">
                                    Responde estas rápidas preguntas para ajustar el contenido a tus habilidades.
                                    Pregunta {questionsAnsweredCount + 1} de hasta 15
                                </p>
                            </div>

                            {/* Progress Indicator (Estimated) */}
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className="bg-gradient-to-r from-[#0F5451] to-[#0F7357] h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${Math.min(((questionsAnsweredCount) / 15) * 100, 100)}%` }}
                                ></div>
                            </div>

                            {error && <p className="text-red-500 text-center text-sm font-semibold">{error}</p>}

                            {/* Question Card */}
                            {currentQuestion && !isEvaluatingAI && (
                                <div className="mt-4 animate-fade-in">
                                     <div className="flex justify-between items-center mb-4">
                                         <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{currentQuestion.category}</span>
                                     </div>
                                     
                                     {/* Audio Listening player if applicable */}
                                     {currentQuestion.type === 'audio-listening' && currentQuestion.audioUrl && (
                                         <div className="mb-6 p-4 bg-purple-50 rounded-2xl flex items-center gap-4">
                                             <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white shrink-0">
                                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/></svg>
                                             </div>
                                             {/* Usamos controles nativos por simplicidad para la demo */}
                                             <audio controls className="w-full" src={currentQuestion.audioUrl}></audio>
                                         </div>
                                     )}

                                    <h2 className="text-xl font-semibold text-gray-800 mb-6">
                                        {currentQuestion.text}
                                    </h2>

                                    {/* Múltiples Opciones o Imágenes */}
                                    {(currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'audio-listening' || currentQuestion.type === 'image-choice') && (
                                        <div className={currentQuestion.type === 'image-choice' ? "grid grid-cols-2 gap-4" : "space-y-4"}>
                                            {currentQuestion.options?.map((option, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleAnswerSubmission(!!option.isCorrect, option.text)}
                                                    disabled={isSaving}
                                                    className={`w-full text-left p-4 rounded-xl border-2 border-gray-200 hover:border-[#0F5451] hover:bg-teal-50 transition-all font-medium text-gray-700 disabled:opacity-50 ${currentQuestion.type === 'image-choice' ? 'flex flex-col items-center justify-center text-center' : ''}`}
                                                >
                                                    {option.imageUrl && (
                                                        <img src={option.imageUrl} alt={option.text} className="w-24 h-24 object-contain mb-3" />
                                                    )}
                                                    {option.text}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Text Input */}
                                    {currentQuestion.type === 'text-input' && (
                                        <div className="space-y-4">
                                            <textarea 
                                                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-[#0F5451] outline-none min-h-[120px] resize-none"
                                                placeholder="Escribe tu respuesta en inglés aquí..."
                                                value={textInputValue}
                                                onChange={(e) => setTextInputValue(e.target.value)}
                                            ></textarea>
                                            <button 
                                                onClick={() => handleAnswerSubmission(false, textInputValue, undefined, true)}
                                                disabled={textInputValue.trim().length === 0}
                                                className="w-full bg-[#0F5451] hover:bg-[#0a3f3d] text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50"
                                            >Enviar Respuesta</button>
                                        </div>
                                    )}

                                    {/* Audio Record */}
                                    {currentQuestion.type === 'audio-record' && (
                                        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50">
                                            {!showAudioPreview ? (
                                                <div className="text-center mb-4">
                                                    <button 
                                                        onClick={isRecording ? stopRecording : startRecording}
                                                        disabled={isEvaluatingAI}
                                                        className={`w-20 h-20 rounded-full flex items-center justify-center text-white mx-auto shadow-lg mb-4 transition-all focus:outline-none ${isRecording ? 'bg-red-500 animate-pulse scale-110 shadow-red-500/50' : 'bg-[#0F5451] hover:scale-105 hover:bg-[#0a403d] shadow-[#0F5451]/30 disabled:opacity-50'}`}
                                                    >
                                                        {isRecording ? (
                                                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm6 4a1 1 0 10-2 0v2a1 1 0 102 0V9zm4 0a1 1 0 10-2 0v2a1 1 0 102 0V9z" clipRule="evenodd"/></svg>
                                                        ) : (
                                                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>
                                                        )}
                                                    </button>
                                                    <p className="font-semibold text-gray-700">{isRecording ? 'Grabando... Toca para detener' : 'Toca para grabar tu respuesta'}</p>
                                                    <p className="text-sm text-gray-500 mt-2 max-w-[250px] mx-auto">Asegúrate de permitir el acceso al micrófono de tu navegador.</p>
                                                </div>
                                            ) : (
                                                <div className="text-center w-full space-y-4">
                                                    <p className="font-bold text-gray-800">Escucha tu grabación:</p>
                                                    <audio src={recordedAudioUrl!} controls className="w-full" />
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <button 
                                                            onClick={handleConfirmAudio}
                                                            className="bg-[#0F5451] text-white py-3 rounded-xl font-bold hover:bg-[#0a3f3d] transition-all"
                                                        >Enviar</button>
                                                        <button 
                                                            onClick={handleCancelAudio}
                                                            className="bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all"
                                                        >Repetir</button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Skip button for any subjective question (text / audio) */}
                                    {!isRecording && !showAudioPreview && (
                                        <div className="mt-8 text-center">
                                            <button 
                                                onClick={handleSkipQuestion}
                                                className="text-gray-400 hover:text-gray-600 text-sm font-medium underline underline-offset-4"
                                            >No lo sé / Saltar pregunta</button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {isEvaluatingAI && (
                                <div className="py-12 flex flex-col items-center justify-center space-y-4 animate-fade-in">
                                    <div className="w-12 h-12 border-4 border-[#0F5451] border-t-transparent rounded-full animate-spin"></div>
                                    <p className="font-bold text-[#0F5451] animate-pulse">La Inteligencia Artificial está evaluando tu respuesta...</p>
                                </div>
                            )}
                        </div>

                    ) : (

                        /* CHECKOUT & ACTIVATION SECTION */
                        <div className="flex flex-col items-center text-center gap-6 animate-fade-in">
                            <div className="w-20 h-20 bg-teal-100 text-[#0F5451] rounded-full flex items-center justify-center mb-2">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>

                            <div className="w-full text-left bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-4">
                                <h3 className="font-bold text-gray-800 text-lg mb-3">Tu Perfil Lingüístico:</h3>
                                {finalCategoryLevels && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                        {Object.entries(finalCategoryLevels).map(([category, level]) => (
                                            <div key={category} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                <span className="text-gray-600 font-medium text-sm">{category}</span>
                                                <span className="font-bold text-[#0F5451]">{level}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                                    <p className="text-lg text-gray-600 font-medium">Banda Global Sugerida:</p>
                                    <p className="text-2xl font-black text-[#0F5451]">Banda {calculatedBanda}</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 w-full text-left space-y-4">
                                <h3 className="font-bold text-gray-800 text-lg text-center mb-4">Activa tu Suscripción</h3>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-3">
                                        <div className="mt-1 text-green-500"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg></div>
                                        <span className="text-gray-700">Acceso a clases híbridas grupales.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="mt-1 text-green-500"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg></div>
                                        <span className="text-gray-700">
                                            Contenido exclusivo y personalizado para asegurar tu progreso desde la <strong>Banda {calculatedBanda}</strong>.
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="mt-1 text-green-500"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg></div>
                                        <span className="text-gray-700">Certificados de nivel con validez.</span>
                                    </li>
                                </ul>
                                <div className="mt-6 pt-6 border-t border-gray-200 flex justify-between items-center px-4">
                                    <span className="text-gray-500 font-medium">Inversión mensual</span>
                                    <span className="text-2xl font-black text-gray-900">$1,400 <span className="text-sm font-medium text-gray-500">MXN</span></span>
                                </div>
                            </div>

                            {error && <p className="text-red-500 text-sm font-semibold">{error}</p>}

                            <button
                                onClick={handleCheckout}
                                disabled={isCheckingOut}
                                className="w-full bg-gradient-to-r from-[#0F5451] to-[#0F7357] hover:from-[#0b403d] hover:to-[#0a523e] text-white font-bold rounded-xl py-4 transition-all transform hover:-translate-y-0.5 shadow-lg shadow-[#0F5451]/30 focus:outline-none focus:ring-2 focus:ring-[#0F7357] focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed text-lg"
                            >
                                {isCheckingOut ? 'Procesando pago...' : 'Continuar y Pagar'}
                            </button>

                            {/* DETAILED RESULTS SECTION */}
                            <div className="w-full mt-8 border-t border-gray-100 pt-8">
                                <h3 className="font-bold text-gray-900 text-xl mb-6 text-center">Detalle de tu Desempeño</h3>
                                <div className="space-y-6">
                                    {evaluationHistory.map((item, idx) => (
                                        <div key={idx} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col gap-3">
                                            <div className="flex justify-between items-start">
                                                <span className="bg-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-400 border border-gray-100">
                                                    {item.category} • {item.level}
                                                </span>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {item.isCorrect ? 'Correcto' : 'Incorrecto'}
                                                </span>
                                            </div>
                                            <p className="text-gray-800 font-semibold leading-snug">{item.question}</p>
                                            <div className="bg-white/50 rounded-xl p-3 border border-gray-100">
                                                <p className="text-xs text-gray-400 uppercase font-bold mb-1">Tu Respuesta:</p>
                                                <p className="text-gray-600 text-sm italic">"{item.userAnswer}"</p>
                                            </div>
                                            {item.feedback && (
                                                <div className="flex gap-2 items-start mt-1">
                                                    <div className="w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                                        <span className="text-[10px] text-white font-bold">IA</span>
                                                    </div>
                                                    <p className="text-gray-600 text-sm leading-relaxed">{item.feedback}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
