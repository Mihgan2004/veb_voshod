"use client";

import { useMotionValue, type MotionValue } from "framer-motion";
import { useEffect, type RefObject } from "react";
import { useLenisRef } from "@/components/providers/LenisContext";
import { earthScrollBridge } from "./earthScrollBridge";
import { clamp01 } from "./earthScrollProgress";

/**
 * Прогресс скролла секции — только по событиям scroll/resize (без вечного RAF).
 */
export function useSectionScrollProgress(
  sectionRef: RefObject<HTMLElement | null>
): MotionValue<number> {
  const progress = useMotionValue(0);
  const lenisRef = useLenisRef();

  useEffect(() => {
    let rafId = 0;

    const update = () => {
      const el = sectionRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const viewport = window.innerHeight;
      const scrollRange = el.offsetHeight - viewport;

      if (scrollRange <= 1) {
        earthScrollBridge.set(0);
        progress.set(0);
        return;
      }

      const value = clamp01(-rect.top / scrollRange);
      earthScrollBridge.set(value);
      progress.set(value);
    };

    const scheduleUpdate = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        update();
      });
    };

    update();

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    const lenis = lenisRef?.current;
    lenis?.on?.("scroll", scheduleUpdate);

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      lenis?.off?.("scroll", scheduleUpdate);
      if (rafId) cancelAnimationFrame(rafId);
      earthScrollBridge.set(0);
    };
  }, [sectionRef, progress, lenisRef]);

  return progress;
}
