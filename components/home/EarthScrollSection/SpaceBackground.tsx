"use client";

import React, { useEffect, useMemo, useState } from "react";

export function SpaceBackground({ isMobile }: { isMobile: boolean }) {
  const [isWideDesktop, setIsWideDesktop] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1600px)");
    const onChange = () => setIsWideDesktop(mql.matches);
    onChange();
    mql.addEventListener?.("change", onChange);
    return () => mql.removeEventListener?.("change", onChange);
  }, []);

  const bg = useMemo(() => {
    if (isMobile) return "/textures/space/space-bg-mobile-1080x1920.webp";
    if (isWideDesktop) return "/textures/space/space-bg-2560x1440.webp";
    return "/textures/space/space-bg-1920x1080.webp";
  }, [isMobile, isWideDesktop]);

  return (
    <div className="earth-scroll-bg" aria-hidden>
      {/* eslint-disable @next/next/no-img-element */}
      <img src={bg} alt="" />
      <img className="earth-scroll-vignette" src="/textures/space/space-vignette-1920x1080.png" alt="" />
      {/* eslint-enable @next/next/no-img-element */}
      <div className="earth-scroll-noise" />
    </div>
  );
}

