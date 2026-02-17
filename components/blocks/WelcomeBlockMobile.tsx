"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ASSETS } from "@/lib/assets";
import { useHomeScrollCompact } from "@/components/home/HomeScrollContext";
import { useLiteMode } from "@/lib/useLiteMode";
import { WelcomeTypewriter, russoOne } from "./welcomeBlockShared";

export function WelcomeBlockMobile() {
  const welcomeRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const { compact } = useHomeScrollCompact();
  const liteMode = useLiteMode();

  useEffect(() => {
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
    }
  }, [compact]);

  return (
    <section
      id="welcome"
      className="relative w-full bg-[#0B0D10] welcome-mobile-height"
      style={{ height: "100vh" }}
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden px-4 sm:px-6 flex flex-col">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[#0B0D10]" />
          <div className="absolute inset-0 bg-[radial-gradient(1200px_520px_at_50%_0%,rgba(198,144,46,0.28),transparent_60%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(16,18,20,0.00)_0%,rgba(16,18,20,0.20)_35%,rgba(14,16,18,0.65)_70%,rgba(11,13,16,0.92)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(900px_520px_at_50%_82%,rgba(185,190,200,0.06),transparent_60%)]" />
          {!liteMode && <div className="absolute inset-0 bg-noise opacity-[0.22]" />}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_12%,rgba(0,0,0,0.72)_88%)]" />
        </div>

        <div
          ref={welcomeRef}
          className={`relative z-10 flex-shrink-0 pt-[20%] sm:pt-[18%] flex justify-center items-start select-none welcome-entrance ${russoOne.variable}`}
          style={{ willChange: "transform, opacity" }}
        >
          <div
          className="vx-welcome-text text-[22px] sm:text-[28px] font-light tracking-[0.08em] uppercase text-center whitespace-pre-line"
          style={{
            fontFamily: "var(--font-welcome), sans-serif",
            color: "transparent",
            WebkitTextStroke: "1.5px #F5F5F5",
          }}
        >
          <WelcomeTypewriter disabled={true} />
        </div>
        </div>

        <div className="relative z-0 flex-1 flex items-center justify-center pointer-events-none min-h-0">
          <div
            ref={logoRef}
            className="flex flex-col items-center justify-center relative logo-entrance -mt-4 sm:-mt-6"
            style={{ willChange: "transform, opacity" }}
          >
            {!liteMode && (
              <div
                className="absolute -inset-12 bg-[radial-gradient(ellipse_80%_50%_at_50%_50%,rgba(198,144,46,0.25)_0%,transparent_65%)] blur-2xl pointer-events-none select-none"
                aria-hidden
              />
            )}
            <Image
              src={ASSETS.brand.logoDesktop}
              alt="Проект Восход"
              width={640}
              height={184}
              sizes="(max-width: 640px) 260px, 360px"
              className="w-[220px] sm:w-[320px] select-none pointer-events-none"
              draggable={false}
              style={{ backfaceVisibility: "hidden" }}
              priority
            />
          </div>
        </div>

        <div
          ref={ctaRef}
          className="relative z-10 flex-shrink-0 pb-10 sm:pb-12 flex justify-center cta-entrance"
          style={{ willChange: "transform, opacity" }}
        >
          <Link
            href="/catalog"
            className="
              group inline-flex items-center justify-center
              h-12 px-8 rounded-full
              border border-white/10
              bg-[#141821]/85 sm:bg-white/5 sm:backdrop-blur-md
              text-[11px] sm:text-xs uppercase tracking-[0.22em]
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
}
