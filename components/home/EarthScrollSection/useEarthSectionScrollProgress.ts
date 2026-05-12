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
 * Прогресс скролла по секции с тем же смыслом, что у framer-motion:
 *   offset: ["start start", "end end"]
 *
 *   0 — верх секции у верхнего края viewport
 *   1 — низ секции у нижнего края viewport
 *
 * Считается через `getBoundingClientRect()` — корректно при Lenis
 * (в т. ч. когда View Timeline / useScroll расходится с реальным скроллом).
 *
 * Также держится в синхроне с `lenis.on("scroll")`, если Lenis уже создан.
 */
export function useEarthSectionScrollProgress(
  sectionRef: RefObject<HTMLElement | null>,
): MotionValue<number> {
  const scrollYProgress = useMotionValue(0);
  const lenisRef = useLenisRef();

  useLayoutEffect(() => {
    const compute = (): void => {
      const el = sectionRef.current;
      if (!el) return;

      const vh =
        typeof window !== "undefined"
          ? window.visualViewport?.height ?? window.innerHeight
          : 0;

      const rect = el.getBoundingClientRect();
      const h = rect.height;
      const denom = h - vh;

      if (denom <= 1) {
        scrollYProgress.set(0);
        return;
      }

      /*
       * Когда rect.top === 0   → начало дорожки (прогресс 0).
       * Когда rect.bottom === vh → конец дорожки (прогресс 1).
       * Тождественно: p = -rect.top / (h - vh).
       */
      const raw = -rect.top / denom;
      scrollYProgress.set(clamp01(raw));
    };

    compute();

    let unsubLenis: void | (() => void);

    /*
     * LenisProvider ставит экземпляр в ref в том же использованием
     * useLayoutEffect, но РОДИТЕЛЬ выполняется раньше потомков — к моменту
     * этого эффекта ref уже обычно заполнен.
     */
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
