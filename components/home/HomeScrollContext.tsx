"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

type HomeScrollContextValue = {
  /** На мобилке: юзер дошёл до низа и поднимается вверх — короткий скролл, анимации в финальном состоянии */
  compact: boolean;
};

const HomeScrollContext = createContext<HomeScrollContextValue>({ compact: false });

const BOTTOM_THRESHOLD = 180;
const MOBILE_MAX_WIDTH = 768;

export function useHomeScrollCompact() {
  return useContext(HomeScrollContext);
}

export function HomeScrollProvider({ children }: { children: React.ReactNode }) {
  const [compact, setCompact] = useState(false);
  const hasReachedBottom = useRef(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  const update = useCallback(() => {
    if (typeof window === "undefined") return;
    const isMobile = window.innerWidth <= MOBILE_MAX_WIDTH;
    if (!isMobile) return;

    const scrollY = window.scrollY;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;

    if (scrollHeight <= 0) return;

    if (scrollY + BOTTOM_THRESHOLD >= scrollHeight) {
      hasReachedBottom.current = true;
    }

    if (hasReachedBottom.current && scrollY < lastScrollY.current && scrollY < scrollHeight * 0.5) {
      setCompact(true);
    }

    lastScrollY.current = scrollY;
    ticking.current = false;
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    update();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  return (
    <HomeScrollContext.Provider value={{ compact }}>
      {children}
    </HomeScrollContext.Provider>
  );
}
