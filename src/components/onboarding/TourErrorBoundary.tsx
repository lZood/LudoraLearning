'use client';

// Red de seguridad: si el overlay del tour fallara en runtime, lo aislamos para que
// NUNCA tumbe el dashboard. El peor caso es que la guía simplemente no se muestre.
import React from 'react';

interface State {
  hasError: boolean;
}

export default class TourErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    // No rompemos la app; dejamos rastro para diagnóstico.
    console.error('[OnboardingTour] error contenido:', error);
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}
