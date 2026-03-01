"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, MessageCircle, X, ArrowRight } from "lucide-react";

const methodologyLinks = [
  "Aprender Jugando",
  "Niveles Disponibles",
  "Edades",
  "Herramientas"
];

const industrySectorsLinks = [
  "Sobre Valeria",
  "Formas de Pago",
  "FAQ Completo"
];

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 group shrink-0">
      <span className="sr-only">MindMarket Home</span>
      <svg width="36" height="30" viewBox="0 0 36 30" aria-hidden="true" focusable="false">
        <g fill="none">
          <path stroke="#8ED462" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.336" d="M3.837 28.21C-3.478 6.354 15.187-1.665 16.235 10.905c.923 11.079-5.601 12.732-5.601 7.213s5.178-11.663 10.613-9.455c6.044 2.455 3.98 17.044-.55 15.424-3.305-1.182-.106-9.393 4.63-11.685 6.551-3.17 12.139 4.752 4.934 15.81" />
          <path fill="#8ED462" d="M22.502 5.518a2.68 2.68 0 1 0 0-5.359 2.68 2.68 0 0 0 0 5.359" />
          <path stroke="url(#gradient-a)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.336" d="M12.988 21.127c1.764-.463 3.79-3.718 3.247-10.223a11 11 0 0 0-.218-1.46" opacity=".5" />
          <path stroke="#8ED462" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.336" d="M13.815 20.71c-1.525 1.148-3.18.188-3.18-2.593 0-5.68 5.177-11.663 10.612-9.455 6.044 2.455 3.98 17.044-.55 15.424-3.304-1.182-.106-9.393 4.63-11.685 6.552-3.17 12.14 4.752 4.934 15.81" />
          <path stroke="url(#gradient-b)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.336" d="M24.574 13.08c1.336 5.053-.641 12.164-3.877 11.006" opacity=".5" />
          <path stroke="#8ED462" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.336" d="M25.328 12.4c6.551-3.168 12.138 4.753 4.933 15.81" />
          <path stroke="#8ED462" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.336" d="M20.697 24.086c-3.305-1.182-.106-9.394 4.63-11.685 6.551-3.17 12.139 4.752 4.934 15.809" />
          <defs>
            <linearGradient id="gradient-a" x1="16.35" x2="15.661" y1="18.015" y2="10.005" gradientUnits="userSpaceOnUse">
              <stop stopColor="#8ED462" />
              <stop offset="1" stopColor="#368D32" />
            </linearGradient>
            <linearGradient id="gradient-b" x1="25.354" x2="24.614" y1="23.015" y2="13.372" gradientUnits="userSpaceOnUse">
              <stop stopColor="#8ED462" />
              <stop offset="1" stopColor="#368D32" />
            </linearGradient>
          </defs>
        </g>
      </svg>
      <svg width="127" height="19" viewBox="0 0 127.1 18.8" aria-hidden="true" focusable="false" className="text-[#1a1a1a] h-5 mt-1 transition-colors group-hover:text-black">
        <path fill="currentColor" d="M126.6 16.3c-.1 0-.2 0-.4.1h-.5c-.3 0-.5 0-.8-.1-.2-.1-.4-.3-.6-.5-.2-.3-.2-.6-.2-1.1V7.3h2.7V5.2h-2.7V2h-2.6v3.2h-2v2.1h2v7.9c0 .8.2 1.5.5 2 .4.5.8.9 1.4 1.2s1.2.4 1.9.4c.4 0 .8 0 1-.1.3-.1.5-.1.6-.2zm-7.5-4.6c0-1.2-.2-2.2-.5-3.1s-.8-1.5-1.3-2.1c-.6-.5-1.2-.9-1.9-1.2-.7-.2-1.4-.4-2.2-.4q-1.8 0-3.3.9c-.9.6-1.6 1.4-2.2 2.4-.5 1-.8 2.3-.8 3.6 0 1.4.3 2.6.8 3.6s1.2 1.8 2.2 2.4 2.1.8 3.4.8c1 0 1.8-.1 2.6-.4s1.4-.7 1.9-1.3c.5-.5.9-1.2 1.1-1.9l-2.5-.4c-.2.4-.4.8-.7 1.1s-.6.5-1.1.6c-.4.1-.9.2-1.4.2-.8 0-1.4-.2-2-.5s-1-.8-1.3-1.4-.4-1.3-.5-2.1h9.5v-.8zm-9.5-1c0-.6.2-1.1.4-1.6.3-.6.7-1 1.3-1.4.5-.4 1.2-.5 1.9-.5s1.3.2 1.8.5.9.7 1.2 1.3c.3.5.4 1.1.4 1.8h-7zm-2.7 7.4c-1.2-2.3-2.1-4.1-2.9-5.7l-.2-.5c-.2-.5-.4-.9-.6-1.3 1-1.4 1.8-3.4 2.5-5.8l.1-.2h-2.9v.1c-.4 1.3-.8 2.4-1.3 3.3-1.3-1.3-3-1.4-4.1-1.1-.4.1-.6.1-.9.2V.7H94v17.9h2.6v-5.3c.4.2.8.3 1.1.3.6.1 1.8.1 3.2-.8l.5.9c.6 1.2 1.4 2.7 2.4 4.7l.1.1h3.1zm-7.2-7.8c-.5.4-1.1.6-1.6.6-.5-.1-.8-.4-.8-.6 0-.5.4-.6.7-.7h.4c.3-.1.8 0 1.3.7m-14.6 8.3V5.2h2.5v2.1h.1c.3-.7.7-1.3 1.3-1.7.7-.4 1.4-.6 2.2-.6h1.1v2.5c-.1 0-.3-.1-.6-.1s-.5-.1-.8-.1c-.6 0-1.2.1-1.6.4-.5.3-.9.6-1.1 1.1-.3.5-.4 1-.4 1.6v8.2zM52.3.7h3.3l5.7 13.9h.2L67.2.7h3.3v17.8h-2.6V5.6h-.2l-5.3 12.9h-2.1L55 5.6h-.2v12.9h-2.6V.7zm-9.1 18.1c-1.1 0-2-.3-2.9-.8-.8-.6-1.5-1.4-2-2.4s-.7-2.3-.7-3.7.2-2.7.7-3.7 1.2-1.8 2-2.4c.9-.5 1.8-.8 2.9-.8.8 0 1.5.1 2 .4s.9.6 1.2 1 .5.7.7 1h.2V.7h2.6v17.8h-2.5v-2.1H47c-.2.3-.4.6-.7 1s-.7.7-1.2 1c-.4.3-1.1.4-1.9.4m.6-2.2c.7 0 1.4-.2 1.9-.6s.9-1 1.2-1.7.4-1.5.4-2.5c0-.9-.1-1.7-.4-2.4s-.7-1.2-1.2-1.6-1.2-.6-1.9-.6c-.8 0-1.4.2-2 .6-.5.4-.9 1-1.2 1.7s-.4 1.5-.4 2.4.1 1.7.4 2.4.7 1.3 1.2 1.7 1.2.6 2 .6m-16.2-6v7.9H25V5.2h2.5v2.2h.2c.3-.7.8-1.3 1.4-1.7.7-.5 1.5-.7 2.5-.7q1.35 0 2.4.6c.7.4 1.2.9 1.6 1.7.4.7.5 1.6.5 2.7v8.5h-2.6v-8.2c0-1-.3-1.7-.8-2.3s-1.2-.8-2.1-.8c-.6 0-1.1.1-1.6.4s-.8.6-1.1 1.2q-.3.75-.3 1.8m-7.3 8V5.2h2.6v13.4zm1.4-15.5c-.5 0-.8-.2-1.2-.5-.3-.3-.5-.6-.5-1s.2-.8.5-1.1.7-.5 1.2-.5.8.2 1.2.5c.3.3.5.7.5 1.1s-.2.8-.5 1.1c-.4.3-.8.4-1.2.4M0 .7h3.3L9 14.6h.2L14.9.7h3.3v17.8h-2.6V5.6h-.2l-5.3 12.9H8L2.7 5.6h-.1v12.9H0zm77.8 4.1c-2.7 0-4.9 1.6-5.4 3.9v.2H75v-.1c.4-1.2 1.3-1.8 2.8-1.8 1.8 0 3 1 3 2.7v1.4c-.7-.5-2.1-.9-3.4-.9-3.2 0-5.5 1.8-5.5 4.3s2.3 4.4 5.4 4.4c1.5 0 2.8-.5 3.6-1.1v.8h2.6v-9c-.2-3-2.3-4.8-5.7-4.8m2.9 9v1.3c-.4.9-1.7 1.5-3.1 1.5-1.5 0-3.2-.7-3.2-2.2s1.6-2.2 3.2-2.2c1.4.1 2.7.7 3.1 1.6" />
      </svg>
    </Link>
  );
}

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopMoreOpen, setIsDesktopMoreOpen] = useState(false);
  const [expandedMobileSection, setExpandedMobileSection] = useState<string | null>(null);
  const moreTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMoreEnter = () => {
    if (moreTimeoutRef.current) clearTimeout(moreTimeoutRef.current);
    setIsDesktopMoreOpen(true);
  };

  const handleMoreLeave = () => {
    moreTimeoutRef.current = setTimeout(() => {
      setIsDesktopMoreOpen(false);
    }, 200);
  };

  const toggleMobileSection = (section: string) => {
    setExpandedMobileSection(expandedMobileSection === section ? null : section);
  };

  const moreMenuOptions = [
    {
      title: "Sobre nosotros",
      image: "/images/1_1.png",
      href: "/sobre-nosotros"
    },
    {
      title: "Logros",
      image: "/images/1_2.png",
      href: "/logros"
    },
    {
      title: "Contáctanos",
      image: "/images/1_3.png",
      href: "/contactanos"
    }
  ];

  return (
    <header className="sticky top-4 z-50 w-full px-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex flex-col gap-2 max-w-7xl w-full">
        {/* TOP ROW */}
        <div className="flex items-center gap-4 w-full">

          <div className="flex-1 flex items-center justify-start gap-8 h-[64px] bg-white rounded-xl px-6 lg:px-8 relative min-w-0">
            <Logo />

            {/* DESKTOP NAV */}
            <nav className="hidden lg:flex items-center gap-2 h-full ml-auto">
              <Link
                href="/servicios"
                className="text-[13px] font-bold text-neutral-800 hover:bg-[#f2f0e9] px-4 py-1.5 rounded-full transition-colors duration-300 ease-in-out flex items-center"
              >
                Servicios
              </Link>

              {/* Metodología - Dropdown */}
              <div className="group flex items-center py-4 h-full">
                <button className="text-[13px] font-bold text-neutral-800 group-hover:bg-[#f2f0e9] px-4 py-1.5 rounded-full transition-colors duration-300 ease-in-out flex items-center gap-1.5">
                  Metodología
                  <ChevronDown className="w-4 h-4 transition-transform group-hover:-scale-y-100 text-neutral-400 group-hover:text-neutral-800" />
                </button>
                <div className="absolute top-[calc(100%+8px)] left-0 right-0 w-full opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top scale-95 group-hover:scale-100 z-[100]">
                  <div className="bg-white p-8 rounded-xl">
                    <div className="flex gap-8">
                      {/* Visual side */}
                      <Link
                        href="/metodologia"
                        className="w-1/3 relative h-64 rounded-xl overflow-hidden group/visual block"
                      >
                        <img
                          src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=500&q=80"
                          alt="Metodología"
                          className="object-cover w-full h-full transition-transform duration-500 group-hover/visual:scale-105"
                        />
                        <div className="absolute inset-x-0 bottom-0 p-6 flex items-center justify-between z-10">
                          <span className="text-white font-bold text-xl uppercase tracking-tight">
                            Metodología
                          </span>
                          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center transition-transform group-hover/visual:translate-x-1 shrink-0">
                            <ArrowRight className="w-5 h-5 text-black" />
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-black/40 group-hover/visual:bg-black/30 transition-colors duration-300" />
                      </Link>
                      {/* Links side */}
                      <div className="w-2/3 grid grid-cols-2 gap-y-4 gap-x-8">
                        {methodologyLinks.map((link, index) => (
                          <Link
                            key={link}
                            href={`/methodology/${link.toLowerCase().replace(/\s+/g, "-")}`}
                            className="text-[14px] text-neutral-600 hover:text-[#00c97b] transition-all duration-300 opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0"
                            style={{ transitionDelay: `${index * 30}ms` }}
                          >
                            {link}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comunidad y Soporte - Dropdown */}
              <div className="group flex items-center py-4 h-full">
                <button className="text-[13px] font-bold text-neutral-800 group-hover:bg-[#f2f0e9] px-4 py-1.5 rounded-full transition-colors duration-300 ease-in-out flex items-center gap-1.5">
                  Comunidad y Soporte
                  <ChevronDown className="w-4 h-4 transition-transform group-hover:-scale-y-100 text-neutral-400 group-hover:text-neutral-800" />
                </button>
                <div className="absolute top-[calc(100%+8px)] left-0 right-0 w-full opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top scale-95 group-hover:scale-100 z-[100]">
                  <div className="bg-white p-8 rounded-xl">
                    <div className="flex gap-8">
                      {/* Visual side */}
                      <Link
                        href="/comunidad"
                        className="w-1/3 relative h-64 rounded-xl overflow-hidden group/visual block"
                      >
                        <img
                          src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=500&q=80"
                          alt="Comunidad y Soporte"
                          className="object-cover w-full h-full transition-transform duration-500 group-hover/visual:scale-105"
                        />
                        <div className="absolute inset-x-0 bottom-0 p-6 flex items-center justify-between z-10">
                          <span className="text-white font-bold text-xl uppercase tracking-tight">
                            Comunidad
                          </span>
                          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center transition-transform group-hover/visual:translate-x-1 shrink-0">
                            <ArrowRight className="w-5 h-5 text-black" />
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-black/40 group-hover/visual:bg-black/30 transition-colors duration-300" />
                      </Link>
                      {/* Links side */}
                      <div className="w-2/3 grid grid-cols-2 gap-y-4 gap-x-8">
                        {industrySectorsLinks.map((link, index) => (
                          <Link
                            key={link}
                            href={`/sectors/${link.toLowerCase().replace(/\s+/g, "-")}`}
                            className="text-[14px] text-neutral-600 hover:text-[#00c97b] transition-all duration-300 opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0"
                            style={{ transitionDelay: `${index * 30}ms` }}
                          >
                            {link}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Precios - No Dropdown */}
              <Link
                href="/precios"
                className="text-[13px] font-bold text-neutral-800 hover:bg-[#f2f0e9] px-4 py-1.5 rounded-full transition-colors duration-300 ease-in-out flex items-center"
              >
                Precios
              </Link>

              {/* Desktop Burger Toggle */}
              <div
                className="flex items-center ml-2 h-full py-4 group/burger"
                onMouseEnter={handleMoreEnter}
                onMouseLeave={handleMoreLeave}
              >
                <button
                  className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-300 ${isDesktopMoreOpen ? 'bg-gray-200 text-black' : 'bg-[#8ED462] group-hover/burger:bg-gray-200 text-black'}`}
                >
                  <div className={`transition-transform duration-300 ${isDesktopMoreOpen ? '-rotate-180' : 'rotate-0'}`}>
                    {isDesktopMoreOpen ? <ChevronUp className="w-5 h-5" /> : (
                      <div className="flex flex-col gap-[3.5px] items-center">
                        <span className="h-[2px] w-[18px] bg-black rounded-full transition-all duration-300"></span>
                        <span className="h-[2px] w-[18px] bg-black rounded-full transition-all duration-300"></span>
                        <span className="h-[2px] w-[18px] bg-black rounded-full transition-all duration-300"></span>
                      </div>
                    )}
                  </div>
                </button>

                {/* DESKTOP MORE MENU DROPDOWN */}
                <div className={`absolute top-[calc(100%+8px)] left-0 w-full z-[110] transition-all duration-300 transform origin-top ${isDesktopMoreOpen ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-95'}`}>
                  <div className="w-full bg-white rounded-xl p-6 border border-black/5">
                    <div className="grid grid-cols-3 gap-6">
                      {moreMenuOptions.map((opt, index) => (
                        <Link
                          key={opt.title}
                          href={opt.href}
                          className="group relative aspect-[14/16] rounded-xl overflow-hidden block"
                        >
                          <img
                            src={opt.image}
                            alt={opt.title}
                            className={`object-cover w-full h-full transition-all duration-700 ease-out ${isDesktopMoreOpen ? 'scale-100' : 'scale-110'} group-hover:scale-110`}
                          />
                          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors duration-300" />
                          <div className="absolute inset-x-0 bottom-0 p-6 flex items-center justify-between z-10">
                            <span className="text-white text-xl font-bold uppercase tracking-tight">
                              {opt.title}
                            </span>
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center transition-transform group-hover:translate-x-1 shrink-0">
                              <ArrowRight className="w-5 h-5 text-black" />
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </nav>

            {/* MOBILE ACTIONS */}
            <div className="flex lg:hidden items-center gap-3 ml-auto">
              <Link
                href="/agenda"
                className="bg-[#f2f0e9] px-4 py-2 rounded-xl text-[15.5px] font-bold text-neutral-800 transition-colors hover:bg-[#e8e5dc] whitespace-nowrap"
              >
                ¡Agenda tu Clase!
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-[#8ED462] hover:bg-[#7bc050] transition-colors text-black"
              >
                <div className="relative w-5 h-5 flex items-center justify-center">
                  <span className={`absolute h-[2px] w-[18px] bg-black rounded-full transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-0' : '-translate-y-[5.5px]'}`}></span>
                  <span className={`absolute h-[2px] w-[18px] bg-black rounded-full transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                  <span className={`absolute h-[2px] w-[18px] bg-black rounded-full transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 translate-y-0' : 'translate-y-[5.5px]'}`}></span>
                </div>
              </button>
            </div>
          </div>

          <Link
            href="/agenda"
            className="hidden lg:flex group relative items-center gap-4 bg-white hover:bg-[#fbd400] transition-colors duration-300 rounded-xl h-[64px] pl-8 pr-2 shrink-0"
          >
            <span className="text-[13px] font-bold text-neutral-900 whitespace-nowrap group-hover:text-black">
              ¡Agenda tu Clase!
            </span>
            <div className="w-12 h-12 rounded-full bg-[#1e48f6] text-white flex items-center justify-center transition-transform group-hover:scale-105 shrink-0">
              <MessageCircle className="w-6 h-6 fill-current" />
            </div>
          </Link>
        </div>



        {/* MOBILE DROPDOWN MENU */}
        {isMobileMenuOpen && (
          <div className="lg:hidden flex flex-col gap-2 relative z-[100]">
            <div className="bg-white rounded-xl px-6 py-2 flex flex-col">
              <Link href="/servicios" className="text-[18px] text-neutral-800 py-4 border-b border-black/5">Servicios</Link>

              <button onClick={() => toggleMobileSection('methodology')} className="flex items-center justify-between text-[18px] text-neutral-800 py-4 border-b border-black/5 w-full text-left">
                Metodología
                <ChevronDown className={`w-5 h-5 transition-transform ${expandedMobileSection === 'methodology' ? 'scale-y-100 rotate-180' : ''}`} />
              </button>
              {expandedMobileSection === 'methodology' && (
                <div className="flex flex-col gap-3 pl-4 py-3">
                  {methodologyLinks.map(link => (
                    <Link key={link} href="#" className="text-neutral-500 text-[15px]">{link}</Link>
                  ))}
                </div>
              )}

              <button onClick={() => toggleMobileSection('sectors')} className="flex items-center justify-between text-[18px] text-neutral-800 py-4 border-b border-black/5 w-full text-left">
                Comunidad y Soporte
                <ChevronDown className={`w-5 h-5 transition-transform ${expandedMobileSection === 'sectors' ? 'scale-y-100 rotate-180' : ''}`} />
              </button>
              {expandedMobileSection === 'sectors' && (
                <div className="flex flex-col gap-3 pl-4 py-3">
                  {industrySectorsLinks.map(link => (
                    <Link key={link} href="#" className="text-neutral-500 text-[15px]">{link}</Link>
                  ))}
                </div>
              )}

              <Link href="/precios" className="text-[18px] text-neutral-800 py-4 border-b border-black/5">Precios</Link>
              <Link href="/sobre-nosotros" className="text-[18px] text-neutral-800 py-4 border-b border-black/5">Sobre nosotros</Link>
              <Link href="/logros" className="text-[18px] text-neutral-800 py-4">Logros</Link>
            </div>

            <Link href="/contactanos" className="bg-white rounded-2xl p-4 px-6 flex items-center justify-between group hover:bg-[#fbd400] transition-colors duration-300">
              <span className="text-[20px] text-neutral-800 group-hover:text-black">Contáctanos</span>
              <div className="w-10 h-10 rounded-full bg-[#1e48f6] text-white flex items-center justify-center transition-transform group-hover:scale-105 shrink-0">
                <MessageCircle className="w-5 h-5 fill-current" />
              </div>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
