"use client";

import type { RefObject } from "react";
import { useLayoutEffect } from "react";
import { useMotionValue, type MotionValue } from "framer-motion";

import { useLenisRef } from "@/components/providers/LenisContext";

function clamp01(t: number): number {
  if (!Number.isFinite(t)) return 0;
  return t < 0 ? 0 : t > 1 ? 1 : t;
}

/**
 * Прогресс pinned-секции: строго 0 когда верх у верха viewport,
 * 1 когда последний скролл через (offsetHeight − innerHeight).
 * Совместимо с Lenis через lenis.on + window scroll на всякий случай.
 */
export function useEarthSectionScrollProgress(
  sectionRef: RefObject<HTMLElement | null>,
): MotionValue<number> {
  const scrollYProgress = useMotionValue(0);
  const lenisRef = useLenisRef();

  useLayoutEffect(() => {
    const compute = (): void => {
      const el = sectionRef.current;
      if (!el || typeof window === "undefined") return;

      const vh = window.visualViewport?.height ?? window.innerHeight;
      const total = Math.max(el.offsetHeight - vh, 0);
      const rect = el.getBoundingClientRect();

      if (total <= 0) {
        scrollYProgress.set(0);
        return;
      }

      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      scrollYProgress.set(clamp01(scrolled / total));
    };

    compute();

    let unsubLenis: void | (() => void);

    const lenis = lenisRef?.current ?? null;
    if (lenis) {
      unsubLenis = lenis.on("scroll", compute);
    }

    window.addEventListener("scroll", compute, { passive: true });
    window.addEventListener("resize", compute, { passive: true });
    const vv = window.visualViewport;
    vv?.addEventListener("resize", compute, { passive: true });

    return () => {
      unsubLenis?.();
      window.removeEventListener("scroll", compute);
      window.removeEventListener("resize", compute);
      vv?.removeEventListener("resize", compute);
    };
  }, [sectionRef, lenisRef, scrollYProgress]);

  return scrollYProgress;
}
