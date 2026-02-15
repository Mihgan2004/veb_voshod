"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ASSETS } from "@/lib/assets";
import { useHomeScrollCompact } from "@/components/home/HomeScrollContext";

const WELCOME_TEXT = "ДОБРО\nПОЖАЛОВАТЬ";
const TYPEWRITER_MS = 65;

function WelcomeTypewriter({ disabled }: { disabled: boolean }) {
  const [visible, setVisible] = useState(0);
  const [done, setDone] = useState(false);
  const fullLen = WELCOME_TEXT.length;

  useEffect(() => {
    if (disabled) {
      setVisible(fullLen);
      setDone(true);
      return;
    }
    if (visible >= fullLen) {
      setDone(true);
      return;
    }
    const t = setTimeout(() => setVisible((v) => v + 1), TYPEWRITER_MS);
    return () => clearTimeout(t);
  }, [visible, disabled, fullLen]);

  if (disabled) return <>{WELCOME_TEXT}</>;

  const display = WELCOME_TEXT.slice(0, visible);
  return (
    <>
      {display}
      {!done && (
        <span
          className="inline-block w-[3px] h-[0.9em] bg-white/50 ml-0.5 align-middle animate-pulse"
          aria-hidden
        />
      )}
    </>
  );
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const WelcomeBlock: React.FC = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const welcomeRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const { compact, isMobile } = useHomeScrollCompact();

  /* На мобилке — без скролла, только анимация появления */
  const noScroll = isMobile;

  useEffect(() => {
    if (noScroll) {
      /* Мобильная анимация — через CSS (welcome-entrance, logo-entrance, cta-entrance в globals.css) */
      if (compact) {
        if (welcomeRef.current) {
          welcomeRef.current.style.transform = "scale(0.78)";
          welcomeRef.current.style.opacity = "0.35";
          welcomeRef.current.style.transition = "";
        }
        if (logoRef.current) {
          logoRef.current.style.opacity = "1";
          logoRef.current.style.transform = "translateY(0px)";
          logoRef.current.style.transition = "";
        }
        if (ctaRef.current) {
          ctaRef.current.style.opacity = "1";
          ctaRef.current.style.transform = "translateY(0px)";
          ctaRef.current.style.transition = "";
        }
        return;
      }
      return;
    }

    if (compact) {
      if (welcomeRef.current) {
        welcomeRef.current.style.transform = "scale(0.78)";
        welcomeRef.current.style.opacity = "0.35";
        welcomeRef.current.style.transition = "";
      }
      if (logoRef.current) {
        logoRef.current.style.opacity = "1";
        logoRef.current.style.transform = "translateY(0px)";
        logoRef.current.style.transition = "";
      }
      if (ctaRef.current) {
        ctaRef.current.style.opacity = "1";
        ctaRef.current.style.transform = "translateY(0px)";
        ctaRef.current.style.transition = "";
      }
      return;
    }

    const el = sectionRef.current;
    if (!el || !welcomeRef.current || !logoRef.current || !ctaRef.current) return;

    let raf = 0;
    let cachedStart = 0;
    let cachedEnd = 0;
    let cacheValid = false;

    const updateCache = () => {
      const vh = window.innerHeight;
      cachedStart = el.offsetTop;
      cachedEnd = cachedStart + el.offsetHeight - vh;
      cacheValid = true;
    };

    const applyP = (p: number) => {
      const welcomeIn = smoothstep(0.05, 0.18, p);
      const welcomeMove = smoothstep(0.18, 0.46, p);
      const logoIn = smoothstep(0.4, 0.7, p);
      const ctaIn = smoothstep(0.78, 0.96, p);

      const welcomeScale = lerp(1, 0.78, welcomeMove);
      const welcomeOpacity = lerp(1, 0.35, welcomeMove) * welcomeIn;

      welcomeRef.current!.style.transition = "";
      welcomeRef.current!.style.transform = `scale(${welcomeScale})`;
      welcomeRef.current!.style.opacity = String(welcomeOpacity);

      logoRef.current!.style.transition = "";
      logoRef.current!.style.opacity = String(logoIn);
      logoRef.current!.style.transform = `translateY(${lerp(12, 0, logoIn)}px)`;

      ctaRef.current!.style.transition = "";
      ctaRef.current!.style.opacity = String(ctaIn);
      ctaRef.current!.style.transform = `translateY(${lerp(16, 0, ctaIn)}px)`;
    };

    const calc = () => {
      const vh = window.innerHeight;
      if (!cacheValid || el.offsetTop !== cachedStart) {
        updateCache();
      }
      if (cachedEnd <= cachedStart) {
        raf = 0;
        return;
      }
      const y = window.scrollY;
      const p = clamp01((y - cachedStart) / (cachedEnd - cachedStart));
      applyP(p);
      raf = 0;
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(calc);
    };

    const onResize = () => {
      cacheValid = false;
      calc();
    };

    updateCache();
    applyP(0);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [compact, noScroll]);

  return (
    <section
      id="welcome"
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="relative w-full bg-[#0B0D10] welcome-mobile-height"
      style={
        noScroll || compact
          ? { height: "100vh" }
          : { height: "300vh" }
      }
    >
      <div
        className="sticky top-0 h-[100svh] overflow-hidden px-4 sm:px-6 flex flex-col"
        style={isMobile ? undefined : { transform: "translateZ(0)" }}
      >
        {/* Фоны */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[#0B0D10]" />
          <div className="absolute inset-0 bg-[radial-gradient(1200px_520px_at_50%_0%,rgba(198,144,46,0.28),transparent_60%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(16,18,20,0.00)_0%,rgba(16,18,20,0.20)_35%,rgba(14,16,18,0.65)_70%,rgba(11,13,16,0.92)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(900px_520px_at_50%_82%,rgba(185,190,200,0.06),transparent_60%)]" />
          <div className="absolute inset-0 bg-noise opacity-[0.22]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_12%,rgba(0,0,0,0.72)_88%)]" />
        </div>

        {/* 1. Верх — «Добро пожаловать» (фиксированно наверху) */}
        <div
          ref={welcomeRef}
          className="relative z-10 flex-shrink-0 pt-[16%] sm:pt-[14%] flex justify-center items-start select-none welcome-entrance"
          style={{ willChange: "transform, opacity" }}
        >
          <div className="text-[26px] sm:text-[32px] md:text-[48px] font-light tracking-[0.08em] text-white/90 uppercase text-center whitespace-pre-line">
            <WelcomeTypewriter disabled={!noScroll} />
          </div>
        </div>

        {/* 2. Середина — логотип ВОСХОД */}
        <div className="relative z-0 flex-1 flex items-center justify-center pointer-events-none min-h-0">
          <div
            ref={logoRef}
            className="flex flex-col items-center relative logo-entrance -mt-4 sm:-mt-6"
            style={{ willChange: "transform, opacity" }}
          >
            <div
              className="absolute -inset-12 bg-[radial-gradient(ellipse_80%_50%_at_50%_50%,rgba(198,144,46,0.25)_0%,transparent_65%)] blur-2xl pointer-events-none select-none"
              aria-hidden
            />
            <Image
              src={ASSETS.brand.logoDesktop}
              alt="Проект Восход"
              width={640}
              height={184}
              sizes="(max-width: 640px) 260px, (max-width: 1024px) 360px, 640px"
              className="w-[220px] sm:w-[320px] md:w-[560px] select-none pointer-events-none"
              draggable={false}
              style={{ backfaceVisibility: "hidden" }}
              priority
            />
          </div>
        </div>

        {/* 3. Низ — кнопка В КАТАЛОГ */}
        <div
          ref={ctaRef}
          className="relative z-10 flex-shrink-0 pb-10 sm:pb-12 flex justify-center cta-entrance"
          style={{ willChange: "transform, opacity" }}
        >
          <Link
            href="/catalog"
            className="
              group inline-flex items-center justify-center
              h-12 md:h-14
              px-8 md:px-10
              rounded-full
              border border-white/10
              bg-[#141821]/85 sm:bg-white/5
              sm:backdrop-blur-md
              text-[11px] md:text-xs
              uppercase tracking-[0.22em]
              text-[#F5F5F5]
              transition-colors duration-200
              hover:border-[#C6902E]/35 hover:bg-white/7
            "
          >
            <span className="relative">
              В КАТАЛОГ
              <span className="absolute -bottom-2 left-0 h-px w-full bg-[#C6902E]/0 group-hover:bg-[#C6902E]/40 transition-colors duration-200" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
};
