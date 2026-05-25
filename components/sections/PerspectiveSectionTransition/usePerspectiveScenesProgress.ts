"use client";

import { useEffect, useRef, type RefObject } from "react";
import { useLenisRef } from "@/components/providers/LenisContext";

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

export type SceneSlugPair = {
  currentSlug: string;
  nextSlug: string;
};

export type ActiveSceneChange = {
  slug: string;
  sceneIndex: number;
};

type UsePerspectiveScenesProgressArgs = {
  sceneRefs: RefObject<(HTMLElement | null)[]>;
  scenes: SceneSlugPair[];
  onActiveChange: (payload: ActiveSceneChange) => void;
};

export function usePerspectiveScenesProgress({
  sceneRefs,
  scenes,
  onActiveChange,
}: UsePerspectiveScenesProgressArgs) {
  const lenisRef = useLenisRef();
  const lastSlugRef = useRef("");
  const lastSceneIndexRef = useRef(-1);
  const onActiveChangeRef = useRef(onActiveChange);

  useEffect(() => {
    onActiveChangeRef.current = onActiveChange;
  }, [onActiveChange]);

  useEffect(() => {
    if (scenes.length === 0) return;

    lastSlugRef.current = "";
    lastSceneIndexRef.current = -1;

    let raf = 0;
    let lenisCleanup: (() => void) | undefined;
    let retryId: number | undefined;

    const emitIfChanged = (slug: string, sceneIndex: number) => {
      if (
        slug === lastSlugRef.current &&
        sceneIndex === lastSceneIndexRef.current
      ) {
        return;
      }
      lastSlugRef.current = slug;
      lastSceneIndexRef.current = sceneIndex;
      onActiveChangeRef.current({ slug, sceneIndex });
    };

    const calc = () => {
      const nodes = sceneRefs.current;
      if (!nodes?.length) {
        raf = 0;
        return;
      }

      const vh = window.visualViewport?.height ?? window.innerHeight;
      const viewportCenter = vh / 2;

      let bestIndex = -1;
      let bestDist = Infinity;
      let bestProgress = 0;

      for (let i = 0; i < nodes.length; i++) {
        const scene = nodes[i];
        if (!scene) continue;

        const rect = scene.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > vh) continue;

        const scrollable = rect.height - vh;
        const progress =
          scrollable <= 0 ? 0 : clamp01(-rect.top / scrollable);

        scene.style.setProperty("--p", String(progress));

        const centerY = rect.top + rect.height / 2;
        const dist = Math.abs(centerY - viewportCenter);
        if (dist < bestDist) {
          bestDist = dist;
          bestIndex = i;
          bestProgress = progress;
        }
      }

      if (bestIndex >= 0) {
        const { currentSlug, nextSlug } = scenes[bestIndex];
        const slug = bestProgress < 0.55 ? currentSlug : nextSlug;
        emitIfChanged(slug, bestIndex);
      }

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
    window.visualViewport?.addEventListener("resize", schedule);

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
      window.visualViewport?.removeEventListener("resize", schedule);
      lenisCleanup?.();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [sceneRefs, scenes, lenisRef]);
}
