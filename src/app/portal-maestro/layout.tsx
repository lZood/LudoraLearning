import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import LogoutButton from '@/components/portal-maestro/LogoutButton';
import { GraduationCap } from 'lucide-react';

export const dynamic = 'force-dynamic';

// Portal del maestro. Gate por rol: solo teacher/admin. El middleware ya exige sesión.
export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/portal-alumno?redirectedFrom=/portal-maestro');

    const { data: profile } = await supabase
        .from('users')
        .select('role, full_name')
        .eq('id', user.id)
        .maybeSingle();

    if (!profile || (profile.role !== 'teacher' && profile.role !== 'admin')) {
        redirect('/portal-alumno/dashboard');
    }

    return (
        <div className="min-h-screen bg-[#f7f7fb] text-gray-900">
            <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#632EB0] flex items-center justify-center text-white">
                            <GraduationCap className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Portal del Maestro</p>
                            <p className="text-sm font-black tracking-tight leading-tight">Ludora Learning</p>
                        </div>
                    </div>
                    <nav className="flex items-center gap-1">
                        <Link href="/portal-maestro" className="px-3 py-2 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-all">Grupos</Link>
                        <Link href="/portal-maestro/revision" className="px-3 py-2 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-all">Revisión</Link>
                        <span className="hidden sm:block mx-2 text-sm font-bold text-gray-400">{profile.full_name || 'Maestro'}</span>
                        <LogoutButton />
                    </nav>
                </div>
            </header>
            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">{children}</main>
        </div>
    );
}
