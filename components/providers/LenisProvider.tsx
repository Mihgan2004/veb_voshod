"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { LenisReactContext } from "@/components/providers/LenisContext";

export function LenisProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useLayoutEffect(() => {
    const isCoarsePointer =
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: coarse)").matches;

    const instance = new Lenis({
      autoRaf: true,
      smoothWheel: !isCoarsePointer,
      anchors: true,
      stopInertiaOnNavigate: true,
      syncTouch: isCoarsePointer,
    });

    lenisRef.current = instance;

    return () => {
      instance.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <LenisReactContext.Provider value={lenisRef}>{children}</LenisReactContext.Provider>;
}
