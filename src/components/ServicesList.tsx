"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";

const cx = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(" ");

const servicesList = [
    { title: "Online Bulletin Boards", image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=400&q=80" },
    { title: "Focus Groups, Dyads & Triads", image: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=400&auto=format&fit=crop" },
    { title: "Taste Testing", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=400&auto=format&fit=crop" },
    { title: "Central Location Testing", image: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=400&auto=format&fit=crop" },
    { title: "Customer Intercept", image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=400&auto=format&fit=crop" },
    { title: "Online Diary", image: "https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=400&auto=format&fit=crop" },
    { title: "Mystery Shopping", image: "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?q=80&w=400&auto=format&fit=crop" },
    { title: "Shop-Along", image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=400&auto=format&fit=crop" },
    { title: "UX Research", image: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?q=80&w=400&auto=format&fit=crop" },
    { title: "In-depth Interviews", image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=400&auto=format&fit=crop" },
    { title: "Ethnographic Research", image: "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?q=80&w=400&auto=format&fit=crop" },
];

export default function ServicesList() {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    return (
        <section className="bg-[#f5f1e4] rounded-t-[3rem] rounded-b-[3rem] py-20 px-6 sm:px-12 md:px-24 mx-auto max-w-7xl relative z-10 w-full mb-20 overflow-visible">
            {/* Container for the grid, allowing hover elements to escape bounds */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 lg:gap-x-24 gap-y-0 w-full relative">
                {servicesList.map((service, index) => {
                    const isHovered = hoveredIndex === index;
                    // Left column has index 0, 2, 4... Right has 1, 3, 5...
                    const isLeftColumn = index % 2 === 0;

                    return (
                        <div
                            key={index}
                            className={cx(
                                "relative border-black/10 py-2 md:py-1",
                                index >= servicesList.length - 2 ? "border-b-0" : "border-b",
                                index === servicesList.length - 1 ? "border-b-0" : ""
                            )}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            <div
                                className={cx(
                                    "flex items-center justify-between transition-all duration-300 py-6 px-4 md:px-0 relative z-20 cursor-pointer",
                                    isHovered ? "bg-white rounded-2xl md:px-6 shadow-sm -mx-4 md:-mx-6 scale-[1.02]" : "bg-transparent scale-100"
                                )}
                            >
                                <h3 className="text-xl md:text-[22px] font-medium tracking-tight text-[#1a1a1a]">
                                    {service.title}
                                </h3>

                                <div
                                    className={cx(
                                        "flex items-center justify-center transition-all duration-300",
                                        isHovered ? "w-10 h-10 bg-[#e2dec9] rounded-full" : "w-6 h-6 bg-transparent"
                                    )}
                                >
                                    <ChevronRight className={cx("w-5 h-5 text-[#1a1a1a]", isHovered ? "opacity-100" : "opacity-60")} />
                                </div>
                            </div>

                            {/* The Hover Image - Right-aligned near the chevron */}
                            <AnimatePresence>
                                {isHovered && (
                                    <motion.div
                                        initial={{
                                            opacity: 0,
                                            x: 20,
                                            rotate: (Math.floor(index / 2) + (index % 2)) % 2 === 0 ? 12 : -12,
                                            scale: 0.8,
                                        }}
                                        animate={{
                                            opacity: 1,
                                            x: -20, // Slightly offset from the right to appear near the arrow
                                            rotate: (Math.floor(index / 2) + (index % 2)) % 2 === 0 ? 6 : -6,
                                            scale: 1,
                                        }}
                                        exit={{
                                            opacity: 0,
                                            x: 20,
                                            rotate: (Math.floor(index / 2) + (index % 2)) % 2 === 0 ? 12 : -12,
                                            scale: 0.8,
                                        }}
                                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                        className="absolute right-0 top-1/2 -translate-y-1/2 z-50 pointer-events-none w-[150px] h-[210px] md:w-[170px] md:h-[230px] rounded-2xl overflow-hidden shadow-2xl bg-[#e2dec9] hidden md:block"
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={service.image}
                                            alt={service.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
