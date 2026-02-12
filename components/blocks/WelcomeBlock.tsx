"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link"; // ✅ исправлено: next/link вместо react-router-dom

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const WelcomeBlock: React.FC = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [p, setP] = useState(0);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    let raf = 0;

    const calc = () => {
      const vh = window.innerHeight;
      const start = el.offsetTop;
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
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // ФАЗЫ (регулируешь только числа)
  const welcomeIn = smoothstep(0.05, 0.18, p);     // появление
  const welcomeMove = smoothstep(0.18, 0.46, p);   // уход вверх + уменьшение

  const logoIn = smoothstep(0.40, 0.70, p);        // лого в центре
  const ctaIn = smoothstep(0.78, 0.96, p);         // кнопка в самом конце

  // WELCOME: центр -> вверх
  const welcomeTop = lerp(50, 16, welcomeMove);     // 50% -> 16% экрана
  const welcomeScale = lerp(1, 0.78, welcomeMove);
  const welcomeOpacity = lerp(1, 0.35, welcomeMove) * welcomeIn;

  // LOGO: всегда центр
  const logoOpacity = logoIn;

  // CTA: низ экрана, появляется почти в финале
  const ctaOpacity = ctaIn;
  const ctaY = lerp(16, 0, ctaIn);

  return (
    <section
      ref={sectionRef as any}
      className="relative w-full bg-[#0B0D10]"
      style={{ height: "300vh" }}
    >
      <div className="sticky top-0 h-[100vh] overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[#0B0D10]" />
          <div className="absolute inset-0 bg-[radial-gradient(1200px_520px_at_50%_0%,rgba(198,144,46,0.28),transparent_60%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(16,18,20,0.00)_0%,rgba(16,18,20,0.20)_35%,rgba(14,16,18,0.65)_70%,rgba(11,13,16,0.92)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(900px_520px_at_50%_82%,rgba(185,190,200,0.06),transparent_60%)]" />
          <div className="absolute inset-0 bg-noise opacity-[0.22]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_12%,rgba(0,0,0,0.72)_88%)]" />
        </div>

        <div
          className="absolute left-1/2 top-0 flex justify-center text-center select-none w-full max-w-full"
          style={{
            top: `${welcomeTop}%`,
            transform: `translateX(-50%) translateY(-50%) scale(${welcomeScale})`,
            opacity: welcomeOpacity,
            willChange: "transform, opacity",
          }}
        >
          <div className="text-[34px] md:text-[56px] font-light tracking-[0.08em] text-[#F5F5F5] uppercase">
            ДОБРО
            <br />
            ПОЖАЛОВАТЬ
          </div>
        </div>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="flex flex-col items-center"
            style={{
              opacity: logoOpacity,
              transform: `translateY(${lerp(12, 0, logoIn)}px)`,
              willChange: "transform, opacity",
            }}
          >
            <img
              src="/brand/project-voshod@2x.png"
              alt="Проект Восход"
              className="w-[260px] sm:w-[360px] md:w-[640px] select-none pointer-events-none"
              draggable={false}
              style={{ backfaceVisibility: "hidden" }}
            />
          </div>
        </div>

        <div
          className="absolute inset-x-0 bottom-10 flex justify-center"
          style={{
            opacity: ctaOpacity,
            transform: `translateY(${ctaY}px)`,
            willChange: "transform, opacity",
          }}
        >
          <Link
            href="/catalog"
            className="
              group inline-flex items-center justify-center
              h-12 md:h-14
              px-8 md:px-10
              rounded-full
              border border-white/10
              bg-white/5
              backdrop-blur-md
              text-[11px] md:text-xs
              uppercase tracking-[0.22em]
              text-[#F5F5F5]
              transition-all duration-300
              hover:border-[#C6902E]/35 hover:bg-white/7
            "
          >
            <span className="relative">
              В КАТАЛОГ
              <span className="absolute -bottom-2 left-0 h-px w-full bg-[#C6902E]/0 group-hover:bg-[#C6902E]/40 transition-all duration-300" />
            </span>
          </Link>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          /* меньше подъем welcome и чуть меньше лого */
        }
      `}</style>
    </section>
  );
};