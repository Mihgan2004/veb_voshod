"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { PHASE, clamp, smoothstep } from "./earthScrollConfig";
import { SpaceBackground } from "./SpaceBackground";
import { VoshodGeoOverlay } from "./VoshodGeoOverlay";

import "./earth-scroll-section.css";

const EarthScene = dynamic(() => import("./EarthScene"), { ssr: false });

const PROGRESS_EPS = 0.002;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mql.matches);
    onChange();
    mql.addEventListener?.("change", onChange);
    return () => mql.removeEventListener?.("change", onChange);
  }, []);
  return reduced;
}

function useIsMobileLayout() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 768px)");
    const onChange = () => setIsMobile(mql.matches);
    onChange();
    mql.addEventListener?.("change", onChange);
    return () => mql.removeEventListener?.("change", onChange);
  }, []);
  return isMobile;
}

export function EarthScrollSection() {
  const reducedMotion = usePrefersReducedMotion();
  const isMobile = useIsMobileLayout();

  const sectionRef = useRef<HTMLElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastProgress = useRef(0);
  const [progress, setProgress] = useState(0);

  const lite = reducedMotion;
  const effectiveProgress = lite ? 1 : progress;

  const sectionMinHeightVh = useMemo(() => (isMobile ? 560 : 520), [isMobile]);

  useEffect(() => {
    if (lite) return;

    const el = sectionRef.current;
    if (!el) return;

    const update = () => {
      const section = el;
      const rect = section.getBoundingClientRect();
      const total = section.offsetHeight - window.innerHeight;
      const scrolled = Math.min(Math.max(-rect.top, 0), Math.max(0, total));
      const next = total > 0 ? scrolled / total : 0;
      const clamped = clamp(Number.isFinite(next) ? next : 0, 0, 1);

      const prev = lastProgress.current;
      if (Math.abs(clamped - prev) > PROGRESS_EPS) {
        lastProgress.current = clamped;
        setProgress(clamped);
      }
      rafRef.current = null;
    };

    const request = () => {
      if (rafRef.current != null) return;
      rafRef.current = requestAnimationFrame(update);
    };

    request();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
    };
  }, [lite]);

  const showCta = effectiveProgress >= PHASE.finalCta[0];

  const canvasOpacity = useMemo(() => {
    if (lite) return 1;
    return smoothstep(PHASE.bgEarthFade[0], PHASE.bgEarthFade[1], progress);
  }, [lite, progress]);

  /** Затемнение 3D перед HUD (не трогает SVG — отдельный слой под overlay) */
  const earthDimOpacity = useMemo(() => {
    if (lite) return 0.82;
    return smoothstep(PHASE.earthDimHudRussia[0], PHASE.earthDimHudRussia[1] + 0.04, progress) * 0.78;
  }, [lite, progress]);

  return (
    <section
      ref={(node) => {
        sectionRef.current = node;
      }}
      className="earth-scroll-section vx-section-seams"
      style={{ minHeight: `${sectionMinHeightVh}vh` }}
      aria-label="Локация проекта ВОСХОД"
    >
      <div className="earth-scroll-sticky">
        <SpaceBackground isMobile={isMobile} />

        <div className="earth-scroll-canvas-wrap">
          <div className="earth-scroll-canvas-inner" style={{ opacity: canvasOpacity }}>
            {!lite && <EarthScene progress={effectiveProgress} isMobile={isMobile} />}
            {lite && <div className="earth-scroll-canvas-lite" aria-hidden />}
          </div>
          <div
            className="earth-scroll-scene-dim"
            aria-hidden
            style={{ opacity: earthDimOpacity }}
          />
        </div>

        <VoshodGeoOverlay progress={effectiveProgress} isMobile={isMobile} />

        {showCta && (
          <div className="earth-scroll-catalog-button">
            <Link href="/catalog" className="vx-cta-btn" prefetch>
              Перейти в каталог
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
