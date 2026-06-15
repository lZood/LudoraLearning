'use client';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export default function LogoutButton() {
    const supabase = createClient();
    const router = useRouter();
    return (
        <button
            onClick={async () => {
                await supabase.auth.signOut();
                router.push('/portal-alumno');
                router.refresh();
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-gray-500 hover:text-red-500 hover:bg-red-50 transition-all"
        >
            <LogOut className="w-4 h-4" /> Salir
        </button>
    );
}
