'use client';

import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, GraduationCap, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import HapticTrigger, { HapticHandle } from '@/components/ui/HapticTrigger';

export default function MobileNavBar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const hapticRef = useRef<HapticHandle>(null);

  useEffect(() => {
    setMounted(true);
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const triggerHaptic = () => {
    hapticRef.current?.trigger();
  };

  if (!mounted || typeof document === 'undefined') return null;
  
  // Ocultar la barra inferior durante el flujo de aprendizaje (mapa de unidad y lección),
  // donde estorba con el botón "Comprobar" y el header propio de la lección.
  if (
    pathname.includes('/portal-alumno/dashboard/unidad') ||
    pathname.includes('/portal-alumno/dashboard/leccion')
  ) {
    return null;
  }

  return createPortal(
    <>
      <HapticTrigger ref={hapticRef} />
      <AnimatePresence>
        {isVisible && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="md:hidden fixed bottom-4 left-0 right-0 z-[1000] pointer-events-none px-2 flex justify-center w-full"
          >
            <nav className="bg-white/95 backdrop-blur-xl border border-gray-100 rounded-[2.5rem] p-1.5 shadow-[0_8px_40px_rgba(0,0,0,0.15)] pointer-events-auto flex items-center justify-between gap-1 w-[92%] max-w-[400px]">
              {/* Inicio Tab */}
              {(() => {
                const isHomeActive = pathname === '/portal-alumno/dashboard' || 
                                   pathname.startsWith('/portal-alumno/dashboard/noticias') ||
                                   pathname.startsWith('/portal-alumno/dashboard/materiales') ||
                                   pathname.startsWith('/portal-alumno/dashboard/videos');
                
                return (
                  <Link
                    href="/portal-alumno/dashboard"
                    onClick={triggerHaptic}
                    className={`flex flex-col items-center justify-center w-1/3 py-2 px-1 transition-colors rounded-3xl ${
                      isHomeActive ? 'text-[#632EB0] bg-purple-50' : 'text-gray-400 hover:text-[#632EB0]'
                    }`}
                  >
                    <Home className="w-6 h-6 mb-1.5" strokeWidth={isHomeActive ? 2.5 : 2} />
                    <span className="text-[11px] font-bold">Inicio</span>
                  </Link>
                );
              })()}
              
              {/* Clases Tab */}
              <Link
                href="/portal-alumno/dashboard/cursos"
                onClick={triggerHaptic}
                className={`flex flex-col items-center justify-center w-1/3 py-2 px-1 transition-colors rounded-3xl ${
                  pathname.startsWith('/portal-alumno/dashboard/cursos') ? 'text-[#632EB0] bg-purple-50 shadow-sm' : 'text-gray-400 hover:text-[#632EB0]'
                }`}
              >
                <GraduationCap className="w-6 h-6 mb-1.5" strokeWidth={pathname.startsWith('/portal-alumno/dashboard/cursos') ? 2.5 : 2} />
                <span className="text-[11px] font-bold">Clases</span>
              </Link>
      
              {/* Tú (Perfil) Tab */}
              <Link
                href="/portal-alumno/dashboard/perfil"
                onClick={triggerHaptic}
                className={`flex flex-col items-center justify-center w-1/3 py-2 px-1 transition-colors rounded-3xl ${
                  pathname === '/portal-alumno/dashboard/perfil' ? 'text-[#632EB0] bg-purple-50' : 'text-gray-400 hover:text-[#632EB0]'
                }`}
              >
                <User className="w-6 h-6 mb-1.5" strokeWidth={pathname === '/portal-alumno/dashboard/perfil' ? 2.5 : 2} />
                <span className="text-[11px] font-bold">Tú</span>
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>,
    document.body
  );
}
