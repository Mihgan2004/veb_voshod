"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

import { SmoothScrollProvider } from "./SmoothScrollProvider";
import { PhaseOverlays } from "./PhaseOverlays";
import styles from "./earth-scroll-section.module.css";
import { useEarthSectionScrollProgress } from "./useEarthSectionScrollProgress";

/* Canvas — только на клиенте.
 * Внутренний <Suspense fallback={null}> страхует, чтобы chunk-loading
 * EarthCanvas не пробивал родительский Suspense в app/page.tsx. */
const EarthCanvas = dynamic(
  () => import("./EarthCanvas").then((m) => ({ default: m.EarthCanvas })),
  { ssr: false },
);

/**
 * EarthScrollSection
 *
 * Каркас 4-фазной cinematic scroll-анимации:
 *
 *   <section ref={sectionRef} height: 340vh>      ← реальный scroll-range
 *     <div.sticky position: sticky; top: 0>
 *       <div.canvasWrap><Canvas/>                 ← 3D-сцена
 *       <PhaseOverlays/>                          ← HTML/SVG поверх
 *
 * Прогресс скролла — `useEarthSectionScrollProgress(sectionRef)`
 * (аналог framer-motion offset ["start start","end end"], но без View
 * Timeline; совместимо с Lenis через getBoundingClientRect + lenis.on).
 *
 * Критичные размеры дублируются inline-стилями — это страховка на
 * случай, если CSS-модуль не подхватился (например, какая-то новая
 * CSS-фича порвала парсинг Turbopack). Без inline height у секции
 * было бы 0px и useScroll не получил бы scroll-range.
 */
export function EarthScrollSection() {
  const sectionRef = useRef<HTMLElement | null>(null);

  const scrollYProgress = useEarthSectionScrollProgress(sectionRef);

  /* Debug-индикатор прогресса скролла — виден только в development.
   * Позволяет убедиться что useScroll корректно считает 0→1. */
  const isDev = process.env.NODE_ENV === "development";
  const [dbgP, setDbgP] = useState(0);
  useEffect(() => {
    if (!isDev) return;
    const unsub = scrollYProgress.on("change", setDbgP);
    return () => unsub();
  }, [scrollYProgress, isDev]);

  return (
    <SmoothScrollProvider>
      <section
        ref={sectionRef}
        className={styles.section}
        style={{
          position: "relative",
          width: "100%",
          height: "340vh",
          background: "#02050d",
          isolation: "isolate",
        }}
        aria-label="ВОСХОД · Земля · Россия · Московская область · Солнечногорск"
      >
        <div
          className={styles.sticky}
          style={{
            position: "sticky",
            top: 0,
            width: "100%",
            height: "100vh",
            minHeight: "100svh",
            overflow: "hidden",
            background: "#02050d",
          }}
        >
          <div
            className={styles.canvasWrap}
            style={{ position: "absolute", inset: 0, zIndex: 1 }}
          >
            <Suspense fallback={null}>
              <EarthCanvas scrollYProgress={scrollYProgress} />
            </Suspense>
          </div>
          <PhaseOverlays scrollYProgress={scrollYProgress} />

          {/* Debug scroll progress — dev only */}
          {isDev && (
            <div
              style={{
                position: "absolute",
                left: 12,
                bottom: 12,
                zIndex: 999,
                fontFamily: "monospace",
                fontSize: 11,
                color: "rgba(154,216,255,0.9)",
                background: "rgba(0,0,0,0.55)",
                padding: "4px 8px",
                borderRadius: 4,
                pointerEvents: "none",
                letterSpacing: "0.1em",
              }}
            >
              scroll {dbgP.toFixed(3)}
            </div>
          )}
        </div>
      </section>
    </SmoothScrollProvider>
  );
}
