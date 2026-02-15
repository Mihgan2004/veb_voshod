"use client";

import { useEffect, useState } from "react";

/**
 * Обнаруживает слабые/встроенные браузеры (Telegram, in-app WebView),
 * где тяжёлые эффекты вызывают лаги, серые квадраты и фризы.
 * Включает облегчённый режим: без feTurbulence, backdrop-blur, анимаций blur.
 */
export function useLiteMode(): boolean {
  const [lite, setLite] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const ua = navigator.userAgent.toLowerCase();
    const isTelegram = ua.includes("telegram");
    const isInAppWebView =
      ua.includes("wv") ||
      (ua.includes("android") && ua.includes("version/")) ||
      ua.includes("fb_iab") ||
      ua.includes("insta");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as { connection?: { saveData?: boolean } }).connection?.saveData;
    const isMobile = window.innerWidth <= 768;

    const shouldLite =
      isTelegram ||
      (isInAppWebView && isMobile) ||
      prefersReducedMotion ||
      saveData;

    setLite(shouldLite);

    if (shouldLite) {
      document.documentElement.setAttribute("data-lite", "true");
    } else {
      document.documentElement.removeAttribute("data-lite");
    }

    return () => document.documentElement.removeAttribute("data-lite");
  }, []);

  return lite;
}
