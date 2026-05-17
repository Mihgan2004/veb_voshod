"use client";

import { useEffect, useRef } from "react";

import styles from "./earth-scroll-section.module.scss";

/** Тихий звёздный фон под WebGL: градиент + случайные точки, перерисовка при resize/DPR. */
export function StarfieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const paint = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w < 2 || h < 2) return;

      const dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const g = ctx.createRadialGradient(w * 0.5, 0, 0, w * 0.45, h * 0.55, Math.max(w, h) * 0.95);
      g.addColorStop(0, "#10121c");
      g.addColorStop(0.38, "#07080e");
      g.addColorStop(1, "#020204");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      const count = Math.min(1400, Math.floor((w * h) / 2200));
      const stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() < 0.9 ? 0.3 + Math.random() * 0.55 : 0.9 + Math.random() * 1.1,
        a: 0.12 + Math.random() * 0.72,
      }));

      for (const s of stars) {
        ctx.beginPath();
        ctx.fillStyle = `rgba(220, 228, 255, ${s.a})`;
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ro = new ResizeObserver(() => {
      requestAnimationFrame(paint);
    });
    ro.observe(canvas);
    paint();

    return () => ro.disconnect();
  }, []);

  return <canvas ref={canvasRef} className={styles.starfield} aria-hidden />;
}
