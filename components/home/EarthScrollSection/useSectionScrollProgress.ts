"use client";

import { useMotionValue, type MotionValue } from "framer-motion";
import { useEffect, type RefObject } from "react";
import { useLenisRef } from "@/components/providers/LenisContext";
import { earthScrollBridge } from "./earthScrollBridge";
import { clamp01 } from "./earthScrollProgress";

/**
 * Прогресс прокрутки секции для лого (MotionValue) и для Earth (earthScrollBridge).
 */
export function useSectionScrollProgress(
  sectionRef: RefObject<HTMLElement | null>
): MotionValue<number> {
  const progress = useMotionValue(0);
  const lenisRef = useLenisRef();

  useEffect(() => {
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

    update();

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    let rafId = 0;
    const tick = () => {
      update();
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    const lenis = lenisRef?.current;
    lenis?.on?.("scroll", update);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      cancelAnimationFrame(rafId);
      lenis?.off?.("scroll", update);
      earthScrollBridge.set(0);
    };
  }, [sectionRef, progress, lenisRef]);

  return progress;
}
