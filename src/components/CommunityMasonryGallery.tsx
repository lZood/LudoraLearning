"use client";

import React, { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const photos = [
    { src: "https://images.unsplash.com/photo-1616588589676-62b3d4ff6a10?auto=format&fit=crop&w=800&q=80", alt: "Alumno jugando Minecraft", span: "large" },
    { src: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80", alt: "Clase interactiva", span: "normal" },
    { src: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=600&q=80", alt: "Estudiantes aprendiendo", span: "normal" },
    { src: "https://images.unsplash.com/photo-1560785496-3c9d27877182?auto=format&fit=crop&w=600&q=80", alt: "Niños en clase", span: "normal" },
    { src: "https://images.unsplash.com/photo-1529390079861-591de354faf5?auto=format&fit=crop&w=600&q=80", alt: "Gaming educativo", span: "normal" },
    { src: "https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=800&q=80", alt: "Aula moderna", span: "large" },
    { src: "https://images.unsplash.com/photo-1472162072942-cd5147eb3902?auto=format&fit=crop&w=600&q=80", alt: "Trabajo en equipo", span: "normal" },
    { src: "https://images.unsplash.com/photo-1610484826967-09c5720778c7?auto=format&fit=crop&w=600&q=80", alt: "Minecraft mundo", span: "normal" },
    { src: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80", alt: "Niños felices", span: "normal" },
    { src: "https://images.unsplash.com/photo-1555009393-f20bdb245c4d?auto=format&fit=crop&w=600&q=80", alt: "Aprendizaje creativo", span: "normal" },
    { src: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?auto=format&fit=crop&w=800&q=80", alt: "Sesión grupal", span: "large" },
    { src: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80", alt: "Celebración de logros", span: "normal" },
    { src: "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?auto=format&fit=crop&w=600&q=80", alt: "Lectura en grupo", span: "normal" },
    { src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80", alt: "Colaboración", span: "normal" },
    { src: "https://images.unsplash.com/photo-1607453998774-d533f65dac99?auto=format&fit=crop&w=600&q=80", alt: "Minecraft aventura", span: "normal" },
    { src: "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?auto=format&fit=crop&w=600&q=80", alt: "Educación digital", span: "normal" },
    { src: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80", alt: "Programación creativa", span: "normal" },
    { src: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=600&q=80", alt: "Estudio creativo", span: "normal" },
    { src: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80", alt: "Equipo diverso", span: "large" },
    { src: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=600&q=80", alt: "Clase en vivo", span: "normal" },
];

const INITIAL_COUNT = 8;

function GalleryItem({ photo, index }: { photo: typeof photos[0]; index: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    const isLarge = photo.span === "large";

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{
                duration: 0.6,
                delay: (index % 8) * 0.06,
                type: "spring",
                bounce: 0.25,
            }}
            className={`group cursor-pointer ${isLarge
                    ? "col-span-1 sm:col-span-2 row-span-1 sm:row-span-2"
                    : "col-span-1 row-span-1"
                }`}
        >
            <div className="relative rounded-[24px] overflow-hidden h-full">
                <img
                    src={photo.src}
                    alt={photo.alt}
                    loading="lazy"
                    className={`w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105 group-hover:brightness-110 ${isLarge ? "min-h-[300px] sm:min-h-[400px]" : "min-h-[200px] sm:min-h-[250px]"
                        }`}
                />
                {/* Hover overlay with caption */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5">
                    <span className="text-white text-sm font-bold tracking-wide">
                        {photo.alt}
                    </span>
                </div>
            </div>
        </motion.div>
    );
}

export default function CommunityMasonryGallery() {
    const [expanded, setExpanded] = useState(false);
    const visiblePhotos = expanded ? photos : photos.slice(0, INITIAL_COUNT);

    return (
        <section className="relative w-full bg-white rounded-t-[50px] rounded-b-[50px] py-20 md:py-32 overflow-hidden">
            <div className="max-w-[90vw] xl:max-w-[85vw] mx-auto">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, type: "spring", bounce: 0.3 }}
                    className="text-center mb-16 md:mb-20"
                >
                    <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-[#222222] tracking-tight leading-[1.05]">
                        Momentos que nos{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8ED462] to-[#4caf2e]">
                            definen
                        </span>
                    </h2>
                </motion.div>

                {/* Grid with 2x2 large items */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                    <AnimatePresence>
                        {visiblePhotos.map((photo, index) => (
                            <GalleryItem key={index} photo={photo} index={index} />
                        ))}
                    </AnimatePresence>
                </div>

                {/* Ver más / Ver menos */}
                {!expanded && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="relative mt-[-80px] pt-32 pb-4 flex justify-center bg-gradient-to-t from-white via-white/90 to-transparent"
                    >
                        <button
                            onClick={() => setExpanded(true)}
                            className="group flex items-center gap-3 bg-[#f5f1e4] hover:bg-[#ebe7d9] text-[#222222] px-8 py-4 rounded-full font-bold text-base tracking-wide transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.1)]"
                        >
                            Ver más fotos
                            <ChevronDown className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
                        </button>
                    </motion.div>
                )}

                {expanded && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-center mt-10"
                    >
                        <button
                            onClick={() => setExpanded(false)}
                            className="group flex items-center gap-3 bg-[#f5f1e4] hover:bg-[#ebe7d9] text-[#222222] px-8 py-4 rounded-full font-bold text-base tracking-wide transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.1)]"
                        >
                            Ver menos
                            <ChevronDown className="w-5 h-5 rotate-180 group-hover:-translate-y-0.5 transition-transform" />
                        </button>
                    </motion.div>
                )}
            </div>
        </section>
    );
}
