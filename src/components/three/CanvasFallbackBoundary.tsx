'use client';
// Si el canvas 3D falla (WebGL no disponible, error de runtime), cae al tablero 2D.
import React from 'react';

type Props = { fallback: React.ReactNode; children: React.ReactNode };

export default class CanvasFallbackBoundary extends React.Component<Props, { err: boolean }> {
    state = { err: false };
    static getDerivedStateFromError() { return { err: true }; }
    componentDidCatch(e: unknown) { console.warn('[3D] fallback a 2D:', e); }
    render() { return this.state.err ? this.props.fallback : this.props.children; }
}
