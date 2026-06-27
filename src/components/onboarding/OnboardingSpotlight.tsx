'use client';

// Overlay del tour: dim de pantalla completa con un "recorte" (cutout) sobre el ancla
// usando box-shadow gigante, un blocker que captura todos los clics de la página, y la
// tarjeta tooltip. Se monta vía portal a document.body por encima de todo (z-[1200]).

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { useOnboarding } from './OnboardingProvider';
import TourTooltip from './TourTooltip';

const DIM = 'rgba(17, 12, 34, 0.62)';

export default function OnboardingSpotlight() {
  const { state, step, targetRect, reducedMotion, next, prev, skip } = useOnboarding();
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  // Teclado: Esc = saltar, →/Enter = siguiente, ← = atrás.
  useEffect(() => {
    if (state === 'idle') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        skip();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault();
        next();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prev();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state, skip, next, prev]);

  if (!portalReady || state === 'idle' || !step) return null;

  const pad = step.padding ?? 10;
  const radius = step.radius ?? 24;
  const hasRect = !!targetRect && !!step.anchor;

  return createPortal(
    <div className="fixed inset-0 z-[1200]" style={{ pointerEvents: 'none' }}>
      {/* Blocker: impide interactuar con la página por debajo del tour. */}
      <div className="absolute inset-0" style={{ pointerEvents: 'auto' }} />

      {hasRect && targetRect ? (
        // Dim + recorte redondeado mediante box-shadow gigante.
        <motion.div
          initial={false}
          animate={{
            top: targetRect.top - pad,
            left: targetRect.left - pad,
            width: targetRect.width + pad * 2,
            height: targetRect.height + pad * 2,
          }}
          transition={
            reducedMotion
              ? { duration: 0 }
              : { type: 'spring', stiffness: 260, damping: 30 }
          }
          style={{
            position: 'absolute',
            borderRadius: radius,
            boxShadow: `0 0 0 9999px ${DIM}`,
            pointerEvents: 'none',
          }}
        />
      ) : (
        // Sin ancla aún (navegando/localizando) o paso centrado: dim completo.
        <motion.div
          className="absolute inset-0"
          style={{ background: DIM, pointerEvents: 'none' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reducedMotion ? 0 : 0.25 }}
        />
      )}

      <TourTooltip />
    </div>,
    document.body,
  );
}
