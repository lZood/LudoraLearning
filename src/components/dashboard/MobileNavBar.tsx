'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, GraduationCap, User } from 'lucide-react';

export default function MobileNavBar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || typeof document === 'undefined') return null;
  
  // Ocultar la barra de navegación si estamos dentro de una unidad
  if (pathname.includes('/portal-alumno/dashboard/unidad')) {
    return null;
  }

  // React Portal to escape ANY transform/overflow limits in the layout tree hierarchy
  return createPortal(
    <div className="md:hidden fixed bottom-6 left-0 right-0 z-[1000] pointer-events-none px-4 flex justify-center w-full">
      <nav className="bg-white/95 backdrop-blur-xl border border-gray-100 rounded-[2.5rem] p-2 shadow-[0_8px_40px_rgba(0,0,0,0.15)] pointer-events-auto flex items-center justify-between gap-1 w-[90%] max-w-[400px]">
        {/* Inicio Tab */}
        <Link
          href="/portal-alumno/dashboard"
          className={`flex flex-col items-center justify-center w-1/3 py-2 px-1 transition-colors rounded-3xl ${
            pathname === '/portal-alumno/dashboard' ? 'text-[#632EB0] bg-purple-50' : 'text-gray-400 hover:text-[#632EB0]'
          }`}
        >
          <Home className="w-6 h-6 mb-1.5" strokeWidth={pathname === '/portal-alumno/dashboard' ? 2.5 : 2} />
          <span className="text-[11px] font-bold">Inicio</span>
        </Link>
        
        {/* Cursos Tab */}
        <Link
          href="/portal-alumno/dashboard/cursos"
          className={`flex flex-col items-center justify-center w-1/3 py-2 px-1 transition-colors rounded-3xl ${
            pathname.startsWith('/portal-alumno/dashboard/cursos') ? 'text-[#632EB0] bg-purple-50 shadow-sm' : 'text-gray-400 hover:text-[#632EB0]'
          }`}
        >
          <GraduationCap className="w-6 h-6 mb-1.5" strokeWidth={pathname.startsWith('/portal-alumno/dashboard/cursos') ? 2.5 : 2} />
          <span className="text-[11px] font-bold">Cursos</span>
        </Link>

        {/* Tú (Perfil) Tab */}
        <Link
          href="/portal-alumno/dashboard/perfil"
          className={`flex flex-col items-center justify-center w-1/3 py-2 px-1 transition-colors rounded-3xl ${
            pathname === '/portal-alumno/dashboard/perfil' ? 'text-[#632EB0] bg-purple-50' : 'text-gray-400 hover:text-[#632EB0]'
          }`}
        >
          <User className="w-6 h-6 mb-1.5" strokeWidth={pathname === '/portal-alumno/dashboard/perfil' ? 2.5 : 2} />
          <span className="text-[11px] font-bold">Tú</span>
        </Link>
      </nav>
    </div>,
    document.body
  );
}
