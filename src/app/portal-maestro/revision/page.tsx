import React from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import {
    ClipboardCheck,
    ChevronRight,
    Volume2,
    MessageSquareText,
    User as UserIcon,
    BadgeCheck,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

// Tipos auxiliares para tipar la respuesta de Supabase.
type StudentRef = {
    id: string;
    full_name: string | null;
    email: string | null;
};

type ReviewRow = {
    id: string;
    user_id: string;
    question_id: string | null;
    level: string | null;
    user_answer_text: string | null;
    audio_path: string | null;
    ai_feedback: string | null;
    created_at: string;
    // El embed de la FK puede devolverse como objeto o (según el cliente) como array.
    student: StudentRef | StudentRef[] | null;
};

// Normaliza el embed del alumno a un solo objeto.
function pickStudent(student: ReviewRow['student']): StudentRef | null {
    if (!student) return null;
    return Array.isArray(student) ? (student[0] ?? null) : student;
}

function formatDate(value: string): string {
    try {
        return new Intl.DateTimeFormat('es-MX', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(value));
    } catch {
        return value;
    }
}

export default async function RevisionPage() {
    const supabase = await createClient();

    // 1. Reactivos que necesitan revisión humana. La RLS (is_teacher_of) limita
    //    automáticamente a los alumnos de los grupos del maestro autenticado.
    const { data, error } = await supabase
        .from('evaluation_results')
        .select(
            'id, user_id, question_id, level, user_answer_text, audio_path, ai_feedback, created_at, student:users!evaluation_results_user_id_fkey(id, full_name, email)'
        )
        .eq('needs_human_review', true)
        .order('created_at', { ascending: false });

    const rows: ReviewRow[] = (data as ReviewRow[] | null) ?? [];

    // 2. Cargar los enunciados de las preguntas a partir de question_id.
    const questionIds = Array.from(
        new Set(rows.map((r) => r.question_id).filter((id): id is string => !!id))
    );

    const questionTextById = new Map<string, string>();
    if (questionIds.length > 0) {
        const { data: questions } = await supabase
            .from('questions')
            .select('id, text')
            .in('id', questionIds);
        for (const q of (questions as { id: string; text: string | null }[] | null) ?? []) {
            if (q.text) questionTextById.set(q.id, q.text);
        }
    }

    // 3. Generar URLs firmadas para los audios (bucket privado student_audios).
    //    Se usa el cliente admin solo en server-side.
    const signedUrlByPath = new Map<string, string>();
    const audioPaths = Array.from(
        new Set(rows.map((r) => r.audio_path).filter((p): p is string => !!p))
    );

    if (audioPaths.length > 0) {
        const admin = createAdminClient();
        await Promise.all(
            audioPaths.map(async (path) => {
                const { data: signed } = await admin.storage
                    .from('student_audios')
                    .createSignedUrl(path, 3600);
                if (signed?.signedUrl) signedUrlByPath.set(path, signed.signedUrl);
            })
        );
    }

    return (
        <div className="w-full">
            {/* Encabezado */}
            <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#632EB0]/10 flex items-center justify-center text-[#632EB0]">
                        <ClipboardCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-gray-900">
                            Bandeja de revisión
                        </h1>
                        <p className="text-sm text-gray-500 font-medium">
                            Reactivos de tus alumnos que requieren revisión humana.
                        </p>
                    </div>
                </div>
                {rows.length > 0 && (
                    <span className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#632EB0] text-white text-sm font-black">
                        {rows.length} pendiente{rows.length === 1 ? '' : 's'}
                    </span>
                )}
            </div>

            {/* Error de carga */}
            {error && (
                <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm font-medium text-red-700 mb-6">
                    No se pudieron cargar los reactivos de revisión. Inténtalo de nuevo más tarde.
                </div>
            )}

            {/* Estado vacío */}
            {!error && rows.length === 0 && (
                <div className="rounded-3xl border border-gray-100 bg-white shadow-sm p-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-[#88e04f]/15 text-[#88e04f] flex items-center justify-center mx-auto mb-4">
                        <BadgeCheck className="w-8 h-8" />
                    </div>
                    <p className="text-lg font-black text-gray-900">
                        No hay reactivos pendientes de revisión 🎉
                    </p>
                    <p className="text-sm text-gray-500 font-medium mt-1">
                        Cuando un alumno envíe una respuesta que requiera tu atención, aparecerá aquí.
                    </p>
                </div>
            )}

            {/* Lista de reactivos */}
            {rows.length > 0 && (
                <ul className="space-y-4">
                    {rows.map((row) => {
                        const student = pickStudent(row.student);
                        const studentName = student?.full_name || student?.email || 'Alumno';
                        const questionText = row.question_id
                            ? questionTextById.get(row.question_id)
                            : null;
                        const signedUrl = row.audio_path
                            ? signedUrlByPath.get(row.audio_path)
                            : null;

                        return (
                            <li
                                key={row.id}
                                className="rounded-3xl border border-gray-100 bg-white shadow-sm p-5 sm:p-6"
                            >
                                {/* Cabecera de la fila: alumno + fecha + enlace */}
                                <div className="flex items-start justify-between gap-4">
                                    <Link
                                        href={`/portal-maestro/alumno/${row.user_id}`}
                                        className="group inline-flex items-center gap-3 min-w-0"
                                    >
                                        <span className="w-10 h-10 rounded-full bg-[#632EB0]/10 text-[#632EB0] flex items-center justify-center shrink-0">
                                            <UserIcon className="w-5 h-5" />
                                        </span>
                                        <span className="min-w-0">
                                            <span className="flex items-center gap-1 font-black text-gray-900 group-hover:text-[#632EB0] transition-colors truncate">
                                                {studentName}
                                                <ChevronRight className="w-4 h-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                            </span>
                                            {student?.email && (
                                                <span className="block text-xs text-gray-400 font-medium truncate">
                                                    {student.email}
                                                </span>
                                            )}
                                        </span>
                                    </Link>
                                    <div className="text-right shrink-0">
                                        {row.level && (
                                            <span className="inline-block px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-[11px] font-black uppercase tracking-wide">
                                                {row.level}
                                            </span>
                                        )}
                                        <p className="text-xs text-gray-400 font-medium mt-1.5">
                                            {formatDate(row.created_at)}
                                        </p>
                                    </div>
                                </div>

                                {/* Enunciado de la pregunta */}
                                <div className="mt-5 rounded-2xl bg-[#f7f7fb] border border-gray-100 p-4">
                                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">
                                        Enunciado
                                    </p>
                                    <p className="text-sm font-semibold text-gray-900">
                                        {questionText ??
                                            (row.question_id
                                                ? `(Pregunta ${row.question_id})`
                                                : 'Pregunta no disponible')}
                                    </p>
                                </div>

                                {/* Respuesta del alumno (texto) */}
                                {row.user_answer_text && (
                                    <div className="mt-3">
                                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">
                                            Respuesta del alumno
                                        </p>
                                        <p className="text-sm text-gray-700 font-medium whitespace-pre-wrap">
                                            {row.user_answer_text}
                                        </p>
                                    </div>
                                )}

                                {/* Audio de la respuesta */}
                                {row.audio_path && (
                                    <div className="mt-3">
                                        <p className="flex items-center gap-1.5 text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                                            <Volume2 className="w-3.5 h-3.5" />
                                            Audio
                                        </p>
                                        {signedUrl ? (
                                            <audio controls preload="none" className="w-full max-w-md">
                                                <source src={signedUrl} />
                                                Tu navegador no soporta la reproducción de audio.
                                            </audio>
                                        ) : (
                                            <p className="text-xs text-gray-400 font-medium italic">
                                                No se pudo generar el enlace del audio.
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Retroalimentación de la IA */}
                                {row.ai_feedback && (
                                    <div className="mt-4 rounded-2xl bg-[#632EB0]/5 border border-[#632EB0]/10 p-4">
                                        <p className="flex items-center gap-1.5 text-[11px] font-black text-[#632EB0] uppercase tracking-widest mb-1">
                                            <MessageSquareText className="w-3.5 h-3.5" />
                                            Análisis de la IA
                                        </p>
                                        <p className="text-sm text-gray-700 font-medium whitespace-pre-wrap">
                                            {row.ai_feedback}
                                        </p>
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
