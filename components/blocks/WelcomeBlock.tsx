'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';

export const WelcomeBlock: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const t = Math.min(1, Math.max(0, 1 - rect.top / vh));
      el.style.setProperty('--reveal', String(t));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTee = () => {
    const el = document.getElementById('tee-intro');
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section ref={sectionRef} className="relative max-w-7xl mx-auto px-4 sm:px-6 mt-10 sm:mt-16">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-graphite-light/60 backdrop-blur-md">
        <div className="absolute inset-0 bg-noise opacity-40 pointer-events-none" />

        <div className="relative p-6 sm:p-10 lg:p-14">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start lg:items-center">
            <div className="flex-1">
              <div className="text-[10px] font-mono tracking-[0.35em] text-gray-500 uppercase">
                PROJECT / VOSKHOD
              </div>

              <h2 className="mt-4 text-2xl sm:text-4xl lg:text-5xl font-light leading-tight">
                Мы не кричим — <span className="text-gold">мы делаем</span>.
              </h2>

              <p className="mt-4 sm:mt-6 text-sm sm:text-base text-gray-400 leading-relaxed max-w-xl">
                Премиальный мерч-экосистемный проект. Точная форма, тёмная графитовая база,
                ограниченные дропы. Без шума. Только сигнал.
              </p>

              <div className="mt-6 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link
                  href="/catalog"
                  className="inline-flex items-center justify-center px-5 py-3 rounded-full border border-gold/40 bg-gold/10 text-gold text-xs sm:text-sm uppercase tracking-widest hover:bg-gold/15 transition-colors"
                >
                  В каталог
                </Link>

                <button
                  onClick={scrollToTee}
                  className="inline-flex items-center justify-center px-5 py-3 rounded-full border border-white/10 bg-white/5 text-gray-200 text-xs sm:text-sm uppercase tracking-widest hover:bg-white/10 transition-colors"
                >
                  Про проект
                </button>
              </div>
            </div>

            <div className="w-full lg:w-[420px]">
              <div className="rounded-2xl border border-white/10 bg-black/30 p-5 sm:p-6">
                <div className="text-[10px] font-mono text-gray-500 tracking-[0.3em] uppercase">
                  status
                </div>
                <div className="mt-3 text-sm text-gray-300 leading-relaxed">
                  DROP PREP / CONTENT ONLINE / STOCK CONTROL / SHIPPING READY
                </div>
                <div className="mt-6 h-px bg-white/10" />
                <div className="mt-4 text-[10px] font-mono text-gray-500 tracking-widest">
                  ALL SYSTEMS NOMINAL.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className="absolute inset-x-0 bottom-0 h-24 sm:h-28 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gold/10 to-transparent"
          style={{ opacity: 'calc(var(--reveal, 0) * 1)' }}
        />
      </div>
    </section>
  );
};
