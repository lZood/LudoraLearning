'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Calendar } from 'lucide-react';
import { usePathname } from 'next/navigation';
import HapticTrigger, { HapticHandle } from '@/components/ui/HapticTrigger';

export default function CursosSubNav() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const pathname = usePathname();
  const hapticRef = useRef<HapticHandle>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Mostrar si se hace scroll hacia arriba o si estamos muy arriba
      if (currentScrollY < lastScrollY || currentScrollY < 100) {
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

  const navItems = [
    { title: 'Cursos', icon: GraduationCap, href: '/portal-alumno/dashboard/cursos' },
    { title: 'Calendario', icon: Calendar, href: '/portal-alumno/dashboard/calendario' },
  ];

  return (
    <>
      <HapticTrigger ref={hapticRef} />
      <AnimatePresence>
        {isVisible && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="fixed bottom-28 left-0 right-0 z-[90] px-4 pointer-events-none md:hidden"
          >
            <div className="flex justify-center gap-3 w-full pointer-events-auto">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                
                return (
                  <Link 
                    key={item.href}
                    href={item.href}
                    onClick={triggerHaptic}
                    className={`flex items-center gap-3 py-3 px-6 rounded-full border transition-all active:scale-95 shadow-xl ${
                      isActive 
                        ? 'bg-[#632EB0] border-[#632EB0] text-white shadow-purple-200' 
                        : 'bg-white/90 backdrop-blur-md border-gray-100 text-gray-500 hover:text-[#632EB0]'
                    }`}
                  >
                    <Icon className="w-5 h-5" strokeWidth={3} />
                    <span className="text-sm font-black whitespace-nowrap">
                      {item.title}
                    </span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
