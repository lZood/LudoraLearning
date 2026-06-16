import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import FeedbackForm from '@/components/portal-maestro/FeedbackForm';
import {
    ArrowLeft,
    Mail,
    GraduationCap,
    Sparkles,
    Award,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    MessageSquare,
    User as UserIcon,
    Users as UsersIcon,
    BookOpen,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

type Params = { id: string };

// ---- Tipos auxiliares ----
type Profile = {
    id: string;
    full_name: string | null;
    email: string | null;
    english_level: string | null;
    has_completed_evaluation: boolean | null;
};

type Evaluation = {
    id: string;
    calculated_band: number | null;
    category_levels: Record<string, unknown> | null;
    ai_oracle_verdict: string | null;
    status: string | null;
    completed_at: string | null;
    created_at: string | null;
};

type EvaluationResult = {
    id: string;
    question_id: string | null;
    level: string | null;
    is_correct: boolean | null;
    user_answer_text: string | null;
    audio_path: string | null;
    ai_feedback: string | null;
    needs_human_review: boolean | null;
    created_at: string | null;
};

type Question = {
    id: string;
    text: string | null;
    type: string | null;
    category: string | null;
};

type FeedbackSession = {
    id: string;
    author_type: string | null;
    audience: string | null;
    content: string | null;
    created_at: string | null;
};

const AUDIENCE_LABELS: Record<string, string> = {
    student: 'Alumno',
    teacher: 'Maestro',
    both: 'Ambos',
};

const AUTHOR_LABELS: Record<string, string> = {
    teacher: 'Maestro',
    ai_agent: 'Agente IA',
    system: 'Sistema',
};

function formatDate(value: string | null): string {
    if (!value) return '';
    try {
        return new Date(value).toLocaleString('es-MX', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return value;
    }
}

export default async function AlumnoDetailPage({ params }: { params: Promise<Params> }) {
    const { id } = await params;
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) notFound();

    // Perfil del alumno. RLS lo oculta (null) si no es alumno de este maestro.
    const { data: profileData } = await supabase
        .from('users')
        .select('id, full_name, email, english_level, has_completed_evaluation')
        .eq('id', id)
        .maybeSingle();

    if (!profileData) notFound();
    const profile = profileData as Profile;

    // Última evaluación
    const { data: evaluationData } = await supabase
        .from('evaluations')
        .select('*')
        .eq('user_id', id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
    const evaluation = (evaluationData ?? null) as Evaluation | null;

    // Resultados por reactivo
    const { data: resultsData } = await supabase
        .from('evaluation_results')
        .select('id, question_id, level, is_correct, user_answer_text, audio_path, ai_feedback, needs_human_review, created_at')
        .eq('user_id', id)
        .order('created_at');
    const results = (resultsData ?? []) as EvaluationResult[];

    // Enunciados de las preguntas
    const questionIds = Array.from(
        new Set(results.map((r) => r.question_id).filter((qid): qid is string => !!qid))
    );
    let questionsById: Record<string, Question> = {};
    if (questionIds.length > 0) {
        const { data: questionsData } = await supabase
            .from('questions')
            .select('id, text, type, category')
            .in('id', questionIds);
        if (questionsData) {
            questionsById = (questionsData as Question[]).reduce<Record<string, Question>>((acc, q) => {
                acc[q.id] = q;
                return acc;
            }, {});
        }
    }

    // URLs firmadas para el audio (bucket privado, generadas en server con admin client).
    // SEGURIDAD: solo firmar rutas que pertenezcan a la carpeta del propio alumno (`${id}/...`).
    // audio_path lo controla el cliente al guardar el resultado; sin esta validación un alumno
    // podría apuntar a la carpeta de otro y exponer su grabación al firmar con service_role.
    const signedUrlByResultId: Record<string, string> = {};
    const resultsWithAudio = results.filter((r) => typeof r.audio_path === 'string' && (r.audio_path as string).startsWith(`${id}/`));
    if (resultsWithAudio.length > 0) {
        const admin = createAdminClient();
        await Promise.all(
            resultsWithAudio.map(async (r) => {
                const { data } = await admin.storage
                    .from('student_audios')
                    .createSignedUrl(r.audio_path as string, 3600);
                if (data?.signedUrl) {
                    signedUrlByResultId[r.id] = data.signedUrl;
                }
            })
        );
    }

    // Historial de retroalimentación
    const { data: feedbackData } = await supabase
        .from('feedback_sessions')
        .select('*')
        .eq('student_id', id)
        .order('created_at', { ascending: false });
    const feedbackSessions = (feedbackData ?? []) as FeedbackSession[];

    const categoryEntries: [string, unknown][] = evaluation?.category_levels
        ? Object.entries(evaluation.category_levels)
        : [];

    return (
        <div className="space-y-8">
            {/* Volver */}
            <Link
                href="/portal-maestro"
                className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 transition-all hover:text-[#632EB0]"
            >
                <ArrowLeft className="h-4 w-4" />
                Volver a grupos
            </Link>

            {/* Encabezado del alumno */}
            <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#632EB0] text-white">
                            <UserIcon className="h-7 w-7" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight text-gray-900">
                                {profile.full_name || 'Alumno'}
                            </h1>
                            {profile.email && (
                                <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-gray-400">
                                    <Mail className="h-3.5 w-3.5" />
                                    {profile.email}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {profile.english_level && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#632EB0]/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-[#632EB0]">
                                <GraduationCap className="h-3.5 w-3.5" />
                                {profile.english_level}
                            </span>
                        )}
                        <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-widest ${
                                profile.has_completed_evaluation
                                    ? 'bg-[#88e04f]/20 text-green-700'
                                    : 'bg-gray-100 text-gray-400'
                            }`}
                        >
                            {profile.has_completed_evaluation ? (
                                <CheckCircle2 className="h-3.5 w-3.5" />
                            ) : (
                                <AlertTriangle className="h-3.5 w-3.5" />
                            )}
                            {profile.has_completed_evaluation ? 'Evaluación completa' : 'Sin evaluar'}
                        </span>
                    </div>
                </div>
            </section>

            {/* Última evaluación */}
            <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
                <h2 className="mb-5 flex items-center gap-2 text-lg font-black tracking-tight text-gray-900">
                    <Award className="h-5 w-5 text-[#632EB0]" />
                    Última evaluación
                </h2>

                {evaluation ? (
                    <div className="space-y-6">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="rounded-2xl bg-[#f7f7fb] px-6 py-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Banda calculada</p>
                                <p className="text-3xl font-black tracking-tighter text-[#632EB0]">
                                    {evaluation.calculated_band ?? '—'}
                                </p>
                            </div>
                            {evaluation.created_at && (
                                <div className="rounded-2xl bg-[#f7f7fb] px-6 py-4">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Fecha</p>
                                    <p className="mt-1 text-sm font-bold text-gray-700">
                                        {formatDate(evaluation.completed_at || evaluation.created_at)}
                                    </p>
                                </div>
                            )}
                            {evaluation.status && (
                                <div className="rounded-2xl bg-[#f7f7fb] px-6 py-4">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Estado</p>
                                    <p className="mt-1 text-sm font-bold capitalize text-gray-700">{evaluation.status}</p>
                                </div>
                            )}
                        </div>

                        {categoryEntries.length > 0 && (
                            <div>
                                <p className="mb-2 text-xs font-black uppercase tracking-widest text-gray-400">Niveles por categoría</p>
                                <div className="flex flex-wrap gap-2">
                                    {categoryEntries.map(([category, level]) => (
                                        <span
                                            key={category}
                                            className="inline-flex items-center gap-2 rounded-full border border-gray-100 bg-[#f7f7fb] px-4 py-2 text-sm font-bold text-gray-700"
                                        >
                                            <span className="capitalize text-gray-500">{category}</span>
                                            <span className="rounded-full bg-[#632EB0]/10 px-2.5 py-0.5 text-xs font-black text-[#632EB0]">
                                                {String(level)}
                                            </span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {evaluation.ai_oracle_verdict && (
                            <div className="rounded-2xl border border-[#632EB0]/15 bg-[#632EB0]/[0.04] p-5">
                                <p className="mb-2 flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-[#632EB0]">
                                    <Sparkles className="h-3.5 w-3.5" />
                                    Veredicto del Oráculo IA
                                </p>
                                <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">
                                    {evaluation.ai_oracle_verdict}
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="text-sm font-bold text-gray-400">Este alumno aún no tiene evaluaciones registradas.</p>
                )}
            </section>

            {/* Resultados por reactivo */}
            <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
                <h2 className="mb-5 flex items-center gap-2 text-lg font-black tracking-tight text-gray-900">
                    <BookOpen className="h-5 w-5 text-[#632EB0]" />
                    Resultados por reactivo
                    <span className="ml-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-black text-gray-500">
                        {results.length}
                    </span>
                </h2>

                {results.length === 0 ? (
                    <p className="text-sm font-bold text-gray-400">No hay resultados de reactivos para mostrar.</p>
                ) : (
                    <div className="space-y-4">
                        {results.map((r, idx) => {
                            const question = r.question_id ? questionsById[r.question_id] : undefined;
                            const signedUrl = signedUrlByResultId[r.id];
                            return (
                                <div
                                    key={r.id}
                                    className={`rounded-2xl border p-5 ${
                                        r.is_correct === true
                                            ? 'border-[#88e04f]/40 bg-[#88e04f]/[0.06]'
                                            : r.is_correct === false
                                              ? 'border-red-200 bg-red-50/60'
                                              : 'border-gray-100 bg-[#f7f7fb]'
                                    }`}
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div className="flex items-start gap-3">
                                            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-black text-gray-400 shadow-sm">
                                                {idx + 1}
                                            </span>
                                            <div>
                                                <p className="text-sm font-bold leading-snug text-gray-900">
                                                    {question?.text || r.question_id || 'Pregunta sin enunciado'}
                                                </p>
                                                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                                                    {question?.category && (
                                                        <span className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-gray-400">
                                                            {question.category}
                                                        </span>
                                                    )}
                                                    {question?.type && (
                                                        <span className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-gray-400">
                                                            {question.type}
                                                        </span>
                                                    )}
                                                    {r.level && (
                                                        <span className="rounded-full bg-[#632EB0]/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#632EB0]">
                                                            {r.level}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {r.needs_human_review && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-amber-700">
                                                    <AlertTriangle className="h-3 w-3" />
                                                    Revisión
                                                </span>
                                            )}
                                            {r.is_correct === true && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-[#88e04f]/25 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-green-700">
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    Correcto
                                                </span>
                                            )}
                                            {r.is_correct === false && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-red-600">
                                                    <XCircle className="h-3 w-3" />
                                                    Incorrecto
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {r.user_answer_text && (
                                        <div className="mt-3 rounded-xl bg-white/70 px-4 py-2.5">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Respuesta del alumno</p>
                                            <p className="mt-1 text-sm text-gray-700">{r.user_answer_text}</p>
                                        </div>
                                    )}

                                    {r.audio_path && (
                                        <div className="mt-3">
                                            <p className="mb-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400">Audio</p>
                                            {signedUrl ? (
                                                <audio controls src={signedUrl} className="w-full max-w-md" />
                                            ) : (
                                                <p className="text-xs font-bold text-gray-400">No se pudo cargar el audio.</p>
                                            )}
                                        </div>
                                    )}

                                    {r.ai_feedback && (
                                        <div className="mt-3 rounded-xl border border-[#632EB0]/15 bg-[#632EB0]/[0.04] px-4 py-2.5">
                                            <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#632EB0]">
                                                <Sparkles className="h-3 w-3" />
                                                Retroalimentación IA
                                            </p>
                                            <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-gray-700">
                                                {r.ai_feedback}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Retroalimentación */}
            <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
                <h2 className="mb-5 flex items-center gap-2 text-lg font-black tracking-tight text-gray-900">
                    <MessageSquare className="h-5 w-5 text-[#632EB0]" />
                    Retroalimentación
                </h2>

                <FeedbackForm studentId={id} authorId={user.id} />

                <div className="mt-8 border-t border-gray-100 pt-6">
                    <p className="mb-4 text-xs font-black uppercase tracking-widest text-gray-400">Historial</p>
                    {feedbackSessions.length === 0 ? (
                        <p className="text-sm font-bold text-gray-400">Aún no hay retroalimentación registrada.</p>
                    ) : (
                        <div className="space-y-3">
                            {feedbackSessions.map((fb) => (
                                <div key={fb.id} className="rounded-2xl border border-gray-100 bg-[#f7f7fb] p-4">
                                    <div className="mb-2 flex flex-wrap items-center gap-2">
                                        <span className="inline-flex items-center gap-1 rounded-full bg-[#632EB0]/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#632EB0]">
                                            {AUTHOR_LABELS[fb.author_type ?? ''] || fb.author_type || 'Autor'}
                                        </span>
                                        <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-gray-400">
                                            <UsersIcon className="h-3 w-3" />
                                            {AUDIENCE_LABELS[fb.audience ?? ''] || fb.audience || '—'}
                                        </span>
                                        {fb.created_at && (
                                            <span className="text-[11px] font-bold text-gray-400">{formatDate(fb.created_at)}</span>
                                        )}
                                    </div>
                                    <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">{fb.content}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
