"use client";

import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { DarkVeil, type DarkVeilProps } from "./DarkVeil";
import styles from "./rassvet-dark-veil.module.css";

const MOBILE_MEDIA = "(max-width: 768px)";
const REDUCED_MOTION_MEDIA = "(prefers-reduced-motion: reduce)";

export type RassvetDarkVeilVariant = "collections" | "gallery" | "manifesto";

export type RassvetDarkVeilProps = {
  children: ReactNode;
  variant?: RassvetDarkVeilVariant;
};

function subscribeMedia(query: string, onStoreChange: () => void) {
  const media = window.matchMedia(query);
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function getMobileSnapshot() {
  return window.matchMedia(MOBILE_MEDIA).matches;
}

function getReducedMotionSnapshot() {
  return window.matchMedia(REDUCED_MOTION_MEDIA).matches;
}

function getServerSnapshot() {
  return false;
}

function getVariantClass(variant: RassvetDarkVeilVariant) {
  if (variant === "gallery") return styles.gallery;
  if (variant === "manifesto") return styles.manifesto;
  return styles.collections;
}

function getDarkVeilProps(variant: RassvetDarkVeilVariant): DarkVeilProps {
  if (variant === "manifesto") {
    return {
      speed: 0.18,
      hueShift: 18,
      noiseIntensity: 0.025,
      scanlineIntensity: 0.028,
      scanlineFrequency: 760,
      warpAmount: 0.1,
      resolutionScale: 0.7,
    };
  }

  if (variant === "gallery") {
    return {
      speed: 0.26,
      hueShift: 20,
      noiseIntensity: 0.032,
      scanlineIntensity: 0.038,
      scanlineFrequency: 720,
      warpAmount: 0.14,
      resolutionScale: 0.75,
    };
  }

  return {
    speed: 0.32,
    hueShift: 24,
    noiseIntensity: 0.038,
    scanlineIntensity: 0.042,
    scanlineFrequency: 680,
    warpAmount: 0.18,
    resolutionScale: 0.8,
  };
}

export function RassvetDarkVeil({
  children,
  variant = "collections",
}: RassvetDarkVeilProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  const isMobile = useSyncExternalStore(
    useCallback((onStoreChange) => subscribeMedia(MOBILE_MEDIA, onStoreChange), []),
    getMobileSnapshot,
    getServerSnapshot,
  );

  const reducedMotion = useSyncExternalStore(
    useCallback(
      (onStoreChange) => subscribeMedia(REDUCED_MOTION_MEDIA, onStoreChange),
      [],
    ),
    getReducedMotionSnapshot,
    getServerSnapshot,
  );

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(Boolean(entry?.isIntersecting));
      },
      { rootMargin: "120px 0px", threshold: 0.01 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const showCanvas = !isMobile && !reducedMotion && inView;
  const darkVeilProps = getDarkVeilProps(variant);

  return (
    <section
      ref={sectionRef}
      className={`${styles.section} ${getVariantClass(variant)}`}
    >
      <div className={styles.backdrop} aria-hidden>
        {showCanvas ? (
          <div className={styles.canvasLayer}>
            <DarkVeil {...darkVeilProps} active={inView} />
          </div>
        ) : null}
        <div className={styles.mobileFallback} />
        <div className={styles.warmGlow} />
        <div className={styles.vignette} />
        <div className={styles.noise} />
      </div>
      <div className={styles.content}>{children}</div>
    </section>
  );
}
