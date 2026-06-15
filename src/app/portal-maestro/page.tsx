import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import CreateGroupForm from '@/components/portal-maestro/CreateGroupForm';
import { Users, KeyRound, BookOpen, CheckCircle2, ChevronRight, Sparkles, GraduationCap } from 'lucide-react';

export const dynamic = 'force-dynamic';

type Student = {
    id: string;
    full_name: string | null;
    email: string | null;
    english_level: string | null;
    has_completed_evaluation: boolean | null;
};

type GroupMemberRow = {
    group_id: string;
    status: string | null;
    student: Student | null;
};

export default async function TeacherDashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/portal-alumno?redirectedFrom=/portal-maestro');

    // Grupos del maestro
    const { data: groups } = await supabase
        .from('groups')
        .select('id, name, level, invite_code')
        .eq('teacher_id', user.id)
        .order('created_at');

    const groupList = groups ?? [];
    const groupIds = groupList.map((g) => g.id);

    // Miembros de todos los grupos (una sola consulta) agrupados en JS
    const membersByGroup = new Map<string, GroupMemberRow[]>();
    if (groupIds.length > 0) {
        const { data: members } = await supabase
            .from('group_members')
            .select('group_id, status, student:users!group_members_student_id_fkey(id, full_name, email, english_level, has_completed_evaluation)')
            .in('group_id', groupIds);

        for (const m of (members ?? []) as unknown as GroupMemberRow[]) {
            const arr = membersByGroup.get(m.group_id) ?? [];
            arr.push(m);
            membersByGroup.set(m.group_id, arr);
        }
    }

    return (
        <div className="space-y-8">
            {/* Encabezado */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900">Mis grupos</h1>
                    <p className="text-sm font-medium text-gray-500 mt-1">
                        Gestiona tus grupos y revisa el progreso de tus alumnos.
                    </p>
                </div>
            </div>

            {groupList.length === 0 ? (
                /* Estado vacío */
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 sm:p-10">
                    <div className="flex flex-col items-center text-center max-w-md mx-auto">
                        <div className="w-16 h-16 rounded-2xl bg-[#632EB0]/10 flex items-center justify-center text-[#632EB0] mb-4">
                            <Sparkles className="w-8 h-8" />
                        </div>
                        <h2 className="text-xl font-black tracking-tight text-gray-900">Crea tu primer grupo</h2>
                        <p className="text-sm font-medium text-gray-500 mt-2 mb-6">
                            Aún no tienes grupos. Crea uno para invitar a tus alumnos con un código y
                            comenzar a seguir su evaluación y progreso.
                        </p>
                        <div className="w-full text-left">
                            <CreateGroupForm teacherId={user.id} />
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {/* Formulario de creación */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 sm:p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-xl bg-[#88e04f]/20 flex items-center justify-center text-[#5fae2e]">
                                <GraduationCap className="w-4 h-4" />
                            </div>
                            <h2 className="text-base font-black tracking-tight text-gray-900">Nuevo grupo</h2>
                        </div>
                        <CreateGroupForm teacherId={user.id} />
                    </div>

                    {/* Listado de grupos */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        {groupList.map((group) => {
                            const members = membersByGroup.get(group.id) ?? [];
                            return (
                                <div key={group.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                                    {/* Cabecera de la tarjeta */}
                                    <div className="p-5 sm:p-6 border-b border-gray-100">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <h3 className="text-lg font-black tracking-tight text-gray-900 truncate">{group.name}</h3>
                                                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                                    {group.level && (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#632EB0]/10 text-[#632EB0] text-xs font-bold">
                                                            <BookOpen className="w-3.5 h-3.5" /> {group.level}
                                                        </span>
                                                    )}
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs font-bold">
                                                        <Users className="w-3.5 h-3.5" /> {members.length} {members.length === 1 ? 'alumno' : 'alumnos'}
                                                    </span>
                                                </div>
                                            </div>
                                            {group.invite_code && (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#88e04f]/20 text-[#4d9626] text-xs font-black tracking-wide shrink-0">
                                                    <KeyRound className="w-3.5 h-3.5" /> {group.invite_code}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Lista de alumnos */}
                                    <div className="p-3 sm:p-4">
                                        {members.length === 0 ? (
                                            <p className="text-sm font-medium text-gray-400 text-center py-6">
                                                Aún no hay alumnos en este grupo. Comparte el código para invitarlos.
                                            </p>
                                        ) : (
                                            <ul className="space-y-1">
                                                {members.map((m) => {
                                                    const s = m.student;
                                                    if (!s) return null;
                                                    return (
                                                        <li key={s.id}>
                                                            <Link
                                                                href={`/portal-maestro/alumno/${s.id}`}
                                                                className="group flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-gray-50 transition-all"
                                                            >
                                                                <div className="w-9 h-9 rounded-xl bg-[#632EB0]/10 text-[#632EB0] flex items-center justify-center font-black text-sm shrink-0">
                                                                    {(s.full_name || s.email || '?').charAt(0).toUpperCase()}
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="text-sm font-bold text-gray-900 truncate">
                                                                        {s.full_name || 'Sin nombre'}
                                                                    </p>
                                                                    <p className="text-xs font-medium text-gray-400 truncate">{s.email}</p>
                                                                </div>
                                                                <div className="flex items-center gap-2 shrink-0">
                                                                    <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${s.english_level ? 'bg-[#632EB0]/10 text-[#632EB0]' : 'bg-gray-100 text-gray-400'}`}>
                                                                        {s.english_level || 'Sin evaluar'}
                                                                    </span>
                                                                    {s.has_completed_evaluation && (
                                                                        <CheckCircle2 className="w-4 h-4 text-[#5fae2e]" aria-label="Evaluación completada" />
                                                                    )}
                                                                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-all" />
                                                                </div>
                                                            </Link>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}
