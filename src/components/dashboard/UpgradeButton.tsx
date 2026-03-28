"use client";

import React, { useState } from 'react';
import { ArrowRight } from "lucide-react";

interface UpgradeButtonProps {
    priceId?: string;
    label?: string;
    variant?: 'primary' | 'secondary';
}

export default function UpgradeButton({ 
    priceId = 'price_1T9w8q0qbWrTcjOeZ9z9n3ae', 
    label = "Activar Membresía Ludora",
    variant = 'primary'
}: UpgradeButtonProps) {
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
                    priceId: priceId,
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

    const baseStyles = "w-full py-4 rounded-[1.5rem] font-black text-lg shadow-lg transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed";
    const variants = {
        primary: "bg-[#815a9b] hover:bg-[#6a4a7f] text-white shadow-purple-500/20",
        secondary: "bg-white border-2 border-purple-100 text-[#815a9b] hover:bg-purple-50 shadow-sm"
    };

    return (
        <button 
            onClick={handleCheckout}
            disabled={isLoading}
            className={`${baseStyles} ${variants[variant]}`}
        >
            {isLoading ? (
                <div className="w-6 h-6 border-4 border-current border-t-transparent rounded-full animate-spin"></div>
            ) : (
                <>
                    <span>{label}</span>
                    <ArrowRight className="w-5 h-5" />
                </>
            )}
        </button>
    );
}
