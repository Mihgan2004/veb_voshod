"use client";

import { useCallback, useRef } from "react";

const SWIPE_MIN_PX = 72;
const SWIPE_RATIO = 1.4;

export function useSwipeRightNavigate(onSwipe: () => void, enabled = true) {
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = useCallback((event: React.TouchEvent) => {
    if (!enabled) return;
    const touch = event.touches[0];
    if (!touch) return;
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  }, [enabled]);

  const onTouchEnd = useCallback(
    (event: React.TouchEvent) => {
      if (!enabled) return;

      const start = touchStart.current;
      touchStart.current = null;
      if (!start) return;

      const touch = event.changedTouches[0];
      if (!touch) return;

      const dx = touch.clientX - start.x;
      const dy = touch.clientY - start.y;

      if (dx >= SWIPE_MIN_PX && dx > Math.abs(dy) * SWIPE_RATIO) {
        onSwipe();
      }
    },
    [enabled, onSwipe]
  );

  return { onTouchStart, onTouchEnd };
}
