"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

interface FAQItem {
    question: string;
    answer: string;
}

const faqItems: FAQItem[] = [
    {
        question: "¿Cómo funcionan las clases dentro de Minecraft?",
        answer: "Cada sesión se lleva a cabo en un servidor privado de Minecraft diseñado específicamente para el aprendizaje. Los alumnos completan misiones, construyen proyectos y participan en actividades que refuerzan vocabulario, gramática y conversación, todo en inglés y con la guía en tiempo real de los maestros.",
    },
    {
        question: "¿Qué edades pueden participar en las clases?",
        answer: "Nuestro programa está diseñado para todo publico mayor de 9 años. Agrupamos a los alumnos por edad y nivel de inglés para garantizar la mejor experiencia de aprendizaje posible.",
    },
    {
        question: "¿Necesito tener Minecraft Bedrock Edition para tomar las clases?",
        answer: "Sí, necesitas tener Minecraft Bedrock Edition. Te proporcionamos acceso a nuestro servidor privado y todo el material digital necesario. Si no estás seguro de qué versión necesitas, te ayudamos a configurarlo.",
    },
    {
        question: "¿Qué incluye mi inscripción?",
        answer: "El plan incluye 4 sesiones de 1 hora al mes (una por semana). Cada sesión está diseñada para construir sobre lo aprendido la semana anterior, manteniendo un progreso constante y medible. Añadiendo tareas mínimas asignadas durante la semana, siendo todo esto reforzado con más herramientas y material digital que se encuentra en el portal de alumnos, de esta modo retienen la información de la manera más entretenida posible. ",
    },
    {
        question: "Si ya tengo conocimientos de inglés, ¿se puede adaptar el nivel?",
        answer: "¡Por supuesto! Antes de comenzar, hacemos una evaluación inicial para determinar el nivel del alumno. Tenemos grupos desde principiante absoluto hasta intermedio-avanzado. Así nos aseguramos de que cada alumno esté en el grupo correcto.",
    },
    {
        question: "¿Cómo puedo dar seguimiento al progreso dentro del curso?",
        answer: "Tienes acceso al Portal de Alumnos donde puedes ver reportes detallados del progreso, logros desbloqueados, vocabulario aprendido y evaluaciones. Además, enviamos un resumen mensual por email.",
    },
    {
        question: "¿Qué sucede si no puedo asistir a una clase?",
        answer: "Entendemos que a veces surgen imprevistos, es por eso que todas nuestras sesiones son grabadas y se encuentran disponibles en el portal de alumnos. Si un estudiante no puede asistir a una clase, podrá acceder posteriormente al gameplay de la sesión para retomar el contenido visto.",
    },
    {
        question: "¿Es posible agendar una clase de prueba gratuita?",
        answer: "¡Sí! Ofrecemos una sesión de prueba gratuita de 30 minutos para que tu hijo pueda experimentar la metodología. Puedes agendarla directamente desde nuestra página de contacto o por WhatsApp.",
    },
];

function FAQAccordionItem({ item, index, isOpen, onToggle }: {
    item: FAQItem;
    index: number;
    isOpen: boolean;
    onToggle: () => void;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ delay: index * 0.06, duration: 0.5, type: "spring" }}
        >
            <button
                onClick={onToggle}
                className={`w-full flex items-center justify-between gap-6 p-6 md:p-8 text-left transition-all duration-300 ${isOpen ? "bg-white rounded-t-[24px]" : "bg-white rounded-[24px] hover:bg-[#8ED462]/10 hover:scale-[1.01] hover:shadow-md"
                    }`}
            >
                <span className="text-lg md:text-xl font-bold text-[#222222] leading-snug flex-grow">
                    {item.question}
                </span>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${isOpen ? "bg-[#8ED462] text-white rotate-0" : "bg-gray-100 text-gray-500 rotate-0"
                    }`}>
                    {isOpen ? <Minus className="w-5 h-5" strokeWidth={3} /> : <Plus className="w-5 h-5" strokeWidth={3} />}
                </div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden bg-white rounded-b-[24px]"
                    >
                        <div className="px-6 md:px-8 pb-6 md:pb-8">
                            <div className="h-px bg-gray-100 mb-5" />
                            <p className="text-[#666666] text-base md:text-lg leading-relaxed font-medium">
                                {item.answer}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section className="relative w-full min-h-screen py-28 md:py-36 bg-white rounded-t-[50px] rounded-b-[50px] overflow-hidden flex items-center px-6">
            {/* Blobs */}
            <div className="absolute top-20 right-[-50px] w-64 h-64 bg-[#8ED462]/15 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute bottom-20 left-[-30px] w-56 h-56 bg-[#86d2fb]/15 rounded-full blur-[70px] pointer-events-none" />

            <div className="relative z-10 max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, type: "spring", bounce: 0.3 }}
                    className="text-center mb-16 md:mb-20"
                >
                    <span className="inline-block bg-[#86d2fb]/15 text-[#2a8ebd] px-6 py-2.5 rounded-full text-sm font-bold uppercase tracking-[0.15em] mb-6">
                        🧩 Preguntas Frecuentes
                    </span>
                    <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-[#222222] tracking-tight leading-[1.05]">
                        ¿Algo más que{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#86d2fb] to-[#2a8ebd]">
                            quieras saber?
                        </span>
                    </h2>
                </motion.div>

                {/* Accordion */}
                <div className="flex flex-col gap-3">
                    {faqItems.map((item, i) => (
                        <FAQAccordionItem
                            key={i}
                            item={item}
                            index={i}
                            isOpen={openIndex === i}
                            onToggle={() => setOpenIndex(openIndex === i ? null : i)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
