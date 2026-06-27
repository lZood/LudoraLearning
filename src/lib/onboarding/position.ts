// Posicionamiento del tooltip del tour respecto al ancla, sin dependencias.
// Calcula colocación (flip arriba/abajo según espacio), clamp al viewport y
// la posición de la flecha que apunta al elemento.
import type { TourPlacement } from './steps';

export interface TooltipPosition {
  top: number;
  left: number;
  placement: 'top' | 'bottom' | 'left' | 'right';
  arrow: { x: number; y: number };
}

function clamp(value: number, lo: number, hi: number): number {
  if (hi < lo) return lo;
  return Math.max(lo, Math.min(hi, value));
}

export function computeTooltipPosition(
  rect: DOMRect,
  tipW: number,
  tipH: number,
  preferred: TourPlacement = 'auto',
): TooltipPosition {
  const gap = 14;
  const margin = 10;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const spaceBelow = vh - rect.bottom;
  const spaceAbove = rect.top;

  let placement: 'top' | 'bottom' | 'left' | 'right';
  if (preferred === 'auto') {
    placement = spaceBelow >= tipH + gap || spaceBelow >= spaceAbove ? 'bottom' : 'top';
  } else {
    placement = preferred;
  }

  if (placement === 'top' || placement === 'bottom') {
    let top = placement === 'bottom' ? rect.bottom + gap : rect.top - tipH - gap;
    top = clamp(top, margin, vh - tipH - margin);
    const left = clamp(rect.left + rect.width / 2 - tipW / 2, margin, vw - tipW - margin);
    const arrowX = clamp(rect.left + rect.width / 2 - left, 18, tipW - 18);
    return { top, left, placement, arrow: { x: arrowX, y: placement === 'bottom' ? 0 : tipH } };
  }

  // left / right
  let left = placement === 'right' ? rect.right + gap : rect.left - tipW - gap;
  left = clamp(left, margin, vw - tipW - margin);
  const top = clamp(rect.top + rect.height / 2 - tipH / 2, margin, vh - tipH - margin);
  const arrowY = clamp(rect.top + rect.height / 2 - top, 18, tipH - 18);
  return { top, left, placement, arrow: { x: placement === 'right' ? 0 : tipW, y: arrowY } };
}
