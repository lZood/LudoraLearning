'use client';

import { useEffect, useState, useRef } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Bookmark } from 'lucide-react';
import { iconFromName } from '@/lib/unitIcons';
import Link from 'next/link';

const BRAND_COLOR = '#632EB0';

// Datos provenientes de BD (la página server los arma desde levels/units/user_progress).
export type MapUnit = { id: string; title: string; icon: string | null; progress: number; isNew?: boolean };
export type MapLevel = { id: string; title: string; subtitle: string; units: MapUnit[] };

export default function CourseMap({ levels }: { levels: MapLevel[] }) {
  const [activeLevelId, setActiveLevelId] = useState<string>(levels[0]?.id ?? '');

  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const initObserver = () => {
      if (observerRef.current) observerRef.current.disconnect();

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const levelId = entry.target.id.replace('level-section-', '');
              setActiveLevelId(levelId);
              const tabEl = document.getElementById(`tab-${levelId}`);
              if (tabEl) tabEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
          });
        },
        { rootMargin: '-180px 0px -81% 0px', threshold: 0 }
      );

      levels.forEach((level) => {
        const el = document.getElementById(`level-section-${level.id}`);
        if (el) observer.observe(el);
      });

      observerRef.current = observer;
    };

    if (window.innerWidth <= 1024) initObserver();

    const handleResize = () => {
      if (window.innerWidth <= 1024) {
        if (!observerRef.current) initObserver();
      } else if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [levels]);

  const scrollToLevel = (id: string) => {
    setActiveLevelId(id);
    const el = document.getElementById(`level-section-${id}`);
    if (el) {
      const yOffset = -120;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  if (levels.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500 font-medium">
        Aún no hay cursos disponibles. Vuelve pronto.
      </div>
    );
  }

  return (
    <>
      {/* Mobile Top Levels Navigation/Tracker */}
      <div className="lg:hidden sticky top-[52px] z-40 bg-white/95 backdrop-blur-xl border-b border-gray-100 pt-1 pb-2 px-4 shadow-sm w-full mx-auto">
        <div className="flex overflow-x-auto gap-4 snap-x pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {levels.map((level, idx) => {
            const Icon = iconFromName(level.units[0]?.icon);
            const isActive = activeLevelId === level.id;
            return (
              <div key={level.id} id={`tab-${level.id}`} className="snap-center shrink-0 flex flex-col items-center gap-2">
                <button
                  onClick={() => scrollToLevel(level.id)}
                  className={`flex items-center justify-center w-[76px] h-[76px] rounded-[1.2rem] transition-all relative outline-none ${
                    isActive
                      ? 'border-[3px] border-[#632EB0] bg-purple-50 shadow-sm opacity-100 scale-100'
                      : 'border-2 border-transparent bg-gray-50 hover:bg-gray-100 opacity-70 scale-95'
                  }`}
                >
                  {isActive && <div className="absolute -bottom-[2px] w-6 h-1.5 bg-[#632EB0] rounded-t-full"></div>}
                  <Icon className={`w-10 h-10 ${isActive ? 'text-[#632EB0]' : 'text-gray-400'}`} strokeWidth={isActive ? 2 : 1.5} />
                </button>
                <span className={`text-[12px] font-extrabold tracking-wide ${isActive ? 'text-[#632EB0]' : 'text-gray-500'}`}>
                  Nivel {idx + 1}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-12 lg:gap-20 py-4 md:py-8 w-full overflow-x-hidden">
        {levels.map((level, idx) => (
          <div key={level.id} id={`level-section-${level.id}`}>
            <LevelSection level={level} index={idx} total={levels.length} />
          </div>
        ))}
      </div>
    </>
  );
}

function LevelSection({ level, index, total }: { level: MapLevel; index: number; total: number }) {
  const Icon = iconFromName(level.units[0]?.icon);

  return (
    <section className="relative flex flex-col gap-8 md:gap-10">
      {/* ----------------- MOBILE / TABLET VIEW (lg:hidden) ----------------- */}
      <div className="flex flex-col lg:hidden px-4 md:px-8">
        <div className="flex justify-between items-start mb-6">
          <div className="flex flex-col pt-2">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 leading-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
              {level.title}
            </h2>
            <p className="text-[#6b7280] text-[15px] md:text-[17px] font-medium leading-snug mt-2 max-w-[240px] md:max-w-[300px]">
              {level.subtitle}
            </p>
          </div>
          <div className="w-[80px] h-[80px] md:w-[100px] md:h-[100px] shrink-0 opacity-90 flex items-center justify-center translate-y-2">
            <Icon className="w-[60px] h-[60px] md:w-[80px] md:h-[80px] text-[#632EB0]" strokeWidth={1.5} />
          </div>
        </div>

        <div className="flex flex-col items-center relative w-full pt-4">
          <div className="absolute top-[20px] bottom-[20px] left-1/2 -ml-[1px] w-[2px] bg-gray-200/80 z-0"></div>
          <div className="flex flex-col w-full gap-5 z-10">
            {level.units.map((unit) => (
              <MobileUnitCard key={unit.id} unit={unit} />
            ))}
          </div>
        </div>
      </div>

      {/* ----------------- DESKTOP VIEW (hidden lg:flex) ----------------- */}
      <div className="hidden lg:flex flex-col gap-10">
        <div className="px-4 md:px-0 flex items-center gap-6 animate-in fade-in slide-in-from-left-4 duration-500">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 shrink-0">
            <Icon className="w-10 h-10 text-[#632EB0]" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 tracking-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
              {level.title}
            </h2>
            <p className="text-sm md:text-base text-gray-500 font-medium tracking-wide">
              {level.subtitle}
            </p>
          </div>
        </div>

        <div className="bg-[#f8f8f8] rounded-[3rem] p-4 md:p-8 shadow-sm border border-gray-50 relative overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-700">
          <Carousel opts={{ align: "start", dragFree: true }} className="w-full relative z-10">
            <CarouselContent className="-ml-4 relative">
              {level.units.map((unit, uIdx) => (
                <CarouselItem key={unit.id} className="pl-4 basis-auto relative">
                  <div
                    className="absolute top-[80px] h-[2px] bg-[#e5e5e5] z-0"
                    style={{ left: uIdx === 0 ? '50%' : '0', right: uIdx === level.units.length - 1 ? '50%' : '0' }}
                  />
                  <UnitCard unit={unit} />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>

      {index < total - 1 && (
        <div className="h-px bg-gray-100/60 w-full mt-6 md:mt-12 hidden lg:block"></div>
      )}
    </section>
  );
}

function MobileUnitCard({ unit }: { unit: MapUnit }) {
  const Icon = iconFromName(unit.icon);
  const started = unit.progress > 0;

  return (
    <Link
      href={`/portal-alumno/dashboard/unidad/${unit.id}`}
      className="w-full bg-white border-2 border-[#e5e5e5] border-b-[6px] rounded-[1.8rem] flex justify-between items-center p-6 md:p-8 relative z-10 active:border-b-2 active:translate-y-1 transition-all shadow-sm"
    >
      <div className="shrink-0 flex items-center justify-center w-[60px] h-[60px] md:w-[80px] md:h-[80px] ">
        <Icon className={`w-14 h-14 md:w-20 md:h-20 ${started ? 'text-[#632EB0]' : 'text-[#a3a3a3]'}`} strokeWidth={started ? 2 : 1.5} />
      </div>

      <div className="flex flex-col flex-1 gap-2 pl-6 md:pl-10">
        <h4 className="text-[17px] md:text-[20px] font-bold text-gray-800 leading-snug" style={{ fontFamily: 'Inter, sans-serif' }}>
          {unit.title}
        </h4>
        {started && (
          <div className="h-[4px] w-[140px] md:w-[180px] rounded-full bg-gray-100 overflow-hidden mt-1">
            <div className="h-full rounded-full bg-[#21C55D]" style={{ width: `${unit.progress}%` }} />
          </div>
        )}
      </div>

      {unit.isNew && (
        <div className="absolute -top-3 right-6 bg-[#21C55D] px-3 py-1 rounded-full shadow-sm border-[3px] border-white">
          <span className="text-[10px] md:text-[12px] font-black text-white tracking-wider">NEW</span>
        </div>
      )}
      {unit.progress === 100 && (
        <div className="absolute top-4 right-4 md:top-6 md:right-6 bg-purple-50 p-1.5 md:p-2 rounded-full">
          <Bookmark className="w-4 h-4 md:w-5 md:h-5 fill-[#632EB0] text-[#632EB0]" />
        </div>
      )}
    </Link>
  );
}

function UnitCard({ unit }: { unit: MapUnit }) {
  const Icon = iconFromName(unit.icon);
  const started = unit.progress > 0;

  return (
    <div className="flex flex-col items-center gap-5 py-2 relative z-10">
      <Link
        href={`/portal-alumno/dashboard/unidad/${unit.id}`}
        className="w-44 h-44 group bg-white border-2 border-[#e5e5e5] border-b-8 border-b-[#e5e5e5] rounded-[2.5rem] p-8 hover:border-[#632EB0] hover:border-b-[#632EB0] hover:shadow-2xl hover:shadow-[#632EB0]/10 transition-all duration-300 flex flex-col items-center justify-center relative active:scale-95 active:border-b-2 active:translate-y-1 overflow-hidden"
      >
        {unit.isNew && (
          <div className="absolute top-4 right-4 bg-[#21C55D] px-3 py-1 rounded-full shadow-sm z-20">
            <span className="text-[10px] font-black text-white tracking-wider">NEW</span>
          </div>
        )}

        <Icon className={`w-16 h-16 transition-transform duration-500 group-hover:scale-125 ${started ? 'text-[#632EB0]' : 'text-gray-300'}`} />

        {unit.progress === 100 && (
          <div className="absolute top-4 left-4 bg-purple-50 p-1 rounded-full">
            <Bookmark className="w-4 h-4 fill-[#632EB0] text-[#632EB0]" />
          </div>
        )}

        {started && (
          <div className="absolute bottom-6 left-6 right-6 h-1.5 bg-gray-50 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${unit.progress}%`, backgroundColor: BRAND_COLOR }}></div>
          </div>
        )}
      </Link>

      <h4 className="font-bold text-gray-700 text-sm text-center max-w-[160px] line-clamp-2 min-h-[2.5rem] px-2 leading-tight">
        {unit.title}
      </h4>
    </div>
  );
}
