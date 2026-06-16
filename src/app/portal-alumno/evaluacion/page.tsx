'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Question, QuestionLevel, QuestionCategory } from './questions';

import LevelModal from '@/components/evaluation/LevelUpModal';
import AdventurerReport from '@/components/evaluation/AdventurerReport';
import EvaluationIntro from '@/components/evaluation/EvaluationIntro';
import QuizScreen from '@/components/evaluation/QuizScreen';
import CompletionTransition from '@/components/evaluation/CompletionTransition';
import { getTopAchievements, Achievement } from './achievements';

const CATEGORIES: QuestionCategory[] = [
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
        case 1: return 'Iniciación Inmersiva';
        case 2: return 'Básico Funcional';
        case 3: return 'Aventurero Independiente';
        default: return 'Iniciación Inmersiva';
    }
};

const LEVEL_PROGRESSION: QuestionLevel[] = ['Pre-A1', 'A1', 'A1-alto', 'A2', 'A2-alto', 'B1'];

const MOTIVATIONAL_PHRASES = [
    '¡Vas increíble!',
    '¡Sigue así!',
    '¡En llamas!',
    '¡Imparable!',
    '¡Brillante!',
    '¡Eres un crack!',
    '¡Combo!',
];

const STREAK_PHRASES: Record<number, string> = {
    3: '¡3 seguidas!',
    5: '¡Racha caliente!',
    7: '¡Imparable!',
    10: '¡Leyenda!',
};

export default function EvaluacionYBanda() {
    const router = useRouter();
    const supabase = createClient();

    // Banco de preguntas cargado desde BD (sin is_correct). Ref para uso síncrono en el motor CAT.
    const questionsRef = useRef<Question[]>([]);
    const [evaluationId, setEvaluationId] = useState<string | null>(null);

    const [userId, setUserId] = useState<string | null>(null);
    const [userMetadata, setUserMetadata] = useState<{ name: string; email: string } | null>(null);
    const [hasStarted, setHasStarted] = useState(false);

    // CAT States - Multidimensional
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);

    const [categoryLevels, setCategoryLevels] = useState<Record<QuestionCategory, QuestionLevel>>({
        'Gramática y Vocabulario': 'Pre-A1',
        'Comprensión Auditiva': 'Pre-A1',
        'Producción Escrita': 'Pre-A1',
        'Producción Oral': 'Pre-A1',
        'Identificación Visual': 'Pre-A1'
    });

    const [categoryHistory, setCategoryHistory] = useState<Record<QuestionCategory, Record<QuestionLevel, { correct: number; incorrect: number }>>>(() => {
        const initial: Record<QuestionCategory, Record<QuestionLevel, { correct: number; incorrect: number }>> = {} as never;
        CATEGORIES.forEach((cat) => {
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

    const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
    const [completedCategories, setCompletedCategories] = useState<Set<QuestionCategory>>(new Set());

    const [questionsAnsweredCount, setQuestionsAnsweredCount] = useState(0);
    const [answeredIds, setAnsweredIds] = useState<Set<string>>(new Set());

    // Inputs
    const [textInputValue, setTextInputValue] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [isEvaluatingAI, setIsEvaluatingAI] = useState(false);

    const [isQuizFinished, setIsQuizFinished] = useState(false);

    // Level up
    const [currentGlobalBanda, setCurrentGlobalBanda] = useState<number>(1);
    const [levelChangeType, setLevelChangeType] = useState<'up' | 'down' | null>(null);
    const [pendingNextQuestion, setPendingNextQuestion] = useState<(() => void) | null>(null);

    const [finalCategoryLevels, setFinalCategoryLevels] = useState<Record<QuestionCategory, QuestionLevel> | null>(null);

    const [calculatedBanda, setCalculatedBanda] = useState<number | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Preview & Skip States
    const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
    const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
    const [showAudioPreview, setShowAudioPreview] = useState(false);

    // History
    const [evaluationHistory, setEvaluationHistory] = useState<Array<{
        question: string;
        category: string;
        userAnswer: string;
        isCorrect: boolean;
        feedback: string | null;
        level: QuestionLevel;
    }>>([]);

    const [aiOracleVerdict, setAiOracleVerdict] = useState<string>('');
    const [earnedAchievements, setEarnedAchievements] = useState<Achievement[]>([]);

    const [showDevMode, setShowDevMode] = useState(false);
    const [showResults, setShowResults] = useState(false);

    // === NEW: Feedback state ===
    const [streak, setStreak] = useState(0);
    const [xpFloaters, setXpFloaters] = useState<Array<{ id: number; amount: number }>>([]);
    const [motivationalMessage, setMotivationalMessage] = useState<string | null>(null);
    const [motivationalKey, setMotivationalKey] = useState(0);
    const floaterIdRef = useRef(0);
    const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const showMotivation = useCallback((message: string) => {
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        setMotivationalMessage(message);
        setMotivationalKey((k) => k + 1);
        toastTimerRef.current = setTimeout(() => setMotivationalMessage(null), 1700);
    }, []);

    const spawnXpFloater = useCallback((amount: number) => {
        const id = ++floaterIdRef.current;
        setXpFloaters((prev) => [...prev, { id, amount }]);
        setTimeout(() => {
            setXpFloaters((prev) => prev.filter((f) => f.id !== id));
        }, 1500);
    }, []);

    useEffect(() => {
        return () => {
            if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        };
    }, []);

    // Initial check
    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/portal-alumno');
            } else {
                setUserId(user.id);
                const name = user.user_metadata?.first_name
                    ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`.trim()
                    : user.email?.split('@')[0] || 'Aventurero';
                const email = user.email || '';
                setUserMetadata({ name, email });

                const { data: userData } = await supabase
                    .from('users')
                    .select('english_level')
                    .eq('id', user.id)
                    .single();

                if (userData?.english_level) {
                    setIsQuizFinished(true);
                    setCalculatedBanda(parseInt(userData.english_level.replace('Banda ', '')));

                    const { data: evalData } = await supabase
                        .from('evaluations')
                        .select('*')
                        .eq('user_id', user.id)
                        .order('created_at', { ascending: false })
                        .limit(1)
                        .single();

                    if (evalData) {
                        setFinalCategoryLevels(evalData.category_levels);
                        setEvaluationHistory(Array.isArray(evalData.evaluation_history) ? evalData.evaluation_history : []);
                        setAiOracleVerdict(evalData.ai_oracle_verdict);
                        setEarnedAchievements(evalData.achievements || []);
                        setShowResults(true);
                    }
                } else {
                    // Cargar banco desde BD (sin is_correct) y abrir el intento (idempotencia).
                    const { data: qData } = await supabase.rpc('get_exam_questions');
                    questionsRef.current = (Array.isArray(qData) ? qData : []) as Question[];
                    const { data: evalRow } = await supabase
                        .from('evaluations')
                        .insert({ user_id: user.id, status: 'in_progress' })
                        .select('id')
                        .maybeSingle();
                    setEvaluationId(evalRow?.id ?? null);
                    loadNextQuestion(CATEGORIES[0], categoryLevels['Gramática y Vocabulario'], new Set(), 0);
                }
            }
        };
        checkAuth();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router, supabase]);

    const loadNextQuestion = (
        targetCategory: QuestionCategory,
        targetLevel: QuestionLevel,
        answered: Set<string>,
        categoryIndex: number
    ) => {
        setTextInputValue('');

        let availableQuestions = questionsRef.current.filter(
            (q) => q.category === targetCategory && q.level === targetLevel && !answered.has(q.id)
        );

        if (availableQuestions.length === 0) {
            availableQuestions = questionsRef.current.filter((q) => q.category === targetCategory && !answered.has(q.id));
        }

        if (availableQuestions.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableQuestions.length);
            const questionToSet = { ...availableQuestions[randomIndex] };

            if (questionToSet.options) {
                const shuffledOptions = [...questionToSet.options];
                for (let i = shuffledOptions.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
                }
                questionToSet.options = shuffledOptions;
            }

            setCurrentQuestion(questionToSet);
            setActiveCategoryIndex(categoryIndex);
        } else {
            handleCategoryComplete(targetCategory, targetLevel, answered, categoryIndex);
        }
    };

    const handleCategoryComplete = (
        category: QuestionCategory,
        finalLevel: QuestionLevel,
        answered: Set<string>,
        currentIndex: number
    ) => {
        const newCompleted = new Set(completedCategories);
        newCompleted.add(category);
        setCompletedCategories(newCompleted);

        if (newCompleted.size >= CATEGORIES.length) {
            finishQuiz();
            return;
        }

        let nextIndex = (currentIndex + 1) % CATEGORIES.length;
        while (newCompleted.has(CATEGORIES[nextIndex])) {
            nextIndex = (nextIndex + 1) % CATEGORIES.length;
        }

        loadNextQuestion(CATEGORIES[nextIndex], categoryLevels[CATEGORIES[nextIndex]], answered, nextIndex);
    };

    // Sube a bucket PRIVADO en {uid}/{evaluationId}/...; devuelve el PATH (no URL pública).
    const uploadAudioToSupabase = async (audioBlob: Blob): Promise<string | null> => {
        if (!userId) return null;
        const folder = evaluationId ?? 'misc';
        const fileName = `${userId}/${folder}/${Date.now()}_audio.webm`;
        const { data, error } = await supabase.storage
            .from('student_audios')
            .upload(fileName, audioBlob, { contentType: 'audio/webm' });
        if (error) {
            console.error('Error subiendo audio:', error);
            return null;
        }
        return data.path;
    };

    const evaluateWithGemini = async (
        userAnswerText?: string,
        base64Audio?: string,
        mimeType?: string
    ): Promise<{ isCorrect: boolean; feedback: string; needsReview: boolean; raw?: string; pron?: { transcript?: string; overall?: number; accuracy?: number; fluency?: number; notes?: string } }> => {
        if (!currentQuestion) return { isCorrect: false, feedback: 'No question', needsReview: true };

        try {
            const bodyData: Record<string, unknown> = {
                questionId: currentQuestion.id,   // la rúbrica/keywords se leen en el server desde BD
                questionType: currentQuestion.type,
                questionText: currentQuestion.text,
                userAnswerText,
            };

            if (base64Audio) {
                bodyData.audioBase64 = base64Audio.includes(',') ? base64Audio.split(',')[1] : base64Audio;
                bodyData.audioMimeType = mimeType;
            }

            const response = await fetch('/api/evaluate-answer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyData)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Error de evaluación');
            const pron = (data.transcript !== undefined || data.overallScore !== undefined)
                ? { transcript: data.transcript, overall: data.overallScore, accuracy: data.accuracyScore, fluency: data.fluencyScore, notes: data.notes }
                : undefined;
            return { isCorrect: !!data.isCorrect, feedback: data.feedback, needsReview: false, raw: data.raw, pron };
        } catch (error) {
            // NO inflar: ante error marcamos incorrecto + revisión humana (no isCorrect:true).
            console.error('Error contacting Gemini:', error);
            return { isCorrect: false, feedback: 'No se pudo evaluar automáticamente; marcado para revisión.', needsReview: true };
        }
    };

    const playFeedbackSound = (isCorrect: boolean) => {
        const type = isCorrect ? 'accept1' : 'deny1';
        const audio = new Audio(`/audios/sounds-effect/Villager_${type}.ogg`);
        audio.volume = 0.5;
        audio.play().catch((e) => console.error('Error playing sound', e));
    };

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
        let needsReview = false;
        let aiRaw: string | undefined;
        let pron: { transcript?: string; overall?: number; accuracy?: number; fluency?: number; notes?: string } | undefined;
        let uploadedAudioPath: string | null = null;

        try {
            let base64AudioData: string | undefined;
            let mimeTypeStr: string | undefined;

            if (audioBlobToUpload) {
                uploadedAudioPath = await uploadAudioToSupabase(audioBlobToUpload);

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
                needsReview = aiResult.needsReview;
                aiRaw = aiResult.raw;
                pron = aiResult.pron;
            }

            playFeedbackSound(finalIsCorrect);

            // === Feedback effects (streak + XP floater + motivational) ===
            if (finalIsCorrect) {
                const xpAmount = 10 + Math.min(streak, 5) * 2; // small streak bonus
                spawnXpFloater(xpAmount);
                const newStreak = streak + 1;
                setStreak(newStreak);
                if (STREAK_PHRASES[newStreak]) {
                    showMotivation(STREAK_PHRASES[newStreak]);
                } else if (newStreak >= 2 && Math.random() > 0.5) {
                    showMotivation(MOTIVATIONAL_PHRASES[Math.floor(Math.random() * MOTIVATIONAL_PHRASES.length)]);
                }
            } else {
                setStreak(0);
            }

            if (userId && currentQuestion) {
                const { data: insertedResult } = await supabase.from('evaluation_results').insert({
                    user_id: userId,
                    evaluation_id: evaluationId,
                    question_id: currentQuestion.id,
                    skill_id: currentQuestion.skillId,
                    level: categoryLevels[currentQuestion.category],
                    is_correct: finalIsCorrect,
                    user_answer_text: userAnswerTextStr || null,
                    audio_path: uploadedAudioPath,
                    ai_feedback: aiFeedbackStr || null,
                    ai_raw_response: aiRaw ? { raw: aiRaw } : null,
                    needs_human_review: needsReview,
                }).select('id').maybeSingle();

                // Score de pronunciación (audio): RPC valida que el reactivo es del alumno.
                if (pron && insertedResult?.id) {
                    await supabase.rpc('save_pronunciation_score', {
                        p_result_id: insertedResult.id,
                        p_transcript: pron.transcript ?? null,
                        p_overall: pron.overall ?? null,
                        p_accuracy: pron.accuracy ?? null,
                        p_fluency: pron.fluency ?? null,
                        p_reference: currentQuestion.text ?? null,
                        p_raw: aiRaw ? { raw: aiRaw } : null,
                    });
                }
            }

            setEvaluationHistory((prev) => [...prev, {
                question: currentQuestion.text,
                category: currentQuestion.category,
                userAnswer: userAnswerTextStr || (audioBlobToUpload ? '[Audio Recording]' : '[Skipped]'),
                isCorrect: finalIsCorrect,
                feedback: aiFeedbackStr || null,
                level: categoryLevels[currentQuestion.category]
            }]);

            processCatStep(finalIsCorrect);

        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error procesando tu respuesta. Intenta de nuevo.';
            setError(message);
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

                stream.getTracks().forEach((track) => track.stop());
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

    // MC / image-choice / audio-listening: el grading lo decide el SERVER (grade_choice), no el cliente.
    const handleChooseOption = async (optionId: string, text: string) => {
        if (!currentQuestion) return;
        let ok = false;
        try {
            const { data } = await supabase.rpc('grade_choice', {
                p_question_id: currentQuestion.id,
                p_option_id: optionId,
            });
            ok = data === true;
        } catch (e) {
            console.error('grade_choice error', e);
        }
        handleAnswerSubmission(ok, text, undefined, false);
    };

    const handleSkipQuestion = () => {
        handleAnswerSubmission(false, '[Saltado]', undefined, false);
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

        const newHistory = { ...categoryHistory };
        if (isCorrect) {
            newHistory[currentCat][currentCatLevel].correct += 1;
        } else {
            newHistory[currentCat][currentCatLevel].incorrect += 1;
        }
        setCategoryHistory(newHistory);

        let nextCatLevel = currentCatLevel;
        const currentLevelIndex = LEVEL_PROGRESSION.indexOf(currentCatLevel);

        let categoryJustCompleted = false;

        if (isCorrect) {
            if (currentLevelIndex < LEVEL_PROGRESSION.length - 1) {
                nextCatLevel = LEVEL_PROGRESSION[currentLevelIndex + 1];
            } else {
                if (newHistory[currentCat]['B1'].correct >= 2) {
                    categoryJustCompleted = true;
                }
            }
        } else {
            if (currentLevelIndex > 0) {
                nextCatLevel = LEVEL_PROGRESSION[currentLevelIndex - 1];
            }
            if (newHistory[currentCat][currentCatLevel].incorrect >= 3) {
                categoryJustCompleted = true;
                nextCatLevel = currentLevelIndex > 0 ? LEVEL_PROGRESSION[currentLevelIndex - 1] : LEVEL_PROGRESSION[0];
            }
        }

        const newCategoryLevels = { ...categoryLevels, [currentCat]: nextCatLevel };
        setCategoryLevels(newCategoryLevels);

        let totalIndex = 0;
        CATEGORIES.forEach((cat) => {
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
            const nextAction = () =>
                handleCategoryComplete(currentCat, nextCatLevel, newAnsweredIds, activeCategoryIndex);
            if (didLevelChange) {
                setPendingNextQuestion(() => nextAction);
                setLevelChangeType(didLevelChange);
            } else {
                nextAction();
            }
            return;
        }

        let nextIndex = (activeCategoryIndex + 1) % CATEGORIES.length;

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
            if (nextIndex === activeCategoryIndex) break;
        }

        const nextAction = () =>
            loadNextQuestion(CATEGORIES[nextIndex], newCategoryLevels[CATEGORIES[nextIndex]], newAnsweredIds, nextIndex);
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
            setFinalCategoryLevels(categoryLevels);

            let totalIndex = 0;
            CATEGORIES.forEach((cat) => {
                totalIndex += LEVEL_PROGRESSION.indexOf(categoryLevels[cat]);
            });
            const averageIndex = Math.round(totalIndex / CATEGORIES.length);
            const globalLevel = LEVEL_PROGRESSION[averageIndex];

            const bandaResult = getBandaFromLevel(globalLevel);
            setCalculatedBanda(bandaResult);

            if (userId) {
                await supabase
                    .from('users')
                    .update({
                        english_level: `Banda ${bandaResult}`,
                        has_completed_evaluation: true
                    })
                    .eq('id', userId);

                const topAchievements = getTopAchievements(categoryLevels);
                setEarnedAchievements(topAchievements);

                let finalOracleVerdict =
                    '¡Gran trabajo, aventurero! He analizado tu desempeño a lo largo de las pruebas. Posees una base sólida que promete mucho potencial. Tu próxima meta será afianzar ese conocimiento para comunicarte de manera más fluida con los aldeanos y sortear obstáculos de nivel intermedio con total seguridad.';

                try {
                    const visionResponse = await fetch('/api/generate-vision', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ categoryLevels, calculatedBanda: bandaResult })
                    });
                    const visionData = await visionResponse.json();
                    if (visionResponse.ok && visionData.vision) {
                        finalOracleVerdict = visionData.vision;
                    }
                } catch (vErr) {
                    console.error('Error generating AI vision:', vErr);
                }

                setAiOracleVerdict(finalOracleVerdict);

                const payload = {
                    calculated_band: bandaResult,
                    category_levels: categoryLevels,
                    evaluation_history: evaluationHistory,
                    ai_oracle_verdict: finalOracleVerdict,
                    achievements: topAchievements,
                    status: 'completed',
                    completed_at: new Date().toISOString(),
                };
                // Idempotencia: actualiza el intento in_progress; si no hay id, inserta.
                const { error: saveError } = evaluationId
                    ? await supabase.from('evaluations').update(payload).eq('id', evaluationId)
                    : await supabase.from('evaluations').insert({ user_id: userId, ...payload });

                if (saveError) {
                    console.error('Error saving detailed evaluation:', saveError);
                }

                // Agente de guía: genera feedback dual (alumno + maestro) en feedback_sessions.
                if (evaluationId) {
                    try {
                        await fetch('/api/evaluation/finalize', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ evaluationId }),
                        });
                    } catch (fErr) {
                        console.error('finalize feedback error:', fErr);
                    }
                }

                // Gamificación: XP + monedas por completar la evaluación + logros desbloqueados.
                try {
                    await supabase.rpc('grant_progress', { p_xp: 50, p_coins: 20, p_source: 'evaluacion' });
                    for (const a of topAchievements) {
                        await supabase.rpc('unlock_achievement', { p_achievement_id: a.id });
                    }
                } catch (gErr) {
                    console.error('gamification error:', gErr);
                }
            }

            setIsQuizFinished(true);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error al guardar el nivel y resultados. Intenta de nuevo.';
            setError(message);
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCheckout = () => {
        setIsCheckingOut(true);
        router.push('/portal-alumno/dashboard');
    };

    // XP percentage calculation
    const currentTotalIndex = CATEGORIES.reduce(
        (acc, cat) => acc + LEVEL_PROGRESSION.indexOf(categoryLevels[cat]),
        0
    );
    let xpPercentage = 0;
    if (currentGlobalBanda === 1) {
        xpPercentage = (currentTotalIndex / 7) * 100;
    } else if (currentGlobalBanda === 2) {
        xpPercentage = (Math.max(0, currentTotalIndex - 8) / 9) * 100;
    } else {
        xpPercentage = (Math.max(0, currentTotalIndex - 18) / 7) * 100;
    }
    xpPercentage = Math.min(100, Math.max(0, xpPercentage));

    // ===== RENDER =====
    if (isQuizFinished) {
        return (
            <>
                {!showResults ? (
                    <CompletionTransition onSeeResults={() => setShowResults(true)} userName={userMetadata?.name} />
                ) : (
                    <AdventurerReport
                        calculatedBanda={calculatedBanda}
                        finalCategoryLevels={finalCategoryLevels}
                        evaluationHistory={evaluationHistory}
                        isCheckingOut={isCheckingOut}
                        handleCheckout={handleCheckout}
                        error={error}
                        aiOracleVerdict={aiOracleVerdict}
                        achievements={earnedAchievements}
                    />
                )}
            </>
        );
    }

    if (!hasStarted) {
        return <EvaluationIntro onStart={() => setHasStarted(true)} userName={userMetadata?.name} />;
    }

    return (
        <>
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

            <QuizScreen
                currentQuestion={currentQuestion}
                categoryLevels={categoryLevels}
                completedCategories={completedCategories}
                currentGlobalBanda={currentGlobalBanda}
                xpPercentage={xpPercentage}
                streak={streak}
                motivationalMessage={motivationalMessage}
                motivationalKey={motivationalKey}
                xpFloaters={xpFloaters}
                isEvaluatingAI={isEvaluatingAI}
                isSaving={isSaving}
                error={error}
                textInputValue={textInputValue}
                setTextInputValue={setTextInputValue}
                isRecording={isRecording}
                showAudioPreview={showAudioPreview}
                recordedAudioUrl={recordedAudioUrl}
                startRecording={startRecording}
                stopRecording={stopRecording}
                onConfirmAudio={handleConfirmAudio}
                onCancelAudio={handleCancelAudio}
                onChooseOption={handleChooseOption}
                onSubmitText={() => handleAnswerSubmission(false, textInputValue, undefined, true)}
                onSkip={handleSkipQuestion}
                showDevMode={showDevMode}
                toggleDevMode={() => setShowDevMode(!showDevMode)}
                onSetCategoryLevel={(cat, lvl) => setCategoryLevels({ ...categoryLevels, [cat]: lvl })}
                onFinishQuiz={finishQuiz}
                onOpenTester={() => router.push('/portal-alumno/evaluacion/tester')}
            />
        </>
    );
}
