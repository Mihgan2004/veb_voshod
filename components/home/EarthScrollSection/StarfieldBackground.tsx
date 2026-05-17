"use client";

import { useEffect, useRef } from "react";

import { getEarthSceneProfile } from "./earthSceneProfile";
import styles from "./earth-scroll-section.module.scss";

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Чёрный фон + звёзды (без синего градиента). Рисуется один раз при resize. */
export function StarfieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const paint = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w < 2 || h < 2) return;

      const profile = getEarthSceneProfile();
      const dpr = profile.isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 1.75);

      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, w, h);

      const rand = mulberry32(42);
      for (let i = 0; i < profile.starCount; i++) {
        const x = rand() * w;
        const y = rand() * h;
        const r = rand() < 0.92 ? 0.35 + rand() * 0.45 : 0.75 + rand() * 0.5;
        const a = 0.18 + rand() * 0.55;
        ctx.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`;
        ctx.fillRect(x, y, r, r);
      }
    };

    const ro = new ResizeObserver(() => requestAnimationFrame(paint));
    ro.observe(canvas);
    paint();

    return () => ro.disconnect();
  }, []);

  return <canvas ref={canvasRef} className={styles.starfield} aria-hidden />;
}
