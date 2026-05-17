"use client";

import { useEffect, type RefObject } from "react";

/**
 * Горизонтальная карусель: вертикальное колесо уходит на скролл страницы (Lenis),
 * горизонтальный жест трекпада — прокрутка ленты.
 * Не использовать data-lenis-prevent — он блокирует вертикальный скролл над фото.
 */
export function useHorizontalCarouselWheel(
  scrollRef: RefObject<HTMLElement | null>
) {
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth + 1) return;

      const absX = Math.abs(e.deltaX);
      const absY = Math.abs(e.deltaY);

      if (absX <= absY) return;

      e.preventDefault();
      el.scrollLeft += e.deltaX;
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [scrollRef]);
}
