"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

export const MOBILE_MAX_WIDTH = 768;

type HomeScrollContextValue = {
  /** На мобилке: юзер дошёл до низа и поднимается вверх — короткий скролл, анимации в финальном состоянии */
  compact: boolean;
  /** На мобилке: юзер пролистал вниз — отключаем тяжёлые анимации для устранения лагов/галлюцинаций */
  animationsDisabled: boolean;
  isMobile: boolean;
};

const HomeScrollContext = createContext<HomeScrollContextValue>({
  compact: false,
  animationsDisabled: false,
  isMobile: false,
});

const BOTTOM_THRESHOLD = 180;
/** После скролла ниже — выключаем анимации на мобилке (1.5 высоты экрана) */
const ANIMATIONS_DISABLE_SCROLL_VH = 1.5;

export function useHomeScrollCompact() {
  return useContext(HomeScrollContext);
}

export function HomeScrollProvider({ children }: { children: React.ReactNode }) {
  const [compact, setCompact] = useState(false);
  const [animationsDisabled, setAnimationsDisabled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const hasReachedBottom = useRef(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const lastUpdate = useRef(0);
  const prevAnimDisabled = useRef(false);
  const prevMobile = useRef(false);

  const update = useCallback(() => {
    if (typeof window === "undefined") return;
    const isMobileNow = window.innerWidth <= MOBILE_MAX_WIDTH;

    if (!isMobileNow) {
      if (prevAnimDisabled.current) {
        setAnimationsDisabled(false);
        prevAnimDisabled.current = false;
      }
      if (prevMobile.current) {
        setIsMobile(false);
        prevMobile.current = false;
      }
      lastScrollY.current = window.scrollY;
      lastUpdate.current = Date.now();
      ticking.current = false;
      return;
    }

    if (!prevMobile.current) {
      setIsMobile(true);
      prevMobile.current = true;
    }

    const scrollY = window.scrollY;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const vh = window.innerHeight;

    if (scrollHeight <= 0) {
      ticking.current = false;
      return;
    }

    const animDisabled = scrollY > vh * ANIMATIONS_DISABLE_SCROLL_VH;
    if (animDisabled !== prevAnimDisabled.current) {
      setAnimationsDisabled(animDisabled);
      prevAnimDisabled.current = animDisabled;
    }

    if (scrollY + BOTTOM_THRESHOLD >= scrollHeight) {
      hasReachedBottom.current = true;
    }

    if (hasReachedBottom.current && scrollY < lastScrollY.current && scrollY < scrollHeight * 0.5) {
      setCompact(true);
    }

    lastScrollY.current = scrollY;
    lastUpdate.current = Date.now();
    ticking.current = false;
  }, []);

  useEffect(() => {
    // Throttle: 150ms — меньше обновлений = плавнее скролл, меньше дёрганий
    const throttleMs = 150;
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      const elapsed = Date.now() - lastUpdate.current;
      if (elapsed >= throttleMs) {
        requestAnimationFrame(update);
      } else {
        requestAnimationFrame(() => {
          setTimeout(() => requestAnimationFrame(update), throttleMs - elapsed);
        });
      }
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
    <HomeScrollContext.Provider value={{ compact, animationsDisabled, isMobile }}>
      {children}
    </HomeScrollContext.Provider>
  );
}
