'use client';

// Provider del tour de onboarding. Se monta en el layout del dashboard (cliente), que
// NO se desmonta al navegar entre rutas hermanas (PageTransition deja el portal fuera de
// su AnimatePresence), por lo que el estado del tour PERSISTE durante router.push.
//
// Máquina de estados: idle -> navigating -> locating -> active  (y de vuelta a idle).
//  - navigating: ya hubo router.push; esperamos a que pathname === step.route.
//  - locating: en la ruta correcta; esperamos a que aparezca el ancla [data-tour].
//  - active: ancla medida; se muestra el spotlight + tooltip.
// El dim de pantalla completa permanece durante todo el tour (anti-parpadeo).

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useReducedMotion } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import {
  ONBOARDING_HOME,
  ONBOARDING_STEPS,
  type OnboardingStep,
} from '@/lib/onboarding/steps';
import { waitForAnchor } from '@/lib/onboarding/waitForAnchor';

type TourState = 'idle' | 'navigating' | 'locating' | 'active';

interface OnboardingContextValue {
  state: TourState;
  active: boolean;
  stepIndex: number;
  step: OnboardingStep | null;
  totalSteps: number;
  targetRect: DOMRect | null;
  reducedMotion: boolean;
  next: () => void;
  prev: () => void;
  skip: () => void;
  start: (opts?: { force?: boolean }) => void;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding debe usarse dentro de <OnboardingProvider>');
  return ctx;
}

export default function OnboardingProvider({
  userId,
  children,
}: {
  userId?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const reducedMotion = useReducedMotion() ?? false;

  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<TourState>('idle');
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const steps = ONBOARDING_STEPS;

  const forcedRef = useRef(false); // replay manual (?tour=1): no toca el flag
  const autoCheckedRef = useRef(false); // el arranque automático se evalúa una sola vez
  const mismatchRef = useRef(0); // correcciones de ruta antes de rendirse
  const focusReturnRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ── Persistencia del flag (solo en arranque automático, nunca en replay forzado) ──
  const persistComplete = useCallback(async () => {
    if (forcedRef.current || !userId) return;
    try {
      await createClient()
        .from('users')
        .update({ has_completed_onboarding: true })
        .eq('id', userId);
    } catch {
      /* offline: el cierre local igual ocurre; se reconcilia en el próximo arranque */
    }
  }, [userId]);

  const end = useCallback(() => {
    void persistComplete();
    setState('idle');
    setTargetRect(null);
    const el = focusReturnRef.current;
    focusReturnRef.current = null;
    if (el && typeof el.focus === 'function') {
      try {
        el.focus();
      } catch {
        /* noop */
      }
    }
  }, [persistComplete]);

  // Mueve el tour al paso `index`: navega si hace falta (navigating) o localiza el ancla.
  const goToStep = useCallback(
    (index: number) => {
      const target = steps[index];
      if (!target) {
        end();
        return;
      }
      setStepIndex(index);
      setTargetRect(null);
      mismatchRef.current = 0;
      if (pathname !== target.route) {
        setState('navigating');
        router.push(target.route);
      } else {
        setState('locating');
      }
    },
    [steps, pathname, router, end],
  );

  const next = useCallback(() => {
    if (stepIndex >= steps.length - 1) {
      end();
      return;
    }
    goToStep(stepIndex + 1);
  }, [stepIndex, steps.length, end, goToStep]);

  const prev = useCallback(() => {
    if (stepIndex <= 0) return;
    goToStep(stepIndex - 1);
  }, [stepIndex, goToStep]);

  const skip = useCallback(() => {
    end();
  }, [end]);

  const start = useCallback(
    (opts?: { force?: boolean }) => {
      forcedRef.current = !!opts?.force;
      focusReturnRef.current = (document.activeElement as HTMLElement) ?? null;
      goToStep(0);
    },
    [goToStep],
  );

  // ── Arranque FORZADO vía ?tour=1 (funciona aunque el automático ya haya corrido) ──
  useEffect(() => {
    if (!mounted) return;
    let forced = false;
    try {
      forced = new URLSearchParams(window.location.search).get('tour') === '1';
    } catch {
      /* noop */
    }
    if (!forced) return;
    // Limpia el parámetro de la URL sin navegar (evita re-disparo en re-render).
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('tour');
      window.history.replaceState(null, '', url.pathname + url.search + url.hash);
    } catch {
      /* noop */
    }
    if (state !== 'idle') return;
    forcedRef.current = true;
    focusReturnRef.current = (document.activeElement as HTMLElement) ?? null;
    mismatchRef.current = 0;
    setStepIndex(0);
    setState('locating'); // ?tour=1 siempre llega al home (pathname ya = ONBOARDING_HOME)
  }, [mounted, pathname, state]);

  // ── Arranque AUTOMÁTICO (una vez): si el flag es false y estamos en el home ──
  useEffect(() => {
    if (!mounted || autoCheckedRef.current) return;
    if (state !== 'idle') {
      autoCheckedRef.current = true; // el tour ya arrancó (p. ej. forzado)
      return;
    }
    if (!userId || pathname !== ONBOARDING_HOME) return;
    autoCheckedRef.current = true;
    let cancelled = false;
    (async () => {
      try {
        const { data } = await createClient()
          .from('users')
          .select('has_completed_onboarding')
          .eq('id', userId)
          .maybeSingle();
        if (cancelled || !data) return;
        if (data.has_completed_onboarding === false) {
          forcedRef.current = false;
          focusReturnRef.current = (document.activeElement as HTMLElement) ?? null;
          mismatchRef.current = 0;
          setStepIndex(0);
          setState('locating');
        }
      } catch {
        /* noop */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mounted, userId, pathname, state]);

  // ── navigating -> locating al llegar a la ruta del paso ──
  useEffect(() => {
    if (state !== 'navigating') return;
    const s = steps[stepIndex];
    if (s && pathname === s.route) setState('locating');
  }, [state, stepIndex, pathname, steps]);

  // ── locating: resolver el ancla y pasar a active ──
  useEffect(() => {
    if (state !== 'locating') return;
    const s = steps[stepIndex];
    if (!s) {
      end();
      return;
    }
    if (!s.anchor) {
      setTargetRect(null);
      setState('active'); // tarjeta centrada (bienvenida)
      return;
    }
    let cancelled = false;
    (async () => {
      const el = await waitForAnchor(s.anchor as string, 4000);
      if (cancelled) return;
      if (!el) {
        if (s.optional === false) {
          setTargetRect(null);
          setState('active'); // fallback centrado
        } else {
          next(); // salta el paso (avanza o termina si es el último)
        }
        return;
      }
      el.scrollIntoView({
        block: 'center',
        inline: 'center',
        behavior: reducedMotion ? 'auto' : 'smooth',
      });
      // Medir tras asentar el scroll (dos rAF).
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (cancelled) return;
          setTargetRect(el.getBoundingClientRect());
          setState('active');
        });
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [state, stepIndex, steps, reducedMotion, end, next]);

  // ── Reposicionar el recorte en scroll/resize mientras está activo ──
  useEffect(() => {
    if (state !== 'active') return;
    const s = steps[stepIndex];
    if (!s || !s.anchor) return;
    const anchor = s.anchor;
    let raf = 0;
    const update = () => {
      const els = document.querySelectorAll(`[data-tour="${anchor}"]`);
      for (const node of Array.from(els)) {
        if (node instanceof HTMLElement) {
          const r = node.getBoundingClientRect();
          if (r.width > 0 && r.height > 0) {
            setTargetRect(r);
            return;
          }
        }
      }
    };
    const onScrollResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScrollResize, true);
    window.addEventListener('resize', onScrollResize);
    let ro: ResizeObserver | null = null;
    const first = document.querySelector(`[data-tour="${anchor}"]`);
    if (first && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(onScrollResize);
      ro.observe(first);
    }
    return () => {
      window.removeEventListener('scroll', onScrollResize, true);
      window.removeEventListener('resize', onScrollResize);
      cancelAnimationFrame(raf);
      if (ro) ro.disconnect();
    };
  }, [state, stepIndex, steps]);

  // ── Si el usuario navega fuera de la ruta del paso (p. ej. botón Atrás del navegador) ──
  useEffect(() => {
    if (state !== 'active' && state !== 'locating') return;
    const s = steps[stepIndex];
    if (!s) return;
    if (pathname !== s.route) {
      if (mismatchRef.current >= 2) {
        end();
        return;
      }
      mismatchRef.current += 1;
      setTargetRect(null);
      setState('navigating');
      router.push(s.route);
    } else {
      mismatchRef.current = 0;
    }
  }, [state, stepIndex, pathname, steps, router, end]);

  const value: OnboardingContextValue = {
    state,
    active: state !== 'idle',
    stepIndex,
    step: state === 'idle' ? null : steps[stepIndex] ?? null,
    totalSteps: steps.length,
    targetRect,
    reducedMotion,
    next,
    prev,
    skip,
    start,
  };

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}
