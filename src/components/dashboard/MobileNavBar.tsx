'use client';

import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, GraduationCap, User, Calendar } from 'lucide-react';
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
  
  const isCursos = pathname.startsWith('/portal-alumno/dashboard/cursos');
  const isCalendario = pathname.startsWith('/portal-alumno/dashboard/calendario');
  const showFloatingActions = isCursos || isCalendario;

  const navItems = [
    { label: 'Inicio', href: '/portal-alumno/dashboard', icon: Home, active: pathname === '/portal-alumno/dashboard' || 
                                                                     pathname.startsWith('/portal-alumno/dashboard/noticias') },
    { label: 'Clases', href: '/portal-alumno/dashboard/cursos', icon: GraduationCap, active: isCursos },
    { label: 'Tú', href: '/portal-alumno/dashboard/perfil', icon: User, active: pathname === '/portal-alumno/dashboard/perfil' }
  ];

  return createPortal(
    <>
      <HapticTrigger ref={hapticRef} />
      <AnimatePresence>
        {isVisible && (
          <div className="md:hidden fixed bottom-4 left-0 right-0 z-[1000] flex flex-col items-center gap-4 px-6 pointer-events-none">
            
            {/* 1. FLOATING QUICK ACTIONS - Visible ONLY in Clases/Calendar */}
            {showFloatingActions && (
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                className="flex items-center gap-3 pointer-events-auto"
              >
                  <Link
                    href="/portal-alumno/dashboard/cursos"
                    onClick={triggerHaptic}
                    className={`bg-white border-2 px-6 py-3.5 rounded-2xl flex items-center gap-2.5 active:scale-95 transition-all shadow-sm ${
                        isCursos ? 'border-[#632EB0]' : 'border-gray-50'
                    }`}
                  >
                    <GraduationCap className={`w-5.5 h-5.5 ${isCursos ? 'text-[#632EB0]' : 'text-gray-400'}`} />
                    <span className={`text-[13px] font-black tracking-tight ${isCursos ? 'text-[#632EB0]' : 'text-gray-900'}`}>Cursos</span>
                  </Link>

                  <Link
                    href="/portal-alumno/dashboard/calendario"
                    onClick={triggerHaptic}
                    className={`bg-white border-2 px-6 py-3.5 rounded-2xl flex items-center gap-2.5 active:scale-95 transition-all shadow-sm ${
                        isCalendario ? 'border-[#632EB0]' : 'border-gray-50'
                    }`}
                  >
                    <Calendar className={`w-5.5 h-5.5 ${isCalendario ? 'text-[#632EB0]' : 'text-gray-400'}`} />
                    <span className={`text-[13px] font-black tracking-tight ${isCalendario ? 'text-[#632EB0]' : 'text-gray-900'}`}>Calendario</span>
                  </Link>
              </motion.div>
            )}

            {/* 2. MAIN BOTTOM NAV BAR - Minimal, Solid */}
            <motion.nav 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="bg-white border border-gray-100 rounded-[2rem] p-1.5 shadow-sm pointer-events-auto flex items-center justify-between gap-1 w-full max-w-[400px]"
            >
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={triggerHaptic}
                  className={`flex flex-col items-center justify-center flex-1 py-3 transition-all rounded-3xl ${
                    item.active 
                      ? 'text-[#632EB0]' 
                      : 'text-gray-400'
                  }`}
                >
                  <item.icon className="w-5.5 h-5.5 mb-1" strokeWidth={item.active ? 2.5 : 2} />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {item.label}
                  </span>
                </Link>
              ))}
            </motion.nav>
          </div>
        )}
      </AnimatePresence>
    </>,

    document.body
  );
}
