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

export function Preloader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const liteMode = useLiteMode();
  const [visible, setVisible] = useState(isHome);
  const [phase, setPhase] = useState<"show" | "hide">("show");

  useEffect(() => {
    if (!isHome) {
      setVisible(false);
      return;
    }

    const skip = typeof window !== "undefined" && sessionStorage.getItem(SKIP_KEY);
    if (skip) {
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
        }, 450);
      }, remaining);
    };

    if (document.readyState === "complete") {
      finish();
    } else {
      window.addEventListener("load", finish);
      return () => window.removeEventListener("load", finish);
    }
  }, [isHome, liteMode]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] grid place-items-center bg-black transition-opacity duration-500 ease-out ${
        phase === "hide" ? "opacity-0" : "opacity-100"
      }`}
      style={{ pointerEvents: visible ? "auto" : "none" }}
      aria-hidden
    >
      <div className="text-white flex items-center justify-center">
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
          <LogoDraw variant="gold" hideFrame className="w-[140px] md:w-[180px]" />
        )}
      </div>
    </div>
  );
}
