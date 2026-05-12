"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

import { SmoothScrollProvider } from "./SmoothScrollProvider";
import { MapMotionLayer } from "./MapMotionLayer";
import styles from "./earth-scroll-section.module.css";
import { useEarthSectionScrollProgress } from "./useEarthSectionScrollProgress";

const EarthCanvas = dynamic(
  () => import("./EarthCanvas").then((m) => ({ default: m.EarthCanvas })),
  { ssr: false },
);

/** Pinned блок: desktop 520vh / mobile 560vh; прогресс через sectionRef только. */
export function EarthScrollSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const scrollYProgress = useEarthSectionScrollProgress(sectionRef);

  const isDev = process.env.NODE_ENV === "development";
  const [dbgP, setDbgP] = useState(0);
  useEffect(() => {
    if (!isDev) return;
    let last = -1;
    const unsub = scrollYProgress.on("change", (v) => {
      if (Math.abs(v - last) < 0.002) return;
      last = v;
      setDbgP(v);
    });
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
          background: "#02050d",
          isolation: "isolate",
        }}
        aria-label="Земля, Россия, Московская область, город Солнечногорск"
      >
        <div className={styles.stickyWrap}>
          <div className={styles.canvasWrap}>
            <Suspense fallback={null}>
              <EarthCanvas scrollYProgress={scrollYProgress} />
            </Suspense>
          </div>

          <MapMotionLayer scrollYProgress={scrollYProgress} />

          {isDev && (
            <div className={styles.scrollDebug}>scroll {dbgP.toFixed(3)}</div>
          )}
        </div>
      </section>
    </SmoothScrollProvider>
  );
}
