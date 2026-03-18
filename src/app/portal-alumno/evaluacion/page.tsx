'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Settings } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { questionBank, Question, QuestionLevel, QuestionCategory } from './questions';

import LevelModal from '@/components/evaluation/LevelUpModal';
import AdventurerReport from '@/components/evaluation/AdventurerReport';

const CATEGORIES: QuestionCategory[] = [ // 5 domains
    'Gramática y Vocabulario',
    'Comprensión Auditiva',
    'Producción Escrita',
    'Producción Oral',
    'Identificación Visual'
];

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

const getBandaTitle = (banda: number): string => {
    switch (banda) {
        case 1: return "Iniciación Inmersiva";
        case 2: return "Básico Funcional";
        case 3: return "Aventurero Independiente";
        default: return "Iniciación Inmersiva";
    }
};

const getBandaDescription = (banda: number): string => {
    switch (banda) {
        case 1: return "Interacción simple con apoyo.";
        case 2: return "Tareas rutinarias y comunicación directa.";
        case 3: return "Justificar planes y negociar soluciones.";
        default: return "";
    }
};

const LEVEL_PROGRESSION: QuestionLevel[] = ['Pre-A1', 'A1', 'A1-alto', 'A2', 'A2-alto', 'B1'];

export default function EvaluacionYBanda() {
    const router = useRouter();
    const supabase = createClient();

    const [userId, setUserId] = useState<string | null>(null);
    const [userMetadata, setUserMetadata] = useState<{ name: string, email: string } | null>(null);
    const [hasStarted, setHasStarted] = useState(false);

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

    // Level up animation states
    const [currentGlobalBanda, setCurrentGlobalBanda] = useState<number>(1);
    const [levelChangeType, setLevelChangeType] = useState<'up' | 'down' | null>(null);
    const [pendingNextQuestion, setPendingNextQuestion] = useState<(() => void) | null>(null);

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

    const [showDevMode, setShowDevMode] = useState(false);
    const [showResults, setShowResults] = useState(false);

    // Initial check for session
    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/portal-alumno'); // Not logged in
            } else {
                setUserId(user.id);
                const name = user.user_metadata?.first_name
                    ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`.trim()
                    : user.email?.split('@')[0] || 'Aventurero';
                const email = user.email || '';
                setUserMetadata({ name, email });

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
            const questionToSet = { ...availableQuestions[randomIndex] };

            if (questionToSet.options) {
                const shuffledOptions = [...questionToSet.options];
                // Fisher-Yates shuffle
                for (let i = shuffledOptions.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
                }
                questionToSet.options = shuffledOptions;
            }

            setCurrentQuestion(questionToSet);
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

    const playFeedbackSound = (isCorrect: boolean) => {
        const type = isCorrect ? 'accept' : 'deny';
        const num = Math.floor(Math.random() * 3) + 1; // 1 to 3
        const audio = new Audio(`/audios/sounds-effect/Villager_${type}${num}.ogg`);
        audio.volume = 0.5;
        audio.play().catch(e => console.error("Error playing sound", e));
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

            playFeedbackSound(finalIsCorrect);

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

        // --- GLOBAL LEVEL UP/DOWN CHECK ---
        let totalIndex = 0;
        CATEGORIES.forEach(cat => {
            totalIndex += LEVEL_PROGRESSION.indexOf(newCategoryLevels[cat]);
        });
        const averageIndex = Math.round(totalIndex / CATEGORIES.length);
        const globalLevel = LEVEL_PROGRESSION[averageIndex];
        const newGlobalBanda = getBandaFromLevel(globalLevel);

        let didLevelChange: 'up' | 'down' | null = null;
        if (newGlobalBanda > currentGlobalBanda) {
            didLevelChange = 'up';
            setCurrentGlobalBanda(newGlobalBanda);
        } else if (newGlobalBanda < currentGlobalBanda) {
            didLevelChange = 'down';
            setCurrentGlobalBanda(newGlobalBanda);
        }

        if (categoryJustCompleted) {
            const nextAction = () => handleCategoryComplete(currentCat, nextCatLevel, newAnsweredIds, activeCategoryIndex);
            if (didLevelChange) {
                setPendingNextQuestion(() => nextAction);
                setLevelChangeType(didLevelChange);
            } else {
                nextAction();
            }
            return;
        }

        // --- ROUND ROBIN TO NEXT CATEGORY ---
        // Find next non-completed category
        let nextIndex = (activeCategoryIndex + 1) % CATEGORIES.length;

        // Failsafe exit if all somehow completed or count is very high (max 30 qs for safety limit)
        if (completedCategories.size >= CATEGORIES.length || newCount >= 30) {
            const nextAction = () => finishQuiz();
            if (didLevelChange) {
                setPendingNextQuestion(() => nextAction);
                setLevelChangeType(didLevelChange);
            } else {
                nextAction();
            }
            return;
        }

        while (completedCategories.has(CATEGORIES[nextIndex])) {
            nextIndex = (nextIndex + 1) % CATEGORIES.length;
            // Prevent infinite loop if logic fails
            if (nextIndex === activeCategoryIndex) break;
        }

        const nextAction = () => loadNextQuestion(CATEGORIES[nextIndex], newCategoryLevels[CATEGORIES[nextIndex]], newAnsweredIds, nextIndex);
        if (didLevelChange) {
            setPendingNextQuestion(() => nextAction);
            setLevelChangeType(didLevelChange);
        } else {
            nextAction();
        }
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
                // Update user's general english level
                const { error: updateError } = await supabase
                    .from('users')
                    .update({ english_level: `Banda ${bandaResult}` })
                    .eq('id', userId);

                if (updateError) {
                    throw updateError;
                }

                // Veredicto del Oráculo (narrativa estática/dinámica)
                const aiOracleVerdict = "¡Gran trabajo, aventurero! He analizado tu desempeño a lo largo de las pruebas. Posees una base sólida que promete mucho potencial. Tu próxima meta será afianzar ese conocimiento para comunicarte de manera más fluida con los aldeanos y sortear obstáculos de nivel intermedio con total seguridad.";

                // Guardar la evaluación detallada en la nueva tabla 'evaluations'
                const { error: insertError } = await supabase
                    .from('evaluations')
                    .insert({
                        user_id: userId,
                        calculated_band: bandaResult,
                        category_levels: categoryLevels, // Final category levels
                        evaluation_history: evaluationHistory, // Historial completo con QA y Feedback
                        ai_oracle_verdict: aiOracleVerdict
                    });

                if (insertError) {
                    console.error("Error saving detailed evaluation:", insertError);
                    // It's up to you if you want to throw here or just log it. Let's throw so the user knows.
                    throw new Error("Error guardando el historial de evaluación.");
                }
            }

            setIsQuizFinished(true);
        } catch (err: any) {
            setError(err.message || 'Error al guardar el nivel y resultados. Intenta de nuevo.');
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

    const currentTotalIndex = CATEGORIES.reduce((acc, cat) => acc + LEVEL_PROGRESSION.indexOf(categoryLevels[cat]), 0);
    let xpPercentage = 0;
    if (currentGlobalBanda === 1) {
        xpPercentage = (currentTotalIndex / 7) * 100;
    } else if (currentGlobalBanda === 2) {
        xpPercentage = (Math.max(0, currentTotalIndex - 8) / 9) * 100;
    } else {
        xpPercentage = (Math.max(0, currentTotalIndex - 18) / 7) * 100;
    }
    xpPercentage = Math.min(100, Math.max(0, xpPercentage));

    return (
        <div 
            className="relative min-h-screen w-full font-sans overflow-x-hidden bg-cover bg-center bg-fixed bg-no-repeat"
            style={{ backgroundImage: "url('/images/evaluacion/fondo_quiz.webp')" }}
        >
            {/* Overlay para la imagen de fondo */}
            <div className="fixed inset-0 bg-black/40 z-0 pointer-events-none" />

            {/* Main Scrollable Container */}
            <div className={`relative z-10 w-full min-h-screen flex flex-col items-center px-4 md:px-8 ${isQuizFinished ? 'py-8 md:py-12' : 'py-10 md:py-16'}`}>
                
                {/* Form Card */}
                <div className={`my-auto bg-white rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-t-8 border-[#815a9b] flex flex-col transition-all w-full ${isQuizFinished ? 'max-w-[90rem] p-4 md:p-8' : 'max-w-4xl p-6 md:p-10'}`}>

                    {!isQuizFinished ? (
                        !hasStarted ? (
                            /* INTRO SCREEN */
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in text-gray-800 h-full">
                                {/* Left Column: Intro & Scale */}
                                <div className="space-y-6 flex flex-col justify-start">
                                    {/* Icon / Title area */}
                                    <div className="flex items-center gap-4">
                                        <div className="shrink-0">
                                            <svg
                                                viewBox="0 0 184.08 72.96"
                                                width="184"
                                                height="73"
                                                className="h-12 md:h-16 w-auto fill-[#815a9b]"
                                                aria-hidden="true"
                                                focusable="false"
                                                preserveAspectRatio="xMidYMid meet"
                                            >
                                                <g>
                                                    <path d="M172.51,0H11.57C5.18,0,0,5.18,0,11.57v27.75c0,6.39,5.18,11.57,11.57,11.57l146.64,.96c1.83,.01,3.32-1.47,3.32-3.3h0c0-1.82-1.48-3.3-3.3-3.3l-146.66,.04c-3.29,0-5.96-2.67-5.96-5.96V11.57c0-3.29,2.67-5.96,5.96-5.96H172.51c3.29,0,5.96,2.67,5.96,5.96V45.09c0,5.04-1.93,5.48-4.22,6.28-4.53,1.58-4.99,3.68-5.29,4.22-2.07,3.95-.07,11.69,7.67,17.37-2.88-4.78-3.61-8.74-3.83-11.03-.18-1.95,.01-2.77,.4-3.43,1.47-2.55,5.03-1.66,7.76-3.81,1.33-1.05,2.82-3.09,3.12-7.52V11.57c0-6.39-5.18-11.57-11.57-11.57Z" />
                                                    <g>
                                                        <path d="M137.88,26.91h-3.93v-1.15s6.73-.36,6.73-5.41v-1.81s-.13-5.94-6.96-5.94h-14.76v25.87h6.2v-9.2h9.84v9.2h6.12v-8.3c0-.82-.31-1.58-.81-2.15-.6-.67-1.47-1.1-2.44-1.1Zm-12.92-3.08v-6.25h7.85c2.03,0,2.16,1.99,2.16,1.99v1.7c0,2.39-2.59,2.56-2.59,2.56h-7.41Z" />
                                                        <path d="M164.21,38.46h6.47l-9.49-26h-9.04l-9.13,26h6.47l2.15-6.85h10.38l2.18,6.85Zm-11.06-11.64l2.9-9.22h1.51l2.94,9.22h-7.35Z" />
                                                    </g>
                                                    <g>
                                                        <path d="M76.18,11.88h-12.33v25.86h12.33c6.19,0,11.2-5.02,11.2-11.2v-3.46c0-6.19-5.02-11.2-11.2-11.2Zm5.6,14.66c0,3.09-2.51,5.6-5.6,5.6h-6.73v-14.65h6.73c3.09,0,5.6,2.51,5.6,5.6v3.46Z" />
                                                        <path d="M104.37,11.88h-3.16c-6.28,0-11.37,5.09-11.37,11.37v3.12c0,6.28,5.09,11.37,11.37,11.37h3.16c6.19,0,11.2-5.02,11.2-11.2v-3.46c0-6.19-5.02-11.2-11.2-11.2Zm5.6,14.66c0,3.09-2.51,5.6-5.6,5.6h-3.16c-3.18,0-5.76-2.58-5.76-5.76v-3.12c0-3.18,2.58-5.76,5.76-5.76h3.16c3.09,0,5.6,2.51,5.6,5.6v3.46Z" />
                                                    </g>
                                                    <g>
                                                        <path d="M20.94,12.11h-5.61v23.36c0,1.55,1.26,2.81,2.81,2.81h15.17v-5.61h-12.38V12.11Z" />
                                                        <path d="M54.67,12.11v15.51c0,3.08-2.51,5.59-5.6,5.59h-1.69c-3.18,0-5.77-2.58-5.77-5.76V12.11h-5.61v15.34c0,6.28,5.09,11.37,11.37,11.37h1.69c6.19,0,11.2-5.02,11.2-11.2V12.11h-5.61Z" />
                                                    </g>
                                                </g>
                                                <g>
                                                    <path d="M16.02,65.8v-7.2h1.03v6.31h3.9v.9h-4.93Z" />
                                                    <path d="M35.09,64.91h4.2v.9h-5.23v-7.2h5.08v.9h-4.05v5.41Zm-.09-3.2h3.7v.88h-3.7v-.88Z" />
                                                    <path d="M51.8,65.8l3.26-7.2h1.02l3.27,7.2h-1.08l-2.91-6.63h.41l-2.91,6.63h-1.06Zm1.39-1.8l.28-.82h4.05l.3,.82h-4.63Z" />
                                                    <path d="M72.36,65.8v-7.2h2.81c.63,0,1.17,.1,1.62,.3,.45,.2,.79,.49,1.03,.86s.36,.83,.36,1.35-.12,.97-.36,1.34-.58,.66-1.03,.86c-.45,.2-.98,.3-1.62,.3h-2.24l.46-.47v2.67h-1.03Zm1.03-2.56l-.46-.5h2.21c.66,0,1.16-.14,1.5-.43,.34-.29,.51-.68,.51-1.2s-.17-.91-.51-1.19c-.34-.28-.84-.42-1.5-.42h-2.21l.46-.51v4.26Zm3.79,2.56l-1.83-2.61h1.1l1.85,2.61h-1.12Z" />
                                                    <path d="M91.78,65.8v-7.2h.84l4.76,5.92h-.44v-5.92h1.03v7.2h-.84l-4.76-5.92h.44v5.92h-1.03Z" />
                                                    <path d="M112.07,65.8v-7.2h1.03v7.2h-1.03Z" />
                                                    <path d="M127.2,65.8v-7.2h.84l4.76,5.92h-.44v-5.92h1.03v7.2h-.84l-4.76-5.92h.44v5.92h-1.03Z" />
                                                    <path d="M150.74,65.88c-.56,0-1.07-.09-1.53-.27s-.87-.44-1.21-.77c-.34-.33-.61-.72-.8-1.17-.19-.45-.29-.94-.29-1.47s.1-1.03,.29-1.47c.19-.45,.46-.83,.81-1.17,.35-.33,.75-.59,1.22-.77,.47-.18,.98-.27,1.54-.27s1.09,.09,1.56,.28c.47,.19,.87,.46,1.2,.83l-.64,.64c-.29-.29-.62-.5-.96-.63s-.72-.2-1.13-.2-.79,.07-1.15,.21c-.35,.14-.66,.33-.92,.58-.26,.25-.46,.54-.6,.88-.14,.34-.21,.71-.21,1.11s.07,.76,.21,1.1c.14,.34,.34,.63,.6,.88,.26,.25,.56,.44,.91,.58,.35,.14,.73,.21,1.14,.21,.38,0,.75-.06,1.11-.18,.35-.12,.68-.32,.98-.6l.59,.78c-.36,.3-.77,.53-1.25,.68s-.97,.23-1.48,.23Zm1.74-1.05v-2.68h.99v2.81l-.99-.13Z" />
                                                </g>
                                            </svg>
                                        </div>
                                    </div>

                                    <p className="text-gray-600 font-medium text-lg leading-relaxed">
                                        Esta prueba medirá tu nivel actual para ubicarte en una de nuestras <strong>Bandas de Aventura</strong>.
                                    </p>

                                    <div className="bg-[#fdfaff] border-b-4 border-r-4 border-t-2 border-l-2 border-b-[#815a9b] border-r-[#815a9b] border-t-purple-100 border-l-purple-100 p-6 space-y-4 shadow-sm">
                                        <h4 className="font-black text-[#815a9b] uppercase text-xs tracking-tighter mb-2">Sistema de Bandas de Aventura</h4>

                                        <div className="flex items-start gap-4">
                                            <div className="w-4 h-4 rounded-none bg-blue-500 mt-1 flex-shrink-0"></div>
                                            <div>
                                                <p className="font-bold text-gray-900 leading-none mb-1 text-sm">Banda 1: "{getBandaTitle(1)}"</p>
                                                <p className="text-[11px] text-gray-600 leading-tight">Interactuar de forma simple con apoyo.</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="w-4 h-4 rounded-none bg-green-500 mt-1 flex-shrink-0"></div>
                                            <div>
                                                <p className="font-bold text-gray-900 leading-none mb-1 text-sm">Banda 2: "{getBandaTitle(2)}"</p>
                                                <p className="text-[11px] text-gray-600 leading-tight">Tareas rutinarias y comunicación directa.</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="w-4 h-4 rounded-none bg-yellow-500 mt-1 flex-shrink-0"></div>
                                            <div>
                                                <p className="font-bold text-gray-900 leading-none mb-1 text-sm">Banda 3: "{getBandaTitle(3)}"</p>
                                                <p className="text-[11px] text-gray-600 leading-tight">Justificar planes y soluciones complejas.</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4 opacity-50 border-t border-gray-300 pt-3">
                                            <div className="w-4 h-4 rounded-none bg-orange-500 mt-1 flex-shrink-0"></div>
                                            <div>
                                                <p className="font-bold text-gray-900 leading-none mb-1 text-sm">Próximas Fronteras</p>
                                                <p className="text-[11px] text-gray-600 leading-tight">Dominio avanzado (Desbloqueado post-prueba)</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Info & Start Button */}
                                <div className="space-y-6 bg-white p-6 md:p-8 rounded-none border-b-4 border-r-4 border-t-2 border-l-2 border-[#5e4171] flex flex-col justify-between h-full bg-opacity-90 transition-all">
                                    <div className="space-y-8">

                                        <div className="space-y-4 pt-2">
                                            <h3 className="font-bold text-gray-900">Ten en cuenta que:</h3>
                                            <ul className="space-y-4">
                                                <li className="flex items-start gap-3 text-sm text-gray-800 font-medium">
                                                    <div className="w-2 h-2 rounded-none bg-[#815a9b] mt-1.5 flex-shrink-0"></div>
                                                    <span>La prueba es dinámica y se adapta a tu nivel. Puede tomarte entre 10 y 30 minutos aproximadamente.</span>
                                                </li>
                                                <li className="flex items-start gap-3 text-sm text-gray-800 font-medium">
                                                    <div className="w-2 h-2 rounded-none bg-[#815a9b] mt-1.5 flex-shrink-0"></div>
                                                    <span>El test incluye ejercicios de pronunciación y para eso te pediremos que actives el micrófono.</span>
                                                </li>
                                                <li className="flex items-start gap-3 text-sm text-gray-800 font-medium">
                                                    <div className="w-2 h-2 rounded-none bg-[#815a9b] mt-1.5 flex-shrink-0"></div>
                                                    <span>Al finalizar, recibirás una ruta de aprendizaje para empezar a construir y mejorar tu inglés.</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setHasStarted(true)}
                                        className="w-full bg-[#815a9b] hover:bg-[#6a4a7f] border-b-4 border-r-4 border-t-2 border-l-2 border-b-[#5e4171] border-r-[#5e4171] border-t-[#a78bbf] border-l-[#a78bbf] text-white font-black py-5 px-6 text-xl md:text-2xl mt-8 flex justify-between items-center transition-all hover:-translate-y-1 focus:outline-none uppercase tracking-widest shadow-xl group"
                                    >
                                        <span className="group-hover:translate-x-1 transition-transform">Iniciar aventura</span>
                                        <span>➜</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* QUIZ SECTION */
                            <div className="flex flex-col gap-6 animate-fade-in relative">
                                
                                {levelChangeType && (
                                    <LevelModal 
                                        banda={currentGlobalBanda} 
                                        title={getBandaTitle(currentGlobalBanda)} 
                                        type={levelChangeType}
                                        onClose={() => {
                                            setLevelChangeType(null);
                                            if (pendingNextQuestion) {
                                                pendingNextQuestion();
                                                setPendingNextQuestion(null);
                                            }
                                        }} 
                                    />
                                )}

                                       <div className="flex flex-col gap-2 mb-4 border-b-2 border-purple-100 pb-4">
                                        <div className="flex items-center justify-between font-black uppercase text-sm">
                                            <span className="text-gray-500 tracking-widest flex items-center gap-2">
                                                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                                EXPERIENCIA
                                            </span>
                                            <span className="text-[#815a9b]">Banda {currentGlobalBanda}</span>
                                        </div>

                                        {/* Progress bar (Minecraft EXP style) */}
                                        <div className="w-full bg-gray-200 h-4 rounded-sm border-2 border-gray-400 overflow-hidden relative">
                                            <div 
                                                className={`h-full transition-all duration-700 ease-out flex items-center justify-end ${xpPercentage < 20 && xpPercentage > 0 ? 'bg-purple-300' : 'bg-[#815a9b]'}`}
                                                style={{ width: `${xpPercentage}%` }}
                                            >
                                            <div className="h-full w-full bg-gradient-to-r from-transparent to-white/30 hidden md:block"></div>
                                        </div>
                                    </div>
                                    <div className="text-right text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1 flex justify-between">
                                        <span>EXP {Math.round(xpPercentage)}%</span>
                                        <span>Misión actual: <span className="text-gray-600">{currentQuestion?.category}</span></span>
                                    </div>
                                </div>

                                <div className="flex justify-end -mt-4">
                                    <button
                                        onClick={() => setShowDevMode(!showDevMode)}
                                        className="text-[10px] uppercase tracking-tighter text-gray-400 hover:text-orange-500 transition-colors font-bold"
                                    >
                                        {showDevMode ? 'Ocultar Dev Mode' : 'Abrir Dev Mode'}
                                    </button>
                                </div>

                                {showDevMode && (
                                    <div className="p-5 bg-orange-50 border-2 border-orange-200 rounded-2xl animate-in slide-in-from-top-2 duration-200">
                                        <h3 className="font-bold text-orange-800 mb-4 flex items-center gap-2 text-sm">
                                            <Settings className="w-4 h-4" /> MODO DESARROLLADOR Ludora
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                            {CATEGORIES.map(cat => (
                                                <div key={cat} className="flex flex-col gap-1">
                                                    <label className="text-[10px] font-bold text-gray-500 uppercase">{cat}</label>
                                                    <select
                                                        value={categoryLevels[cat]}
                                                        onChange={(e) => setCategoryLevels({ ...categoryLevels, [cat]: e.target.value as QuestionLevel })}
                                                        className="p-2 border rounded-lg bg-white text-xs font-medium text-gray-700 outline-none focus:ring-1 focus:ring-orange-500"
                                                    >
                                                        {LEVEL_PROGRESSION.map(lvl => (
                                                            <option key={lvl} value={lvl}>{lvl}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <button
                                                onClick={finishQuiz}
                                                disabled={isSaving}
                                                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md shadow-orange-600/20 disabled:opacity-50"
                                            >
                                                {isSaving ? 'Guardando...' : '⏩ Finalizar y Ver Reporte'}
                                            </button>
                                            <button
                                                onClick={() => router.push('/portal-alumno/evaluacion/tester')}
                                                className="flex-1 bg-white border-2 border-orange-200 hover:border-orange-400 text-orange-600 font-bold py-3 px-4 rounded-xl transition-all"
                                            >
                                                🔍 Probador de Preguntas
                                            </button>
                                        </div>
                                    </div>
                                )}

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
                                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
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
                                                        className={`w-full text-left p-4 rounded-xl border-2 border-gray-200 hover:border-[#815a9b] hover:bg-purple-50 transition-all font-medium text-gray-700 disabled:opacity-50 ${currentQuestion.type === 'image-choice' ? 'flex flex-col items-center justify-center text-center' : ''}`}
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
                                                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-[#815a9b] outline-none min-h-[120px] resize-none transition-all focus:bg-purple-50"
                                                    placeholder="Escribe tu respuesta en inglés aquí..."
                                                    value={textInputValue}
                                                    onChange={(e) => setTextInputValue(e.target.value)}
                                                ></textarea>
                                                <button
                                                    onClick={() => handleAnswerSubmission(false, textInputValue, undefined, true)}
                                                    disabled={textInputValue.trim().length === 0}
                                                    className="w-full bg-[#815a9b] hover:bg-[#6a4a7f] text-white font-black py-4 rounded-xl shadow-[0_4px_0_#5e4171] border-b-4 border-r-4 border-t-2 border-l-2 border-[#5e4171] transition-all active:translate-y-1 active:shadow-none disabled:opacity-50 uppercase tracking-widest"
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
                                                            className={`w-20 h-20 rounded-full flex items-center justify-center text-white mx-auto shadow-lg mb-4 transition-all focus:outline-none ${isRecording ? 'bg-red-500 animate-pulse scale-110 shadow-red-500/50' : 'bg-[#815a9b] hover:scale-105 hover:bg-[#6a4a7f] shadow-[#815a9b]/30 disabled:opacity-50'}`}
                                                        >
                                                            {isRecording ? (
                                                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm6 4a1 1 0 10-2 0v2a1 1 0 102 0V9zm4 0a1 1 0 10-2 0v2a1 1 0 102 0V9z" clipRule="evenodd" /></svg>
                                                            ) : (
                                                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
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
                                                                className="bg-[#815a9b] text-white py-3 rounded-xl font-bold hover:bg-[#6a4a7f] transition-all shadow-[0_4px_0_#5e4171]"
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
                                        <div className="w-12 h-12 border-4 border-[#815a9b] border-t-transparent rounded-full animate-spin"></div>
                                        <p className="font-bold text-[#815a9b] animate-pulse">La Inteligencia Artificial está evaluando tu respuesta...</p>
                                    </div>
                                )}
                            </div>
                        )
                    ) : (

                        <div className="flex flex-col items-center gap-6 animate-fade-in w-full max-w-7xl mx-auto">
                            {!showResults ? (
                                <div className="flex flex-col items-center justify-center p-8 bg-white/95 rounded-sm shadow-[8px_8px_0_rgba(129,90,155,0.3)] border-4 border-[#815a9b] text-center w-full max-w-2xl mx-auto my-12 animate-fade-in-up">
                                    <div className="w-24 h-24 bg-purple-100 rounded-full border-4 border-[#815a9b] flex items-center justify-center shadow-md mb-6 animate-bounce">
                                        <span className="text-5xl">🏆</span>
                                    </div>
                                    <h2 className="text-3xl md:text-5xl font-black text-gray-900 drop-shadow-sm mb-4">¡Completaste la Evaluación!</h2>
                                    <p className="text-gray-700 text-lg md:text-xl font-medium mb-8">
                                        ¡Excelente trabajo! Has demostrado tus habilidades y ahora tu perfil de aventurero está listo para ser revelado.
                                    </p>
                                    <button
                                        onClick={() => setShowResults(true)}
                                        className="bg-[#815a9b] hover:bg-[#6a4a7f] text-white font-black py-4 px-8 text-xl rounded-sm transition-all hover:-translate-y-1 shadow-[0_4px_10px_rgba(129,90,155,0.4)] border-b-4 border-r-4 border-t-2 border-l-2 border-[#5e4171] border-t-[#a78bbf] border-l-[#a78bbf] uppercase tracking-widest focus:outline-none"
                                    >
                                        Ver Resultados ➜
                                    </button>
                                </div>
                            ) : (
                                <AdventurerReport 
                                    calculatedBanda={calculatedBanda}
                                    finalCategoryLevels={finalCategoryLevels}
                                    evaluationHistory={evaluationHistory}
                                    isCheckingOut={isCheckingOut}
                                    handleCheckout={handleCheckout}
                                    error={error}
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
