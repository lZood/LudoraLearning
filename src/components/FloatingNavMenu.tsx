"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const navItems = [
    { id: "nosotros", label: "Nosotros" },
    { id: "por-que", label: "Por Qué" },
    { id: "proceso", label: "Proceso" },
    { id: "diferencia", label: "Diferencia" },
    { id: "equipo", label: "Equipo" },
];

export default function FloatingNavMenu() {
    const [activeSection, setActiveSection] = useState<string>(navItems[0].id);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Show menu after scrolling past the first 500px (hero section)
        const handleScroll = () => {
            if (window.scrollY > 500) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const observers: IntersectionObserver[] = [];

        navItems.forEach(({ id }) => {
            const element = document.getElementById(id);
            if (element) {
                const observer = new IntersectionObserver(
                    (entries) => {
                        entries.forEach((entry) => {
                            if (entry.isIntersecting) {
                                setActiveSection(id);
                            }
                        });
                    },
                    {
                        // Detect when the section is approximately in the middle of the viewport
                        rootMargin: "-20% 0px -60% 0px",
                    }
                );
                observer.observe(element);
                observers.push(observer);
            }
        });

        return () => {
            observers.forEach((observer) => observer.disconnect());
        };
    }, []);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            // Smooth scroll to the element
            element.scrollIntoView({ behavior: "smooth" });
            setActiveSection(id);
        }
    };

    if (!isVisible) return null;

    return (
        <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 px-2"
        >
            <nav className="bg-white/90 backdrop-blur-md rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 p-1.5 flex items-center justify-center gap-1 sm:gap-2">
                {navItems.map((item) => {
                    const isActive = activeSection === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => scrollToSection(item.id)}
                            className={`relative px-4 py-2.5 rounded-full text-sm font-semibold transition-colors duration-300 ${isActive ? "text-white" : "text-gray-500 hover:text-gray-900"
                                }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="nav-pill"
                                    className="absolute inset-0 bg-[#00a82d] rounded-full shadow-md"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                            <span className="relative z-10">{item.label}</span>
                        </button>
                    );
                })}
            </nav>
        </motion.div>
    );
}
