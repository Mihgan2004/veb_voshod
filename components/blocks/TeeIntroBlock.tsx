'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const TeeIntroBlock: React.FC = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [p, setP] = useState(0);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    let raf = 0;

    const calc = () => {
      const vh = window.innerHeight;
      const start = el.getBoundingClientRect().top + window.scrollY;
      const end = start + el.offsetHeight - vh;
      const y = window.scrollY;
      const t = (y - start) / Math.max(1, end - start);
      setP(clamp01(t));
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(calc);
    };

    calc();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const inTee = smoothstep(0.08, 0.28, p);
  const inText = smoothstep(0.12, 0.34, p);
  const out = smoothstep(0.78, 0.98, p);

  const teeX = lerp(-80, 0, inTee) + lerp(0, -20, out);
  const teeOpacity = lerp(0, 1, inTee) * lerp(1, 0.35, out);

  const textX = lerp(80, 0, inText) + lerp(0, 20, out);
  const textOpacity = lerp(0, 1, inText) * lerp(1, 0.35, out);

  return (
    <section
      ref={sectionRef}
      className="relative w-full border-t border-white/5"
      style={{ height: '220vh' }}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[#0B0D10]" />
          <div
            className="absolute inset-0 opacity-[0.22]"
            style={{
              backgroundImage:
                'repeating-linear-gradient(135deg, rgba(255,255,255,0.035) 0px, rgba(255,255,255,0.035) 38px, rgba(0,0,0,0.0) 38px, rgba(0,0,0,0.0) 76px)',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/35" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,rgba(0,0,0,0.78)_78%)]" />
          <div className="absolute inset-0 opacity-[0.06] mix-blend-overlay bg-noise" />
        </div>

        <div className="relative z-10 h-full max-w-7xl mx-auto px-6">
          <div className="h-full grid grid-cols-12 items-center gap-8">
            <div className="col-span-12 md:col-span-4 relative min-h-screen">
              <div
                className="absolute inset-0 flex items-center justify-start"
                style={{
                  opacity: teeOpacity,
                  transform: `translateX(${teeX}px)`,
                  willChange: 'transform, opacity',
                }}
              >
                <img
                  src="/assets/tee/tee-cutout.png"
                  alt="VOSKHOD tee"
                  className="absolute left-[-65vw] md:left-[-80vw] top-1/2 -translate-y-1/2 h-[140vh] md:h-[200vh] w-auto max-w-none pointer-events-none select-none drop-shadow-[0_50px_90px_rgba(0,0,0,0.65)]"
                  draggable={false}
                />
              </div>
            </div>

            <div className="col-span-12 md:col-span-8">
              <div
                style={{
                  opacity: textOpacity,
                  transform: `translateX(${textX}px)`,
                  willChange: 'transform, opacity',
                }}
              >
                <div className="text-[10px] md:text-xs font-mono tracking-widest text-white/40 mb-3">
                  {'// PROJECT VOSKHOD / DROP'}
                </div>

                <h2 className="text-3xl md:text-5xl font-light tracking-wide">
                  КОНЦЕРН <span className="text-gold">ВОСХОД</span>
                </h2>

                <p className="mt-5 max-w-2xl text-sm md:text-base text-white/55 leading-relaxed">
                  Премиальный тактический мерч и визуальная система бренда. Лимитированные дропы, строгие формы,
                  “бетон/графит” и контроль качества: паспорт, партия, проверка.
                </p>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                  <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-4">
                    <div className="text-[10px] font-mono text-white/35">CODE</div>
                    <div className="mt-1 text-xs font-mono text-white/65">VSHD-TEE</div>
                    <div className="mt-3 text-[10px] font-mono text-white/35">STATUS</div>
                    <div className="mt-1 text-xs font-mono text-white/65">IN STOCK</div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-4">
                    <div className="text-[10px] font-mono text-white/35">MATERIAL</div>
                    <div className="mt-1 text-xs font-mono text-white/65">GRAPHITE</div>
                    <div className="mt-3 text-[10px] font-mono text-white/35">TAG</div>
                    <div className="mt-1 text-xs font-mono text-white/65">LIMITED DROP</div>
                  </div>
                </div>

                <div className="mt-8">
                  <Link
                    href="/catalog"
                    className="inline-flex items-center justify-center h-12 md:h-14 px-8 md:px-10 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-[11px] md:text-xs uppercase tracking-[0.22em] text-[#F5F5F5] transition-all duration-300 hover:border-[#C6902E]/35 hover:bg-white/10"
                  >
                    СМОТРЕТЬ КАТАЛОГ →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute left-0 right-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-black/30" />
        </div>
      </div>
    </section>
  );
};
