"use client";

import React, { useState } from 'react';
import { ArrowRight } from "lucide-react";

export default function UpgradeButton() {
    const [isLoading, setIsLoading] = useState(false);

    const handleCheckout = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    priceId: 'price_1T9w8q0qbWrTcjOeZ9z9n3ae',
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                alert(errorData.error || 'Ocurrió un error al procesar el pago.');
                return;
            }

            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert('No se pudo conectar con el sistema de pagos.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button 
            onClick={handleCheckout}
            disabled={isLoading}
            className="w-full bg-[#815a9b] hover:bg-[#6a4a7f] text-white py-5 rounded-2xl font-black text-xl shadow-lg shadow-purple-500/30 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
        >
            {isLoading ? (
                <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
                <>
                    <span>Activar Membresía Ludora</span>
                    <ArrowRight className="w-5 h-5" />
                </>
            )}
        </button>
    );
}
