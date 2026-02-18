"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { LogoDraw } from "@/components/brand/LogoDraw";
import { ASSETS } from "@/lib/assets";
import { useLiteMode } from "@/lib/useLiteMode";

const MIN_DURATION_MS = 2800;
const LITE_DURATION_MS = 800;
const SKIP_KEY = "voshod-preloader-seen";
const INITIAL_PATH_KEY = "voshod-initial-path";

/** Прелоадер: плавная отрисовка при первом заходе на главную; при переходах (каталог и др.) — тёмный фон без белого мигания. */
export function Preloader() {
  const pathname = usePathname();
  const liteMode = useLiteMode();
  const [visible, setVisible] = useState(() => pathname === "/");
  const [phase, setPhase] = useState<"show" | "hide">("show");

  useEffect(() => {
    if (typeof window === "undefined") return;

    let initialPath = sessionStorage.getItem(INITIAL_PATH_KEY);
    if (initialPath === null) {
      sessionStorage.setItem(INITIAL_PATH_KEY, pathname);
      initialPath = pathname;
    }

    const isFirstLoadToHome = initialPath === "/" && pathname === "/";
    const alreadySeen = sessionStorage.getItem(SKIP_KEY);
    if (!isFirstLoadToHome || alreadySeen) {
      setVisible(false);
      return;
    }

    setVisible(true);
    const start = Date.now();
    const duration = liteMode ? LITE_DURATION_MS : MIN_DURATION_MS;

    const finish = () => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, duration - elapsed);
      setTimeout(() => {
        setPhase("hide");
        setTimeout(() => {
          setVisible(false);
          sessionStorage.setItem(SKIP_KEY, "1");
        }, 500);
      }, remaining);
    };

    if (document.readyState === "complete") {
      finish();
    } else {
      window.addEventListener("load", finish);
      return () => window.removeEventListener("load", finish);
    }
  }, [pathname, liteMode]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] grid place-items-center bg-[#0b0d10] transition-opacity duration-500 ease-out vx-preloader-overlay"
      style={{
        opacity: phase === "hide" ? 0 : 1,
        pointerEvents: visible ? "auto" : "none",
      }}
      aria-hidden
    >
      <div className="vx-preloader-logo flex items-center justify-center">
        {liteMode ? (
          <Image
            src={ASSETS.brand.logoDesktop}
            alt="VOSKHOD"
            width={280}
            height={80}
            className="w-[140px] md:w-[180px] h-auto object-contain"
            priority
          />
        ) : (
          <LogoDraw
            variant="gold"
            hideFrame
            className="w-[140px] md:w-[180px] vx-logo-preloader-draw"
          />
        )}
      </div>
    </div>
  );
}
