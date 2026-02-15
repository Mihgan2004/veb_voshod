'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ASSETS } from '@/lib/assets';
import { useHomeScrollCompact } from '@/components/home/HomeScrollContext';

// ========== ПЕЧАТНАЯ МАШИНКА ==========
const TYPEWRITER_TEXT = '// PROJECT VOSKHOD / DROP';
const TYPEWRITER_MS = 55;

function TypewriterLine({ disabled }: { disabled: boolean }) {
  const [visible, setVisible] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (disabled) {
      setVisible(TYPEWRITER_TEXT.length);
      setDone(true);
      return;
    }
    if (visible >= TYPEWRITER_TEXT.length) {
      setDone(true);
      return;
    }
    const t = setTimeout(() => setVisible((v) => Math.min(v + 1, TYPEWRITER_TEXT.length)), TYPEWRITER_MS);
    return () => clearTimeout(t);
  }, [visible, disabled]);

  if (disabled) return <>{TYPEWRITER_TEXT}</>;

  return (
    <>
      {TYPEWRITER_TEXT.slice(0, visible)}
      <span
        className="inline-block w-[6px] h-[1.1em] bg-white/40 ml-1 align-middle"
        style={{ animation: done ? 'teeCursorBlink 1.1s step-end infinite' : 'none' }}
      />
    </>
  );
}

// ========== НАСТРОЙКИ РАЗМЕРОВ ==========
const TEE_INTRO = {
  mobile: {
    teeHeight: 'h-[70vh]',
    teeMaxHeight: 'max-h-[480px]',
    containerMinHeight: 'min-h-[50vh]',
  },
  tablet: {
    teeHeight: 'sm:h-[75vh]',
    teeMaxHeight: 'sm:max-h-[520px]',
    containerMinHeight: 'sm:min-h-[55vh]',
  },
  desktop: {
    teeHeight: 'md:h-[200vh]',
    teeMaxHeight: 'md:max-h-none',
    containerMinHeight: 'md:min-h-screen',
  },
} as const;
// ==========

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const TeeIntroBlock: React.FC = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [p, setP] = useState(0.15);
  const { compact, animationsDisabled, isMobile } = useHomeScrollCompact();

  // На мобилке — убираем scroll-through, используем статичное состояние
  const noScrollOnMobile = isMobile;
  const effectiveCompact = compact || noScrollOnMobile;

  useEffect(() => {
    if (effectiveCompact) {
      setP(0.85);
      return;
    }
    const el = sectionRef.current;
    if (!el) return;

    let raf = 0;
    let lastP = 0.15;

    let cachedStart = 0;
    let cachedEnd = 0;
    const updateCache = () => {
      const vh = window.innerHeight;
      cachedStart = el.offsetTop;
      cachedEnd = cachedStart + el.offsetHeight - vh;
    };

    const calc = () => {
      const vh = window.innerHeight;
      const start = cachedStart;
      const end = cachedEnd;
      const y = window.scrollY;
      const t = (y - start) / Math.max(1, end - start);
      const rawP = clamp01(t);
      const inViewport = y <= start + vh * 0.9;
      const effectiveP = inViewport && rawP < 0.1 ? Math.max(rawP, 0.15) : rawP;
      if (Math.abs(effectiveP - lastP) > 0.01) {
        lastP = effectiveP;
        setP(effectiveP);
      }
      raf = 0;
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(calc);
    };

    const onResize = () => {
      updateCache();
      calc();
    };
    updateCache();
    calc();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [effectiveCompact]);

  const out = smoothstep(0.78, 0.98, p);
  const fadeOut = lerp(1, 0.35, out);

  // Staggered entrance — каждый элемент появляется с задержкой при скролле
  const e0 = smoothstep(0, 0.12, p);    // comment
  const e1 = smoothstep(0.02, 0.15, p); // heading
  const e2 = smoothstep(0.05, 0.19, p); // description
  const e3 = smoothstep(0.08, 0.23, p); // cards
  const e4 = smoothstep(0.11, 0.27, p); // button

  const mkStyle = (enter: number, slideFrom = 28): React.CSSProperties => ({
    opacity: enter * fadeOut,
    transform: `translateY(${lerp(slideFrom, 0, enter)}px)`,
    /* Без transition — мгновенный отклик на скролл, без лагов */
    ...(animationsDisabled ? {} : { willChange: 'opacity, transform' }),
  });

  return (
    <section
      ref={sectionRef}
      className="relative w-full border-t border-white/5 tee-intro-mobile-height scroll-snap-start"
      style={
        isMobile
          ? undefined
          : { height: effectiveCompact ? '100vh' : '220vh' }
      }
    >
      {/* Keyframes */}
      <style>{`
        @keyframes teeGlowBreathe {
          0%, 100% { opacity: 0.88; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        @keyframes teeGoldShimmer {
          0%, 100% { opacity: 0.4; transform: scale(1) translateY(0); }
          40% { opacity: 0.7; transform: scale(1.08) translateY(-2%); }
          70% { opacity: 0.55; transform: scale(1.03) translateY(1%); }
        }
        @keyframes teeVignettePulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.72; }
        }
        @keyframes teeCursorBlink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        @keyframes teeCardFloat1 {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes teeCardFloat2 {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
      `}</style>

      <div className="sticky top-0 min-h-[100vh] sm:min-h-screen overflow-hidden" style={{ transform: 'translateZ(0)' }}>
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

        <div className="relative z-10 h-full min-h-[100vh] sm:min-h-0 sm:h-full max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-0">
          <div className="h-full grid grid-cols-12 items-center gap-6 sm:gap-8">
            <div
              className={`col-span-12 md:col-span-4 relative order-1 md:order-none overflow-visible min-h-0 ${TEE_INTRO.mobile.containerMinHeight} ${TEE_INTRO.tablet.containerMinHeight} ${TEE_INTRO.desktop.containerMinHeight}`}
            >
              <div className="absolute inset-0 flex items-center justify-center md:justify-start overflow-visible">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ASSETS.tee.cutout}
                  alt="VOSKHOD tee"
                  className={`absolute left-1/2 -translate-x-[calc(50%+90px)] md:left-[-80vw] md:translate-x-0 top-1/2 -translate-y-1/2 w-auto max-w-none pointer-events-none select-none object-contain
                    scale-[1.75] sm:scale-[1.5] md:scale-[1.2] origin-[50%_40%]
                    ${TEE_INTRO.mobile.teeHeight} ${TEE_INTRO.mobile.teeMaxHeight} ${TEE_INTRO.tablet.teeHeight} ${TEE_INTRO.tablet.teeMaxHeight} ${TEE_INTRO.desktop.teeHeight} ${TEE_INTRO.desktop.teeMaxHeight}
                    drop-shadow-[0_30px_60px_rgba(0,0,0,0.5)] md:drop-shadow-[0_50px_90px_rgba(0,0,0,0.65)]`}
                  draggable={false}
                />
              </div>
            </div>

            {/* Текстовый блок — поднят выше на мобилке (-mt-10) */}
            <div className="col-span-12 md:col-span-8 order-2 md:order-none flex flex-col justify-center items-center md:items-start -mt-10 sm:-mt-4 md:mt-0 pt-0 pb-6 sm:py-0 relative">
              {/* === Мобильный градиент: многослойный, анимированный === */}

              {/* Слой 1 — основной радиальный градиент с дыханием (на мобилке при скролле — без анимации и с меньшим blur) */}
              <div
                className="absolute md:hidden pointer-events-none"
                style={{
                  inset: '-35% -25% -20% -25%',
                  background:
                    'radial-gradient(ellipse 88% 72% at 50% 36%, rgba(11,13,16,0.97) 0%, rgba(11,13,16,0.88) 25%, rgba(11,13,16,0.55) 50%, rgba(11,13,16,0.18) 72%, transparent 92%)',
                  filter: animationsDisabled ? 'blur(12px)' : 'blur(24px)',
                  animation: animationsDisabled ? 'none' : 'teeGlowBreathe 7s ease-in-out infinite',
                }}
                aria-hidden
              />

              {/* Слой 2 — тёплое золотое свечение */}
              <div
                className="absolute md:hidden pointer-events-none"
                style={{
                  inset: '-15% -12% -8% -12%',
                  background:
                    'radial-gradient(ellipse 55% 40% at 52% 28%, rgba(198,144,46,0.08) 0%, rgba(198,144,46,0.03) 45%, transparent 75%)',
                  filter: animationsDisabled ? 'blur(16px)' : 'blur(32px)',
                  animation: animationsDisabled ? 'none' : 'teeGoldShimmer 9s ease-in-out infinite',
                }}
                aria-hidden
              />

              {/* Слой 3 — виньетка для глубины */}
              <div
                className="absolute md:hidden pointer-events-none"
                style={{
                  inset: '-10% -8% -5% -8%',
                  background:
                    'radial-gradient(ellipse 95% 85% at 50% 45%, transparent 30%, rgba(11,13,16,0.4) 65%, rgba(11,13,16,0.7) 90%)',
                  filter: animationsDisabled ? 'blur(8px)' : 'blur(14px)',
                  animation: animationsDisabled ? 'none' : 'teeVignettePulse 11s ease-in-out infinite',
                }}
                aria-hidden
              />

              {/* Desktop: боковой градиент */}
              <div
                className="absolute inset-y-0 left-0 w-56 hidden md:block pointer-events-none"
                style={{
                  background: 'linear-gradient(to right, rgba(11,13,16,0.9) 0%, rgba(11,13,16,0.25) 65%, transparent 100%)',
                }}
                aria-hidden
              />

              {/* ===== Контент с staggered entrance ===== */}
              <div className="relative z-10">
                {/* // COMMENT — печатная машинка + мигающий курсор (всегда включана) */}
                <div
                  className="text-[10px] sm:text-xs font-mono tracking-widest text-white/40 mb-2 sm:mb-3"
                  style={mkStyle(e0, 20)}
                >
                  <TypewriterLine disabled={false} />
                </div>

                {/* Заголовок */}
                <h2
                  className="text-2xl sm:text-3xl md:text-5xl font-light tracking-wide text-silver-gradient"
                  style={mkStyle(e1, 32)}
                >
                  КОНЦЕРН{' '}
                  <span
                    className="bg-gradient-to-r from-amber-700 via-yellow-500 to-amber-700 bg-[length:200%_100%] bg-clip-text text-transparent animate-gold-shimmer"
                  >
                    ВОСХОД
                  </span>
                </h2>

                {/* Описание */}
                <p
                  className="mt-4 sm:mt-5 max-w-2xl text-xs sm:text-sm md:text-base text-silver-gradient leading-relaxed"
                  style={mkStyle(e2, 26)}
                >
                  Премиальный тактический мерч и визуальная система бренда. Лимитированные дропы, строгие формы,
                  &quot;бетон/графит&quot; и контроль качества: паспорт, партия, проверка.
                </p>

                {/* Карточки с floating-эффектом */}
                <div
                  className="mt-6 sm:mt-8 grid grid-cols-2 gap-3 sm:gap-4 max-w-2xl"
                  style={mkStyle(e3, 36)}
                >
                  <div
                    className="rounded-xl border border-white/10 bg-[#141821]/85 sm:bg-white/5 sm:backdrop-blur-md p-3 sm:p-4"
                    style={{ animation: animationsDisabled ? 'none' : 'teeCardFloat1 6s ease-in-out infinite' }}
                  >
                    <div className="text-[10px] font-mono text-white/35">CODE</div>
                    <div className="mt-0.5 sm:mt-1 text-xs font-mono text-white/65">VSHD-TEE</div>
                    <div className="mt-2 sm:mt-3 text-[10px] font-mono text-white/35">STATUS</div>
                    <div className="mt-0.5 sm:mt-1 text-xs font-mono text-white/65">IN STOCK</div>
                  </div>

                  <div
                    className="rounded-xl border border-white/10 bg-[#141821]/85 sm:bg-white/5 sm:backdrop-blur-md p-3 sm:p-4"
                    style={{ animation: animationsDisabled ? 'none' : 'teeCardFloat2 7s ease-in-out infinite 0.5s' }}
                  >
                    <div className="text-[10px] font-mono text-white/35">MATERIAL</div>
                    <div className="mt-0.5 sm:mt-1 text-xs font-mono text-white/65">GRAPHITE</div>
                    <div className="mt-2 sm:mt-3 text-[10px] font-mono text-white/35">TAG</div>
                    <div className="mt-0.5 sm:mt-1 text-xs font-mono text-white/65">LIMITED DROP</div>
                  </div>
                </div>

                {/* Кнопка */}
                <div className="mt-6 sm:mt-8" style={mkStyle(e4, 24)}>
                  <Link
                    href="/catalog"
                    className="inline-flex items-center justify-center h-11 sm:h-12 md:h-14 px-6 sm:px-8 md:px-10 rounded-full border border-white/10 bg-[#141821]/85 sm:bg-white/5 sm:backdrop-blur-md text-[10px] sm:text-[11px] md:text-xs uppercase tracking-[0.2em] sm:tracking-[0.22em] text-silver-gradient transition-all duration-300 hover:border-[#C6902E]/35 hover:bg-white/10"
                  >
                    СМОТРЕТЬ КАТАЛОГ →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute left-0 right-0 bottom-0 h-16 sm:h-24 bg-gradient-to-b from-transparent to-black/30" />
        </div>
      </div>
    </section>
  );
};
