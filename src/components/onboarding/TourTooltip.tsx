'use client';

// Tarjeta del tour (tooltip). Se posiciona junto al ancla (o centrada en la bienvenida /
// mientras carga). Voz cálida, estética de marca (morado #632EB0, redondeado).

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft, ArrowRight, X } from 'lucide-react';
import { useOnboarding } from './OnboardingProvider';
import { computeTooltipPosition } from '@/lib/onboarding/position';

const PURPLE = '#632EB0';

function arrowStyle(
  placement: 'top' | 'bottom' | 'left' | 'right',
  x: number,
  y: number,
): React.CSSProperties {
  const base: React.CSSProperties = {
    position: 'absolute',
    width: 14,
    height: 14,
    background: 'white',
    transform: 'rotate(45deg)',
    borderRadius: 3,
  };
  const line = '1px solid rgba(0,0,0,0.05)';
  if (placement === 'bottom') return { ...base, top: -6, left: x - 7, borderLeft: line, borderTop: line };
  if (placement === 'top') return { ...base, bottom: -6, left: x - 7, borderRight: line, borderBottom: line };
  if (placement === 'right') return { ...base, left: -6, top: y - 7, borderLeft: line, borderBottom: line };
  return { ...base, right: -6, top: y - 7, borderRight: line, borderTop: line };
}

export default function TourTooltip() {
  const { state, step, stepIndex, totalSteps, targetRect, next, prev, skip, reducedMotion } =
    useOnboarding();
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 340, h: 210 });

  // Mide la tarjeta para posicionarla con precisión.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (Math.abs(r.width - size.w) > 1 || Math.abs(r.height - size.h) > 1) {
      setSize({ w: r.width, h: r.height });
    }
  });

  const isCenter = !step?.anchor;
  const located = !!targetRect;
  const loading = !isCenter && !located; // ancla pendiente (navegando/localizando)

  // Mueve el foco a la tarjeta al cambiar de paso (accesibilidad).
  useEffect(() => {
    if (!loading && ref.current) {
      try {
        ref.current.focus();
      } catch {
        /* noop */
      }
    }
  }, [step?.id, loading]);

  if (!step) return null;

  const isFirst = stepIndex === 0;
  const isLast = stepIndex === totalSteps - 1;

  let posStyle: React.CSSProperties;
  let arrow: { placement: 'top' | 'bottom' | 'left' | 'right'; x: number; y: number } | null = null;
  if (isCenter || loading || !targetRect) {
    posStyle = { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
  } else {
    const p = computeTooltipPosition(targetRect, size.w, size.h, step.placement ?? 'auto');
    posStyle = { top: p.top, left: p.left };
    arrow = { placement: p.placement, x: p.arrow.x, y: p.arrow.y };
  }

  return (
    <motion.div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-title"
      tabIndex={-1}
      key={loading ? 'tour-loading' : step.id}
      initial={{ opacity: 0, scale: 0.96, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={
        reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 280, damping: 24 }
      }
      style={{
        position: 'fixed',
        width: 'min(92vw, 360px)',
        pointerEvents: 'auto',
        outline: 'none',
        ...posStyle,
      }}
      className="rounded-[2rem] bg-white shadow-[0_24px_70px_rgba(17,12,34,0.35)] border border-black/5 p-6"
    >
      {loading ? (
        <div className="flex items-center gap-3 py-2">
          <Loader2 className="w-5 h-5 animate-spin" style={{ color: PURPLE }} />
          <span className="text-sm font-bold text-gray-500">Cargando…</span>
        </div>
      ) : (
        <>
          <button
            onClick={skip}
            aria-label="Saltar guía"
            className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2 pr-6">
            {step.emoji && <span className="text-2xl leading-none">{step.emoji}</span>}
            <h2 id="tour-title" className="text-lg font-black text-gray-900 tracking-tight">
              {step.title}
            </h2>
          </div>
          <p aria-live="polite" className="text-[14px] text-gray-500 font-medium leading-relaxed mb-5">
            {step.body}
          </p>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5" aria-hidden>
              {Array.from({ length: totalSteps }).map((_, i) => (
                <span
                  key={i}
                  className="rounded-full transition-all"
                  style={{
                    width: i === stepIndex ? 18 : 6,
                    height: 6,
                    background: i === stepIndex ? PURPLE : '#e5e0f0',
                  }}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              {!isFirst && (
                <button
                  onClick={prev}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-[13px] font-black text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Atrás
                </button>
              )}
              <button
                onClick={next}
                style={{ background: PURPLE }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-black text-white shadow-lg shadow-purple-500/25 active:scale-95 transition-transform"
              >
                {isLast ? '¡Empezar!' : isFirst ? 'Empezar' : 'Siguiente'}
                {!isLast && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {!isFirst && !isLast && (
            <button
              onClick={skip}
              className="mt-3 w-full text-center text-[12px] font-bold text-gray-300 hover:text-gray-500 transition-colors"
            >
              Saltar guía
            </button>
          )}

          {arrow && <span aria-hidden style={arrowStyle(arrow.placement, arrow.x, arrow.y)} />}
        </>
      )}
    </motion.div>
  );
}
