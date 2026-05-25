"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "lenis/dist/lenis.css";
import { LenisReactContext } from "@/components/providers/LenisContext";

export function LenisProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const isCoarsePointer =
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: coarse)").matches;

    const instance = new Lenis({
      autoRaf: false,
      smoothWheel: !isCoarsePointer,
      anchors: true,
      stopInertiaOnNavigate: true,
      syncTouch: isCoarsePointer,
    });

    lenisRef.current = instance;

    instance.on("scroll", ScrollTrigger.update);

    const onTick = (time: number) => {
      instance.raf(time * 1000);
    };
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    ScrollTrigger.scrollerProxy(document.documentElement, {
      scrollTop(value) {
        if (arguments.length && typeof value === "number") {
          if (isCoarsePointer) {
            window.scrollTo(0, value);
          } else {
            instance.scrollTo(value, { immediate: true });
          }
        }
        return isCoarsePointer ? window.scrollY : instance.scroll;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
    });

    const onRefresh = () => instance.resize();
    ScrollTrigger.addEventListener("refresh", onRefresh);

    const refreshId = requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      cancelAnimationFrame(refreshId);
      gsap.ticker.remove(onTick);
      instance.off("scroll", ScrollTrigger.update);
      ScrollTrigger.removeEventListener("refresh", onRefresh);
      ScrollTrigger.scrollerProxy(document.documentElement, {});
      ScrollTrigger.clearScrollMemory();
      instance.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <LenisReactContext.Provider value={lenisRef}>{children}</LenisReactContext.Provider>;
}
