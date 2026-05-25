'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ASSETS } from '@/lib/assets';
import { useHomeScrollCompact } from '@/components/home/HomeScrollContext';
import { useLiteMode } from '@/lib/useLiteMode';

// ========== КОПИРАЙТ ИНТРО ==========
const INTRO_MONO = '// RSVT / PEOPLE · CITY';
const INTRO_BODY = [
  'Мы собираем вокруг себя эстетику тёмного города, строгих линий.',
  'Это не просто вещи и визуальный стиль. Это попытка создать пространство для своих: для тех, кому близки сдержанность, андеграундная культура и ощущение общего знака.',
] as const;

const SPEC_CARDS = [
  {
    rows: [
      { label: 'CODE', value: 'RSVT-001' },
      { label: 'STATE', value: 'IN ROTATION' },
    ],
  },
  {
    rows: [
      { label: 'SURFACE', value: 'GRAPHITE' },
      { label: 'DROP', value: 'LIMITED RUN' },
    ],
  },
] as const;

// ========== ПЕЧАТНАЯ МАШИНКА (мобилка) ==========
const TYPEWRITER_TEXT = INTRO_MONO;
const TYPEWRITER_MS = 55;

function IntroTitle({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <h2 className={className} style={style}>
      <span className="tee-intro-title-shimmer bg-gradient-to-r from-amber-700 via-yellow-500 to-amber-700 bg-[length:200%_100%] animate-gold-shimmer bg-clip-text text-transparent">
        РАССВЕТ
      </span>
      {' '}
      <span className="text-white/90">— это проект о людях.</span>
    </h2>
  );
}

function IntroBody({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div className={className} style={style}>
      {INTRO_BODY.map((paragraph) => (
        <p key={paragraph.slice(0, 24)} className="text-pretty">
          {paragraph}
        </p>
      ))}
    </div>
  );
}

const SPEC_CARD_FLOAT = [
  'md:[animation:teeCardFloat1_6s_ease-in-out_infinite]',
  'md:[animation:teeCardFloat2_7s_ease-in-out_infinite_0.5s]',
] as const;

function SpecCardsGrid({
  className = '',
  cardClassName = 'vx-spec-card',
  desktopFloat = false,
  style,
}: {
  className?: string;
  cardClassName?: string;
  desktopFloat?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <div className={className} style={style}>
      {SPEC_CARDS.map((card, i) => (
        <div
          key={card.rows[0].label}
          className={`${cardClassName}${desktopFloat ? ` ${SPEC_CARD_FLOAT[i]}` : ''}`}
        >
          {card.rows.map((row, i) => (
            <React.Fragment key={row.label}>
              <div className={`vx-spec-card-label${i > 0 ? ' mt-2.5 sm:mt-3' : ''}`}>{row.label}</div>
              <div className="vx-spec-card-value">{row.value}</div>
            </React.Fragment>
          ))}
        </div>
      ))}
    </div>
  );
}

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
const TEE_CUTOUT_MASK = (src: string): React.CSSProperties => ({
  WebkitMaskImage: `url(${src})`,
  maskImage: `url(${src})`,
  WebkitMaskRepeat: 'no-repeat',
  maskRepeat: 'no-repeat',
  WebkitMaskSize: '100% 100%',
  maskSize: '100% 100%',
  WebkitMaskPosition: 'center',
  maskPosition: 'center',
});

/**
 * Mobile-футболка: подстройка вручную (только ≤768px, блок TeeIntroBlock).
 * offsetX — больше = влево (арт к центру экрана); меньше / отрицательный = вправо.
 * offsetY — больше = вниз, меньше = вверх.
 * scale — размер; heightVh / heightMaxPx — высота картинки.
 */
const MOBILE_TEE = {
  heightVh: 70,
  heightMaxPx: 800,
  scale:3,
  offsetX: 140,
  offsetY: 0,
  originX: 50,
  originY: 36,
} as const;

const TEE_INTRO = {
  mobile: {
    teeMaxWidth: 'max-w-[100vw]',
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
      setP(noScrollOnMobile ? 0.15 : 0.85);
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
  }, [effectiveCompact, noScrollOnMobile]);

  const out = smoothstep(0.78, 0.98, p);
  const fadeOut = lerp(1, 0.35, out);
  const backdropFade = isMobile
    ? 1
    : lerp(1, 0, smoothstep(0.68, 0.92, p));

  const e0 = smoothstep(0, 0.12, p);
  const e1 = smoothstep(0.02, 0.15, p);
  const e2 = smoothstep(0.05, 0.19, p);
  const e3 = smoothstep(0.08, 0.23, p);
  const e4 = smoothstep(0.11, 0.27, p);

  const mkStyle = (enter: number, slideFrom = 28): React.CSSProperties => {
    if (isMobile) {
      return { opacity: 1, transform: 'none' };
    }
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

      <div className="relative overflow-hidden md:sticky md:top-0 md:min-h-screen">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ opacity: backdropFade }}
          aria-hidden
        >
          <div className="absolute inset-0 bg-[var(--vx-bg-base)]" />
          <div
            className="hidden md:block absolute inset-x-0 bottom-0 h-[28%] bg-gradient-to-b from-transparent to-[var(--vx-bg-section)] pointer-events-none"
            aria-hidden
          />
          <div
            className="absolute inset-0 opacity-[0.22]"
            style={{
              backgroundImage:
                'repeating-linear-gradient(135deg, rgba(255,255,255,0.035) 0px, rgba(255,255,255,0.035) 38px, rgba(0,0,0,0.0) 38px, rgba(0,0,0,0.0) 76px)',
            }}
          />
          <div className="absolute inset-x-0 top-0 h-[32%] bg-gradient-to-b from-black/25 to-transparent md:h-[22%] md:from-black/15" />
          <div className="absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-t from-black/40 to-transparent md:h-[32%] md:from-black/30" />
          <div
            className="absolute inset-0 hidden md:block bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04)_0%,rgba(0,0,0,0.35)_82%)]"
            aria-hidden
          />
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

                <IntroTitle
                  className="max-w-[21rem] text-[clamp(1.25rem,5.5vw,1.65rem)] font-light tracking-[0.05em] leading-[1.2] text-pretty text-balance"
                  style={mkStyle(e1, 32)}
                />

                <IntroBody
                  className="max-w-[21rem] flex flex-col gap-3 text-[13px] sm:text-sm leading-[1.6] text-white/75"
                  style={mkStyle(e2, 26)}
                />
              </div>

              <div
                className="relative w-full overflow-hidden py-0 pointer-events-none select-none"
                style={mkStyle(e1, 16)}
                aria-hidden
              >
                <div
                  className="pointer-events-none absolute inset-0 z-0"
                  style={{
                    background: `
                      radial-gradient(ellipse 120% 95% at 50% 42%, transparent 35%, rgba(0,0,0,0.35) 100%),
                      linear-gradient(to top, transparent 55%, rgba(5,6,7,0.38) 100%)`,
                    opacity: 0.38,
                  }}
                  aria-hidden
                />
                <div className="teeVisual relative z-[1] w-full overflow-hidden">
                  <div
                    className="teeImageWrap relative left-1/2 z-10 w-max overflow-hidden"
                    style={{
                      isolation: 'isolate',
                      transform: `translate(calc(-50% - ${MOBILE_TEE.offsetX}px), ${MOBILE_TEE.offsetY}px) scale(${MOBILE_TEE.scale})`,
                      transformOrigin: `${MOBILE_TEE.originX}% ${MOBILE_TEE.originY}%`,
                    }}
                  >
                    <img
                      src={ASSETS.tee.cutout}
                      alt=""
                      width={512}
                      height={768}
                      className={`block ${TEE_INTRO.mobile.teeMaxWidth} w-auto object-contain drop-shadow-[0_24px_48px_rgba(0,0,0,0.45)]`}
                      style={{
                        height: `min(${MOBILE_TEE.heightVh}vh, ${MOBILE_TEE.heightMaxPx}px)`,
                        maxHeight: `${MOBILE_TEE.heightMaxPx}px`,
                        filter: 'brightness(0.96) contrast(1.06) saturate(0.95)',
                      }}
                      draggable={false}
                    />
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        ...TEE_CUTOUT_MASK(ASSETS.tee.cutout),
                        background: `
                          radial-gradient(ellipse 76% 74% at 50% 20%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.22) 42%, rgba(0,0,0,0.48) 92%),
                          linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.18) 48%, rgba(5,6,7,0.42) 100%)`,
                        mixBlendMode: 'soft-light',
                        opacity: 0.42,
                      }}
                      aria-hidden
                    />
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        ...TEE_CUTOUT_MASK(ASSETS.tee.cutout),
                        background:
                          'radial-gradient(ellipse 62% 48% at 70% 22%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 35%, rgba(255,255,255,0) 70%)',
                        mixBlendMode: 'screen',
                        opacity: 0.18,
                      }}
                      aria-hidden
                    />
                  </div>
                </div>
              </div>

              <SpecCardsGrid
                className="grid w-full max-w-md grid-cols-2 gap-2.5 sm:gap-3"
                cardClassName="vx-spec-card max-md:!animate-none"
                style={mkStyle(e3, 36)}
              />

              <div className="flex w-full justify-center pt-2 sm:pt-4" style={mkStyle(e4, 24)}>
                <Link
                  href="/catalog"
                  className="vx-btn-primary w-full max-w-[280px] sm:max-w-[320px]"
                >
                  <span>СМОТРЕТЬ КАТАЛОГ</span>
                  <span className="vx-btn-primary__arrow" aria-hidden>
                    →
                  </span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="h-full grid grid-cols-12 items-center gap-6 sm:gap-8 lg:gap-12 xl:gap-16">
              <div
                className={`col-span-12 md:col-span-4 relative overflow-hidden md:overflow-visible min-h-0 ${TEE_INTRO.tablet.containerMinHeight} ${TEE_INTRO.desktop.containerMinHeight}`}
              >
                <div className="absolute inset-0 overflow-hidden md:overflow-visible flex items-center justify-center md:justify-start">
                  <div
                    className="pointer-events-none absolute inset-0 z-0"
                    style={{
                      background: `
                        radial-gradient(ellipse 120% 95% at 40% 38%, transparent 35%, rgba(0,0,0,0.35) 100%),
                        linear-gradient(to top, transparent 55%, rgba(5,6,7,0.38) 100%)`,
                      opacity: 0.4,
                    }}
                    aria-hidden
                  />
                  <img
                    src={ASSETS.tee.cutout}
                    alt="Футболка РАССВЕТ"
                    width={512}
                    height={768}
                    className={`absolute z-[1] left-1/2 -translate-x-[calc(50%+90px)] md:left-[-80vw] md:translate-x-0 top-1/2 -translate-y-1/2 w-auto max-w-none pointer-events-none select-none object-contain
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
                  style={{ background: 'linear-gradient(to right, rgba(5,6,7,0.72) 0%, rgba(5,6,7,0.22) 60%, transparent 100%)' }}
                  aria-hidden
                />

                <div className="relative z-10">
                  <div className="text-[10px] sm:text-[11px] lg:text-[11px] font-mono tracking-[0.2em] lg:tracking-[0.24em] text-white/30 lg:text-white/35 mb-3 sm:mb-4 lg:mb-4" style={mkStyle(e0, 20)}>
                    {INTRO_MONO}
                    {!animationsDisabled && (
                      <span className="inline-block w-[5px] h-[1em] bg-white/30 ml-1 align-middle" style={{ animation: 'teeCursorBlink 1.1s step-end infinite' }} />
                    )}
                  </div>

                  <IntroTitle
                    className="text-[22px] sm:text-[28px] md:text-[44px] lg:text-[40px] xl:text-[48px] font-light tracking-[0.06em] lg:tracking-[0.07em] leading-[1.1]"
                    style={mkStyle(e1, 32)}
                  />

                  <IntroBody
                    className="mt-4 sm:mt-5 lg:mt-6 max-w-xl lg:max-w-2xl flex flex-col gap-4 text-[13px] sm:text-sm md:text-[15px] lg:text-[15px] leading-[1.7] lg:leading-[1.75] text-white/48 lg:text-white/55"
                    style={mkStyle(e2, 26)}
                  />

                  <SpecCardsGrid
                    className="mt-5 sm:mt-7 lg:mt-8 grid grid-cols-2 gap-2.5 sm:gap-3 lg:gap-4 max-w-xl lg:max-w-2xl"
                    desktopFloat
                    style={mkStyle(e3, 36)}
                  />

                  <div className="mt-5 sm:mt-7 lg:mt-8" style={mkStyle(e4, 24)}>
                    <Link href="/catalog" className="vx-btn-primary">
                      <span>СМОТРЕТЬ КАТАЛОГ</span>
                      <span className="vx-btn-primary__arrow" aria-hidden>
                        →
                      </span>
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
