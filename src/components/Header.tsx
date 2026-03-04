"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();

  const handleLogoClick = (e: React.MouseEvent) => {
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  return (
    <Link
      href="/"
      onClick={handleLogoClick}
      className="flex items-center gap-2 group shrink-0 min-w-max"
    >
      <span className="sr-only">LudoraLearning Home</span>
      <svg
        viewBox="0 0 184.08 72.96"
        width="184"
        height="73"
        className="h-9 md:h-11 w-auto fill-[#632eaf] transition-colors duration-300 group-hover:fill-[#2EE58D] shrink-0"
        aria-hidden="true"
        focusable="false"
        preserveAspectRatio="xMidYMid meet"
      >
        <g>
          <path d="M172.51,0H11.57C5.18,0,0,5.18,0,11.57v27.75c0,6.39,5.18,11.57,11.57,11.57l146.64,.96c1.83,.01,3.32-1.47,3.32-3.3h0c0-1.82-1.48-3.3-3.3-3.3l-146.66,.04c-3.29,0-5.96-2.67-5.96-5.96V11.57c0-3.29,2.67-5.96,5.96-5.96H172.51c3.29,0,5.96,2.67,5.96,5.96V45.09c0,5.04-1.93,5.48-4.22,6.28-4.53,1.58-4.99,3.68-5.29,4.22-2.07,3.95-.07,11.69,7.67,17.37-2.88-4.78-3.61-8.74-3.83-11.03-.18-1.95,.01-2.77,.4-3.43,1.47-2.55,5.03-1.66,7.76-3.81,1.33-1.05,2.82-3.09,3.12-7.52V11.57c0-6.39-5.18-11.57-11.57-11.57Z" />
          <g>
            <path d="M137.88,26.91h-3.93v-1.15s6.73-.36,6.73-5.41v-1.81s-.13-5.94-6.96-5.94h-14.76v25.87h6.2v-9.2h9.84v9.2h6.12v-8.3c0-.82-.31-1.58-.81-2.15-.6-.67-1.47-1.1-2.44-1.1Zm-12.92-3.08v-6.25h7.85c2.03,0,2.16,1.99,2.16,1.99v1.7c0,2.39-2.59,2.56-2.59,2.56h-7.41Z" />
            <path d="M164.21,38.46h6.47l-9.49-26h-9.04l-9.13,26h6.47l2.15-6.85h10.38l2.18,6.85Zm-11.06-11.64l2.9-9.22h1.51l2.94,9.22h-7.35Z" />
          </g>
          <g>
            <path d="M76.18,11.88h-12.33v25.86h12.33c6.19,0,11.2-5.02,11.2-11.2v-3.46c0-6.19-5.02-11.2-11.2-11.2Zm5.6,14.66c0,3.09-2.51,5.6-5.6,5.6h-6.73v-14.65h6.73c3.09,0,5.6,2.51,5.6,5.6v3.46Z" />
            <path d="M104.37,11.88h-3.16c-6.28,0-11.37,5.09-11.37,11.37v3.12c0,6.28,5.09,11.37,11.37,11.37h3.16c6.19,0,11.2-5.02,11.2-11.2v-3.46c0-6.19-5.02-11.2-11.2-11.2Zm5.6,14.66c0,3.09-2.51,5.6-5.6,5.6h-3.16c-3.18,0-5.76-2.58-5.76-5.76v-3.12c0-3.18,2.58-5.76,5.76-5.76h3.16c3.09,0,5.6,2.51,5.6,5.6v3.46Z" />
          </g>
          <g>
            <path d="M20.94,12.11h-5.61v23.36c0,1.55,1.26,2.81,2.81,2.81h15.17v-5.61h-12.38V12.11Z" />
            <path d="M54.67,12.11v15.51c0,3.08-2.51,5.59-5.6,5.59h-1.69c-3.18,0-5.77-2.58-5.77-5.76V12.11h-5.61v15.34c0,6.28,5.09,11.37,11.37,11.37h1.69c6.19,0,11.2-5.02,11.2-11.2V12.11h-5.61Z" />
          </g>
        </g>
        <g>
          <path d="M16.02,65.8v-7.2h1.03v6.31h3.9v.9h-4.93Z" />
          <path d="M35.09,64.91h4.2v.9h-5.23v-7.2h5.08v.9h-4.05v5.41Zm-.09-3.2h3.7v.88h-3.7v-.88Z" />
          <path d="M51.8,65.8l3.26-7.2h1.02l3.27,7.2h-1.08l-2.91-6.63h.41l-2.91,6.63h-1.06Zm1.39-1.8l.28-.82h4.05l.3,.82h-4.63Z" />
          <path d="M72.36,65.8v-7.2h2.81c.63,0,1.17,.1,1.62,.3,.45,.2,.79,.49,1.03,.86s.36,.83,.36,1.35-.12,.97-.36,1.34-.58,.66-1.03,.86c-.45,.2-.98,.3-1.62,.3h-2.24l.46-.47v2.67h-1.03Zm1.03-2.56l-.46-.5h2.21c.66,0,1.16-.14,1.5-.43,.34-.29,.51-.68,.51-1.2s-.17-.91-.51-1.19c-.34-.28-.84-.42-1.5-.42h-2.21l.46-.51v4.26Zm3.79,2.56l-1.83-2.61h1.1l1.85,2.61h-1.12Z" />
          <path d="M91.78,65.8v-7.2h.84l4.76,5.92h-.44v-5.92h1.03v7.2h-.84l-4.76-5.92h.44v5.92h-1.03Z" />
          <path d="M112.07,65.8v-7.2h1.03v7.2h-1.03Z" />
          <path d="M127.2,65.8v-7.2h.84l4.76,5.92h-.44v-5.92h1.03v7.2h-.84l-4.76-5.92h.44v5.92h-1.03Z" />
          <path d="M150.74,65.88c-.56,0-1.07-.09-1.53-.27s-.87-.44-1.21-.77c-.34-.33-.61-.72-.8-1.17-.19-.45-.29-.94-.29-1.47s.1-1.03,.29-1.47c.19-.45,.46-.83,.81-1.17,.35-.33,.75-.59,1.22-.77,.47-.18,.98-.27,1.54-.27s1.09,.09,1.56,.28c.47,.19,.87,.46,1.2,.83l-.64,.64c-.29-.29-.62-.5-.96-.63s-.72-.2-1.13-.2-.79,.07-1.15,.21c-.35,.14-.66,.33-.92,.58-.26,.25-.46,.54-.6,.88-.14,.34-.21,.71-.21,1.11s.07,.76,.21,1.1c.14,.34,.34,.63,.6,.88,.26,.25,.56,.44,.91,.58,.35,.14,.73,.21,1.14,.21,.38,0,.75-.06,1.11-.18,.35-.12,.68-.32,.98-.6l.59,.78c-.36,.3-.77,.53-1.25,.68s-.97,.23-1.48,.23Zm1.74-1.05v-2.68h.99v2.81l-.99-.13Z" />
        </g>
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
      title: "Nuestros Jugadores",
      image: "/images/photogallery/3Cuadrada.png",
      href: "/logros"
    },
    {
      title: "Contáctanos",
      image: "/images/1_3.png",
      href: "/contactanos"
    }
  ];

  return (
    <header className="fixed top-4 z-50 w-full px-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex flex-col gap-2 max-w-7xl w-full">
        {/* TOP ROW */}
        <div className="flex items-center gap-4 w-full">

          <div className="flex-1 flex items-center justify-start gap-8 h-[64px] bg-white rounded-xl pl-4 pr-6 lg:pl-5 lg:pr-8 relative min-w-0">
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
                <Link href="/metodologia" className="text-[13px] font-bold text-neutral-800 group-hover:bg-[#f2f0e9] px-4 py-1.5 rounded-full transition-colors duration-300 ease-in-out flex items-center gap-1.5">
                  Metodología
                  <ChevronDown className="w-4 h-4 transition-transform group-hover:-scale-y-100 text-neutral-400 group-hover:text-neutral-800" />
                </Link>
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
                <Link href="/comunidad" className="text-[13px] font-bold text-neutral-800 group-hover:bg-[#f2f0e9] px-4 py-1.5 rounded-full transition-colors duration-300 ease-in-out flex items-center gap-1.5">
                  Comunidad y Soporte
                  <ChevronDown className="w-4 h-4 transition-transform group-hover:-scale-y-100 text-neutral-400 group-hover:text-neutral-800" />
                </Link>
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
                  className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-300 ${isDesktopMoreOpen ? 'bg-gray-200 text-black' : 'bg-[#632eaf] group-hover/burger:bg-gray-200 text-black'}`}
                >
                  <div className={`transition-transform duration-300 ${isDesktopMoreOpen ? '-rotate-180' : 'rotate-0'}`}>
                    {isDesktopMoreOpen ? <ChevronUp className="w-5 h-5" /> : (
                      <div className="flex flex-col gap-[3.5px] items-center">
                        <span className="h-[2px] w-[18px] bg-white rounded-full transition-all duration-300"></span>
                        <span className="h-[2px] w-[18px] bg-white rounded-full transition-all duration-300"></span>
                        <span className="h-[2px] w-[18px] bg-white rounded-full transition-all duration-300"></span>
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
                ¡hi!
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
            <div className="w-12 h-12 rounded-full bg-[#88e04f] text-white flex items-center justify-center transition-transform group-hover:scale-105 shrink-0">
              <MessageCircle className="w-6 h-6 fill-current" />
            </div>
          </Link>
        </div>



        {/* MOBILE DROPDOWN MENU */}
        {isMobileMenuOpen && (
          <div className="lg:hidden flex flex-col gap-2 relative z-[100]">
            <div className="bg-white rounded-xl px-6 py-2 flex flex-col">
              <Link href="/servicios" className="text-[18px] text-neutral-800 py-4 border-b border-black/5">Servicios</Link>

              <div className="flex items-center justify-between border-b border-black/5 w-full py-4 relative z-10">
                <Link href="/metodologia" className="text-[18px] text-neutral-800 flex-1 text-left" onClick={() => setIsMobileMenuOpen(false)}>
                  Metodología
                </Link>
                <button onClick={() => toggleMobileSection('methodology')} className="pl-4">
                  <ChevronDown className={`w-5 h-5 transition-transform ${expandedMobileSection === 'methodology' ? 'scale-y-100 rotate-180' : ''}`} />
                </button>
              </div>
              {expandedMobileSection === 'methodology' && (
                <div className="flex flex-col gap-3 pl-4 py-3">
                  {methodologyLinks.map(link => (
                    <Link key={link} href="#" className="text-neutral-500 text-[15px]">{link}</Link>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between border-b border-black/5 w-full py-4 relative z-10">
                <Link href="/comunidad" className="text-[18px] text-neutral-800 flex-1 text-left" onClick={() => setIsMobileMenuOpen(false)}>
                  Comunidad y Soporte
                </Link>
                <button onClick={() => toggleMobileSection('sectors')} className="pl-4">
                  <ChevronDown className={`w-5 h-5 transition-transform ${expandedMobileSection === 'sectors' ? 'scale-y-100 rotate-180' : ''}`} />
                </button>
              </div>
              {expandedMobileSection === 'sectors' && (
                <div className="flex flex-col gap-3 pl-4 py-3">
                  {industrySectorsLinks.map(link => (
                    <Link key={link} href="#" className="text-neutral-500 text-[15px]">{link}</Link>
                  ))}
                </div>
              )}

              <Link href="/precios" className="text-[18px] text-neutral-800 py-4 border-b border-black/5">Precios</Link>
              <Link href="/sobre-nosotros" className="text-[18px] text-neutral-800 py-4 border-b border-black/5">Sobre nosotros</Link>
              <Link href="/logros" className="text-[18px] text-neutral-800 py-4">Nuestros Jugadores</Link>
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
