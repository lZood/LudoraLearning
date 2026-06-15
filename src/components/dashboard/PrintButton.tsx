'use client';
import { Printer } from 'lucide-react';

export default function PrintButton() {
    return (
        <button
            onClick={() => window.print()}
            className="print:hidden inline-flex items-center gap-2 px-5 py-2.5 bg-[#632EB0] hover:bg-[#522594] text-white font-bold rounded-2xl transition-all active:scale-95"
        >
            <Printer className="w-4 h-4" /> Imprimir / Guardar PDF
        </button>
    );
}
