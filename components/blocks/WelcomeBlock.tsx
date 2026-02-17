"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { MOBILE_MAX_WIDTH } from "@/components/home/HomeScrollContext";

const WelcomeBlockMobile = dynamic(
  () => import("@/components/blocks/WelcomeBlockMobile").then((m) => ({ default: m.WelcomeBlockMobile })),
  { ssr: false }
);

const WelcomeBlockDesktop = dynamic(
  () => import("@/components/blocks/WelcomeBlockDesktop").then((m) => ({ default: m.WelcomeBlockDesktop })),
  { ssr: false }
);

/** Обёртка: загружает только мобильную или только десктопную версию для экономии JS. */
export const WelcomeBlock: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    const check = () => setIsMobile(window.innerWidth <= MOBILE_MAX_WIDTH);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (!mounted) {
    return (
      <section
        id="welcome"
        className="relative w-full bg-[#0B0D10] min-h-[100vh]"
        aria-hidden
      />
    );
  }

  return isMobile ? <WelcomeBlockMobile /> : <WelcomeBlockDesktop />;
};
