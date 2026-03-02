"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface ContentCardProps {
    title: string;
    body: string;
    buttonText: string;
    buttonHref: string;
}

export default function ContentCard({ title, body, buttonText, buttonHref }: ContentCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="bg-[#f5f1e4] rounded-[40px] p-10 md:p-16 shadow-sm w-full max-w-4xl mx-auto flex flex-col items-start"
        >
            <h3 className="text-4xl md:text-5xl font-bold text-[#1d1d1b] leading-tight mb-6">
                {title}
            </h3>
            <p className="text-lg text-neutral-700 leading-relaxed mb-8">
                {body}
            </p>

            <Link
                href={buttonHref}
                className="inline-flex items-center gap-2 rounded-full border border-black px-6 py-2.5 font-bold text-[#1d1d1b] hover:bg-black hover:text-[#f5f1e4] transition-colors duration-300 group"
            >
                {buttonText}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
        </motion.div>
    );
}
