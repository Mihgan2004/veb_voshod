'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ASSETS } from '@/lib/assets';
import { useHomeScrollCompact } from '@/components/home/HomeScrollContext';
import { useLiteMode } from '@/lib/useLiteMode';

// ========== ПЕЧАТНАЯ МАШИНКА (мобилка) ==========
const TYPEWRITER_TEXT = '// ПРОЕКТ РАССВЕТ / DROP';
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

// ========== НАСТРОЙКИ РАЗМЕРОВ (десктоп из референса) ==========
const TEE_INTRO = {
  mobile: {
    teeHeight: 'h-[min(38vh,260px)]',
    teeMaxHeight: 'max-h-[260px]',
    containerMinHeight: '',
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

const DESKTOP_BREAKPOINT = 1024;

export const TeeIntroBlock: React.FC = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [p, setP] = useState(0.15);
  const [isDesktop, setIsDesktop] = useState(false);
  const { compact, animationsDisabled, isMobile } = useHomeScrollCompact();
  const liteMode = useLiteMode();

  const noScrollOnMobile = isMobile;
  const effectiveCompact = compact || noScrollOnMobile;

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= DESKTOP_BREAKPOINT);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Скролл-логика как в референсе (getBoundingClientRect, без кэша)
  useEffect(() => {
    if (effectiveCompact) {
      setP(0.85);
      return;
    }
    const el = sectionRef.current;
    if (!el) return;

    let raf = 0;

    const calc = () => {
      const vh = window.innerHeight;
      const rect = el.getBoundingClientRect();
      const start = rect.top + window.scrollY;
      const end = start + el.offsetHeight - vh;
      const y = window.scrollY;
      const t = (y - start) / Math.max(1, end - start);
      const rawP = clamp01(t);
      const inViewport = rect.top < vh * 0.9;
      const effectiveP = inViewport && rawP < 0.1 ? Math.max(rawP, 0.15) : rawP;
      setP(effectiveP);
      raf = 0;
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
  }, [effectiveCompact]);

  const out = smoothstep(0.78, 0.98, p);
  const fadeOut = lerp(1, 0.35, out);

  const e0 = smoothstep(0, 0.12, p);
  const e1 = smoothstep(0.02, 0.15, p);
  const e2 = smoothstep(0.05, 0.19, p);
  const e3 = smoothstep(0.08, 0.23, p);
  const e4 = smoothstep(0.11, 0.27, p);

  const mkStyle = (enter: number, slideFrom = 28): React.CSSProperties => {
    const opacity = enter * fadeOut;
    const translateY = lerp(slideFrom, 0, enter);
    return {
      opacity: Math.round(opacity * 1e5) / 1e5,
      transform: `translateY(${Math.round(translateY * 100) / 100}px)`,
      transition: 'opacity 0.1s, transform 0.1s',
    };
  };

  return (
    <section
      id="intro"
      ref={sectionRef}
      data-compact={compact ? true : undefined}
      className="tee-intro-block relative w-full border-t border-white/5 tee-intro-mobile-height tee-intro-scroll-height"
    >
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

      <div className="relative md:sticky md:top-0 md:min-h-screen md:overflow-hidden">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute inset-0 bg-[#0B0D10]" />
          <div
            className="hidden md:block absolute inset-x-0 bottom-0 h-[35%] bg-gradient-to-b from-transparent to-[#07090c] pointer-events-none"
            aria-hidden
          />
          <div
            className="absolute inset-0 opacity-[0.22]"
            style={{
              backgroundImage:
                'repeating-linear-gradient(135deg, rgba(255,255,255,0.035) 0px, rgba(255,255,255,0.035) 38px, rgba(0,0,0,0.0) 38px, rgba(0,0,0,0.0) 76px)',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/35" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,rgba(0,0,0,0.78)_78%)]" />
          <div
            className="absolute inset-0 mix-blend-overlay bg-noise"
            style={{ opacity: liteMode ? 0 : 0.06 }}
            aria-hidden
          />
        </div>

        <div className="relative z-10 max-w-7xl lg:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 py-8 pb-10 sm:py-10 md:py-0 md:min-h-screen md:h-full">
          {!isDesktop ? (
            <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-7 sm:gap-8">
              <div className="flex w-full flex-col items-center gap-5 text-center">
                <div
                  className="text-[10px] sm:text-[11px] font-mono tracking-[0.2em] text-white/30"
                  style={mkStyle(e0, 20)}
                >
                  <TypewriterLine disabled={false} />
                </div>

                <h2
                  className="max-w-[18rem] text-[clamp(1.375rem,6vw,1.75rem)] font-light tracking-[0.06em] leading-[1.15] text-pretty text-balance"
                  style={mkStyle(e1, 32)}
                >
                  проект{' '}
                  <span className="tee-intro-title-shimmer bg-gradient-to-r from-amber-700 via-yellow-500 to-amber-700 bg-[length:200%_100%] animate-gold-shimmer bg-clip-text text-transparent">
                    РАССВЕТ
                  </span>
                </h2>

                <p
                  className="max-w-[20rem] text-[13px] sm:text-sm leading-[1.55] text-white/80 text-pretty"
                  style={mkStyle(e2, 26)}
                >
                  Тактический мерч и визуальная система бренда. Лимитированные дропы, строгие формы,
                  &quot;бетон/графит&quot; и контроль качества: паспорт, партия, проверка.
                </p>
              </div>

              <div
                className="relative flex w-full justify-center py-1 pointer-events-none select-none"
                style={mkStyle(e1, 16)}
                aria-hidden
              >
                <img
                  src={ASSETS.tee.cutout}
                  alt=""
                  width={512}
                  height={768}
                  className={`${TEE_INTRO.mobile.teeHeight} ${TEE_INTRO.mobile.teeMaxHeight} w-auto object-contain drop-shadow-[0_24px_48px_rgba(0,0,0,0.45)] opacity-90`}
                  style={{ filter: 'brightness(0.96) contrast(1.06) saturate(0.95)' }}
                  draggable={false}
                />
              </div>

              <div
                className="grid w-full max-w-md grid-cols-2 gap-2.5 sm:gap-3"
                style={mkStyle(e3, 36)}
              >
                <div className="vx-spec-card max-md:!animate-none">
                  <div className="vx-spec-card-label">CODE</div>
                  <div className="vx-spec-card-value">VSHD-TEE</div>
                  <div className="vx-spec-card-label mt-2.5 sm:mt-3">STATUS</div>
                  <div className="vx-spec-card-value">IN STOCK</div>
                </div>
                <div className="vx-spec-card max-md:!animate-none">
                  <div className="vx-spec-card-label">MATERIAL</div>
                  <div className="vx-spec-card-value">GRAPHITE</div>
                  <div className="vx-spec-card-label mt-2.5 sm:mt-3">TAG</div>
                  <div className="vx-spec-card-value">LIMITED DROP</div>
                </div>
              </div>

              <div className="flex w-full justify-center pt-2 sm:pt-4" style={mkStyle(e4, 24)}>
                <Link
                  href="/catalog"
                  className="vx-cta-btn w-full max-w-[280px] sm:max-w-[320px]"
                >
                  СМОТРЕТЬ КАТАЛОГ →
                </Link>
              </div>
            </div>
          ) : (
            <div className="h-full grid grid-cols-12 items-center gap-6 sm:gap-8 lg:gap-12 xl:gap-16">
              <div
                className={`col-span-12 md:col-span-4 relative overflow-visible min-h-0 ${TEE_INTRO.tablet.containerMinHeight} ${TEE_INTRO.desktop.containerMinHeight}`}
              >
                <div className="absolute inset-0 flex items-center justify-center md:justify-start overflow-visible">
                  <img
                    src={ASSETS.tee.cutout}
                    alt="Футболка РАССВЕТ"
                    width={512}
                    height={768}
                    className={`absolute left-1/2 -translate-x-[calc(50%+90px)] md:left-[-80vw] md:translate-x-0 top-1/2 -translate-y-1/2 w-auto max-w-none pointer-events-none select-none object-contain
                      scale-[1.75] sm:scale-[1.5] md:scale-[1.2] origin-[50%_40%]
                      ${TEE_INTRO.tablet.teeHeight} ${TEE_INTRO.tablet.teeMaxHeight} ${TEE_INTRO.desktop.teeHeight} ${TEE_INTRO.desktop.teeMaxHeight}
                      drop-shadow-[0_30px_60px_rgba(0,0,0,0.5)] md:drop-shadow-[0_50px_90px_rgba(0,0,0,0.65)]`}
                    draggable={false}
                  />
                </div>
              </div>

              <div className="col-span-12 md:col-span-8 flex flex-col justify-center items-center md:items-start md:mt-0 relative">
                <div
                  className="absolute inset-y-0 left-0 w-56 lg:w-72 hidden md:block pointer-events-none"
                  style={{ background: 'linear-gradient(to right, rgba(11,13,16,0.92) 0%, rgba(11,13,16,0.3) 60%, transparent 100%)' }}
                  aria-hidden
                />

                <div className="relative z-10">
                  <div className="text-[10px] sm:text-[11px] lg:text-[11px] font-mono tracking-[0.2em] lg:tracking-[0.24em] text-white/30 lg:text-white/35 mb-3 sm:mb-4 lg:mb-4" style={mkStyle(e0, 20)}>
                    {'// ПРОЕКТ РАССВЕТ / DROP'}
                    {!animationsDisabled && (
                      <span className="inline-block w-[5px] h-[1em] bg-white/30 ml-1 align-middle" style={{ animation: 'teeCursorBlink 1.1s step-end infinite' }} />
                    )}
                  </div>

                  <h2 className="text-[22px] sm:text-[28px] md:text-[44px] lg:text-[40px] xl:text-[48px] font-light tracking-[0.06em] lg:tracking-[0.07em] leading-[1.1]" style={mkStyle(e1, 32)}>
                    проект{' '}
                    <span className="tee-intro-title-shimmer bg-gradient-to-r from-amber-700 via-yellow-500 to-amber-700 bg-[length:200%_100%] animate-gold-shimmer bg-clip-text text-transparent">
                      РАССВЕТ
                    </span>
                  </h2>

                  <p
                    className="mt-4 sm:mt-5 lg:mt-6 max-w-xl lg:max-w-2xl text-[13px] sm:text-sm md:text-[15px] lg:text-[15px] leading-[1.7] lg:leading-[1.75] text-white/48 lg:text-white/55"
                    style={mkStyle(e2, 26)}
                  >
                    Премиальный тактический мерч и визуальная система бренда. Лимитированные дропы, строгие формы, &quot;бетон/графит&quot; и контроль качества: паспорт, партия, проверка.
                  </p>

                  <div className="mt-5 sm:mt-7 lg:mt-8 grid grid-cols-2 gap-2.5 sm:gap-3 lg:gap-4 max-w-xl lg:max-w-2xl" style={mkStyle(e3, 36)}>
                    <div className="vx-spec-card md:[animation:teeCardFloat1_6s_ease-in-out_infinite]">
                      <div className="vx-spec-card-label">CODE</div>
                      <div className="vx-spec-card-value">VSHD-TEE</div>
                      <div className="vx-spec-card-label mt-2.5 sm:mt-3">STATUS</div>
                      <div className="vx-spec-card-value">IN STOCK</div>
                    </div>
                    <div className="vx-spec-card md:[animation:teeCardFloat2_7s_ease-in-out_infinite_0.5s]">
                      <div className="vx-spec-card-label">MATERIAL</div>
                      <div className="vx-spec-card-value">GRAPHITE</div>
                      <div className="vx-spec-card-label mt-2.5 sm:mt-3">TAG</div>
                      <div className="vx-spec-card-value">LIMITED DROP</div>
                    </div>
                  </div>

                  <div className="mt-5 sm:mt-7 lg:mt-8" style={mkStyle(e4, 24)}>
                    <Link
                      href="/catalog"
                      className="vx-cta-btn lg:!h-12 lg:!px-10 lg:!text-xs lg:!tracking-[0.24em] lg:border-white/[0.1] lg:hover:border-gold/25"
                    >
                      СМОТРЕТЬ КАТАЛОГ →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
