"use client";

import React, { useState } from 'react';
import { ExternalLink } from "lucide-react";

export default function ManageSuscripcionButton({ label = "Gestionar en Stripe" }: { label?: string }) {
    const [isLoading, setIsLoading] = useState(false);

    const handlePortal = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/billing-portal', {
                method: 'POST',
            });

            if (!res.ok) {
                const errorData = await res.json();
                alert(errorData.error || 'Ocurrió un error al acceder al portal de facturación.');
                return;
            }

            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (error) {
            console.error('Portal error:', error);
            alert('No se pudo conectar con el portal de facturación.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button 
            onClick={handlePortal}
            disabled={isLoading}
            className="flex items-center gap-2 text-sm font-black text-purple-100 hover:text-white transition-colors group disabled:opacity-50"
        >
            {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
                <>
                    <span>{label}</span>
                    <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
            )}
        </button>
    );
}
