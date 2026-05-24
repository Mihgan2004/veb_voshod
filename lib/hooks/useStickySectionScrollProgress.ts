"use client";

import { useEffect, type RefObject } from "react";
import { useMotionValue, type MotionValue } from "framer-motion";
import { useLenisRef } from "@/components/providers/LenisContext";

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

export function useStickySectionScrollProgress(
  targetRef: RefObject<HTMLElement | null>,
): MotionValue<number> {
  const progress = useMotionValue(0);
  const lenisRef = useLenisRef();

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;

    let raf = 0;
    let lenisCleanup: (() => void) | undefined;
    let retryId: number | undefined;

    const calc = () => {
      const node = targetRef.current;
      if (!node) return;

      const vh = window.innerHeight;
      const scrollable = node.offsetHeight - vh;
      if (scrollable <= 0) {
        progress.set(0);
        raf = 0;
        return;
      }

      const rect = node.getBoundingClientRect();
      progress.set(clamp01(-rect.top / scrollable));
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
  }, [targetRef, lenisRef, progress]);

  return progress;
}
