"use client";

import React from "react";
import Link from "next/link";
import { Lock, CreditCard } from "lucide-react";

export default function CheckoutPrompt() {
    const handleCheckout = async () => {
        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    // TODO: Replace with the actual Stripe Price ID
                    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || 'price_1T8WrO0qbWrTcjOehklKiW9X',
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
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6">
                <Lock className="w-10 h-10 text-amber-600" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Suscripción Requerida
            </h1>

            <p className="text-gray-600 max-w-md mb-8 text-lg">
                Para acceder al Portal del Alumno y a todos los recursos educativos de Ludora Learning, necesitas una suscripción activa a nuestras clases.
            </p>

            <button
                onClick={handleCheckout}
                className="flex items-center gap-3 bg-gradient-to-r from-[#0F5451] to-[#0F7357] hover:from-[#0b403d] hover:to-[#0a523e] text-white font-bold rounded-xl py-4 px-8 transition-all transform hover:-translate-y-0.5 shadow-lg shadow-[#0F5451]/30 focus:outline-none focus:ring-2 focus:ring-[#0F7357] focus:ring-offset-2 text-lg"
            >
                <CreditCard className="w-5 h-5" />
                Suscribirse Ahora
            </button>

            <Link href="/" className="mt-6 text-sm text-gray-500 hover:text-gray-800 transition-colors underline">
                Volver a la página principal
            </Link>
        </div>
    );
}
