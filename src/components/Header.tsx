"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";



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
        className="h-9 md:h-11 w-auto fill-[#632eaf] transition-colors duration-300 group-hover:fill-[#632eaf] shrink-0"
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
  const pathname = usePathname();

  // Hide header for dashboard and inner portal-alumno pages, but KEEP it for login and register
  if (
    pathname.startsWith("/portal-alumno") &&
    pathname !== "/portal-alumno" &&
    pathname !== "/portal-alumno/registro"
  ) {
    return null;
  }

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
                className={`text-[13px] font-bold text-neutral-800 hover:bg-[#f2f0e9] px-4 py-1.5 rounded-full transition-colors duration-300 ease-in-out flex items-center ${pathname === "/servicios" ? "bg-[#f2f0e9]" : ""}`}
              >
                Servicios
              </Link>

              <Link
                href="/Estrategia"
                className={`text-[13px] font-bold text-neutral-800 hover:bg-[#f2f0e9] px-4 py-1.5 rounded-full transition-colors duration-300 ease-in-out flex items-center ${pathname === "/Estrategia" ? "bg-[#f2f0e9]" : ""}`}
              >
                Estrategia
              </Link>

              <Link
                href="/comunidad"
                className={`text-[13px] font-bold text-neutral-800 hover:bg-[#f2f0e9] px-4 py-1.5 rounded-full transition-colors duration-300 ease-in-out flex items-center ${pathname === "/comunidad" ? "bg-[#f2f0e9]" : ""}`}
              >
                Comunidad
              </Link>

              <Link
                href="/sobre-nosotros"
                className={`text-[13px] font-bold text-neutral-800 hover:bg-[#f2f0e9] px-4 py-1.5 rounded-full transition-colors duration-300 ease-in-out flex items-center ${pathname === "/sobre-nosotros" ? "bg-[#f2f0e9]" : ""}`}
              >
                Sobre nosotros
              </Link>

              <Link
                href="/portal-alumno"
                className="text-[13px] font-bold text-white bg-[#632eaf] hover:bg-[#522591] px-4 py-1.5 rounded-full transition-colors duration-300 ease-in-out flex items-center ml-1"
              >
                Portal de Alumno
              </Link>

            </nav>

            {/* MOBILE ACTIONS */}
            <div className="flex lg:hidden items-center gap-3 ml-auto">
              <Link
                href="/contacto"
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
            href="/contacto"
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
              <Link href="/servicios" className="text-[18px] text-neutral-800 py-4 border-b border-black/5" onClick={() => setIsMobileMenuOpen(false)}>
                Servicios
              </Link>

              <Link href="/Estrategia" className="text-[18px] text-neutral-800 py-4 border-b border-black/5" onClick={() => setIsMobileMenuOpen(false)}>
                Estrategia
              </Link>

              <Link href="/comunidad" className="text-[18px] text-neutral-800 py-4 border-b border-black/5" onClick={() => setIsMobileMenuOpen(false)}>
                Comunidad
              </Link>

              <Link href="/sobre-nosotros" className="text-[18px] text-neutral-800 py-4 border-b border-black/5" onClick={() => setIsMobileMenuOpen(false)}>
                Sobre nosotros
              </Link>

              <Link href="/portal-alumno" className="text-[18px] text-[#632eaf] font-bold py-4" onClick={() => setIsMobileMenuOpen(false)}>Portal de Alumno</Link>
            </div>

            <Link href="/contacto" className="bg-white rounded-2xl p-4 px-6 flex items-center justify-between group hover:bg-[#fbd400] transition-colors duration-300">
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
