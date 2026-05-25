"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { useTexture } from "@react-three/drei";
import { useMotionValueEvent, useScroll, type MotionValue } from "framer-motion";
import {
  WAVE_CONFIG_BY_TIER,
  WAVE_IMAGE,
  type WaveViewportTier,
} from "./wave-config";
import styles from "./rassvet-wave-on-scroll.module.css";

const MOBILE_MEDIA = "(max-width: 767px)";
const TABLET_MEDIA = "(min-width: 768px) and (max-width: 1023px)";
const REDUCED_MOTION_MEDIA = "(prefers-reduced-motion: reduce)";

const RassvetWaveScene = dynamic(() => import("./RassvetWaveScene"), {
  ssr: false,
  loading: () => <div className={styles.canvasWrap} aria-hidden />,
});

function subscribeViewportTier(onStoreChange: () => void) {
  const mobile = window.matchMedia(MOBILE_MEDIA);
  const tablet = window.matchMedia(TABLET_MEDIA);
  mobile.addEventListener("change", onStoreChange);
  tablet.addEventListener("change", onStoreChange);
  return () => {
    mobile.removeEventListener("change", onStoreChange);
    tablet.removeEventListener("change", onStoreChange);
  };
}

function getViewportTierSnapshot(): WaveViewportTier {
  if (window.matchMedia(MOBILE_MEDIA).matches) return "mobile";
  if (window.matchMedia(TABLET_MEDIA).matches) return "tablet";
  return "desktop";
}

function subscribeReducedMotion(onStoreChange: () => void) {
  const media = window.matchMedia(REDUCED_MOTION_MEDIA);
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia(REDUCED_MOTION_MEDIA).matches;
}

function getDesktopTierServerSnapshot(): WaveViewportTier {
  return "desktop";
}

function getFalseServerSnapshot() {
  return false;
}

function WaveScrollDebug({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  const labelRef = useRef<HTMLSpanElement>(null);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    if (labelRef.current) {
      labelRef.current.textContent = value.toFixed(2);
    }
  });

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className={styles.devProgress} aria-hidden>
      progress: <span ref={labelRef}>0.00</span>
    </div>
  );
}

export function RassvetWaveOnScroll() {
  const sectionRef = useRef<HTMLElement>(null);
  const tier = useSyncExternalStore(
    subscribeViewportTier,
    getViewportTierSnapshot,
    getDesktopTierServerSnapshot,
  );
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getFalseServerSnapshot,
  );

  const config = WAVE_CONFIG_BY_TIER[tier];

  useEffect(() => {
    useTexture.preload(WAVE_IMAGE);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  return (
    <section
      ref={sectionRef}
      className={`vx-section-seams ${styles.section}`}
      aria-label="Галерея"
    >
      <div className={styles.header}>
        <span className="vx-tag bg-gradient-to-r from-amber-700/70 via-yellow-500/70 to-amber-700/70 bg-[length:200%_100%] animate-gold-shimmer bg-clip-text text-transparent block mb-2.5">
          @РАССВЕТ
        </span>
        <h2 className="vx-section-title">Галерея</h2>
      </div>

      <div className={styles.sticky}>
        <div className={styles.warmGlow} aria-hidden />
        <RassvetWaveScene
          scrollProgress={scrollYProgress}
          config={config}
          reducedMotion={reducedMotion}
        />
        <div className={styles.overlay} aria-hidden>
          <p className={styles.overlayTopLeft}>
            РАССВЕТ
            <br />
            VISUAL CODE
          </p>
          <p className={styles.overlayTopRight}>НЕ ДЛЯ ВСЕХ</p>
          <p className={styles.overlayBottom}>СВОЙ КРУГ</p>
        </div>
        <WaveScrollDebug scrollYProgress={scrollYProgress} />
      </div>
    </section>
  );
}
