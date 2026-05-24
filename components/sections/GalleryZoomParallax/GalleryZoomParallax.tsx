"use client";

import { useEffect, useRef } from "react";
import { ASSETS } from "@/lib/assets";
import { useLenisRef } from "@/components/providers/LenisContext";
import styles from "./zoom-parallax.module.scss";
import sectionStyles from "./gallery-zoom-parallax.module.css";

const CENTER_IMAGE = ASSETS.lookbook[0];

const PERIPHERALS = [
  { src: ASSETS.lookbook[1], slot: 2, endScale: 5 },
  { src: ASSETS.lookbook[2], slot: 3, endScale: 6 },
  { src: ASSETS.lookbook[3], slot: 4, endScale: 5 },
  { src: ASSETS.lookbook[4], slot: 5, endScale: 6 },
  { src: ASSETS.lookbook[5], slot: 6, endScale: 8 },
  { src: ASSETS.lookbook[6], slot: 7, endScale: 9 },
] as const;

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function lerp(start: number, end: number, t: number) {
  return start + (end - start) * t;
}

export function GalleryZoomParallax() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  const peripheralRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lenisRef = useLenisRef();

  useEffect(() => {
    const container = containerRef.current;
    const sticky = stickyRef.current;
    if (!container || !sticky) return;

    let raf = 0;
    let lenisCleanup: (() => void) | undefined;
    let retryId: number | undefined;

    const applyZoom = (progress: number) => {
      const center = centerRef.current;
      if (center) {
        center.style.width = `${lerp(25, 100, progress)}vw`;
        center.style.height = `${lerp(25, 100, progress)}svh`;
      }

      peripheralRefs.current.forEach((el, index) => {
        if (!el) return;
        const endScale = PERIPHERALS[index].endScale;
        el.style.transform = `scale(${lerp(1, endScale, progress)})`;
        el.style.opacity = String(clamp01(1 - (progress - 0.2) / 0.35));
      });
    };

    const pinViewport = (rect: DOMRect, vh: number) => {
      const inRange = rect.top <= 0 && rect.bottom >= vh;

      if (inRange) {
        sticky.style.position = "fixed";
        sticky.style.top = "0";
        sticky.style.left = "0";
        sticky.style.width = "100%";
        sticky.style.height = "100svh";
        sticky.style.bottom = "auto";
      } else if (rect.top > 0) {
        sticky.style.position = "relative";
        sticky.style.top = "auto";
        sticky.style.left = "auto";
        sticky.style.width = "100%";
        sticky.style.height = "100svh";
        sticky.style.bottom = "auto";
      } else {
        sticky.style.position = "absolute";
        sticky.style.top = "auto";
        sticky.style.left = "0";
        sticky.style.width = "100%";
        sticky.style.height = "100svh";
        sticky.style.bottom = "0";
      }
    };

    const calc = () => {
      const node = containerRef.current;
      const viewport = stickyRef.current;
      if (!node || !viewport) return;

      const vh = window.innerHeight;
      const rect = node.getBoundingClientRect();
      const scrollable = node.offsetHeight - vh;
      const progress =
        scrollable <= 0 ? 0 : clamp01(-rect.top / scrollable);

      pinViewport(rect, vh);
      applyZoom(progress);
      raf = 0;
    };

    const schedule = () => {
      if (raf) return;
      raf = requestAnimationFrame(calc);
    };

    const attachLenis = () => {
      const lenis = lenisRef?.current;
      if (!lenis) return false;
      lenis.on("scroll", schedule);
      lenisCleanup = () => lenis.off("scroll", schedule);
      return true;
    };

    calc();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    if (!attachLenis()) {
      retryId = window.setInterval(() => {
        if (attachLenis() && retryId !== undefined) {
          window.clearInterval(retryId);
        }
      }, 50);
    }

    return () => {
      if (retryId !== undefined) window.clearInterval(retryId);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      lenisCleanup?.();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [lenisRef]);

  return (
    <section className={`vx-section-seams ${sectionStyles.section}`} aria-label="Галерея">
      <div className={sectionStyles.header}>
        <span className="vx-tag bg-gradient-to-r from-amber-700/70 via-yellow-500/70 to-amber-700/70 bg-[length:200%_100%] animate-gold-shimmer bg-clip-text text-transparent block mb-2.5">
          @VOSHOD
        </span>
        <h2 className="vx-section-title">Галерея</h2>
      </div>

      <div ref={containerRef} className={styles.container}>
        <div ref={stickyRef} className={styles.sticky}>
          {PERIPHERALS.map(({ src, slot }, index) => (
            <div
              key={src}
              ref={(node) => {
                peripheralRefs.current[index] = node;
              }}
              className={`${styles.el} ${styles[`slot${slot}`]}`}
            >
              <div className={styles.imageContainer}>
                {/* eslint-disable-next-line @next/next/no-img-element -- zoom parallax */}
                <img src={src} alt="" className={styles.image} decoding="async" draggable={false} />
              </div>
            </div>
          ))}

          <div
            ref={centerRef}
            className={styles.centerEl}
            style={{ backgroundImage: `url(${CENTER_IMAGE})` }}
            role="img"
            aria-label="Галерея"
          />
        </div>
      </div>
    </section>
  );
}
