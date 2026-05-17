"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { RassvetLogoOutline } from "./RassvetLogoOutline";
import styles from "./earth-scroll-section.module.scss";
import { getEarthSceneProfile } from "./earthSceneProfile";
import { StarfieldBackground } from "./StarfieldBackground";
import SmoothScroll from "./SmoothScroll";
import { useSectionScrollProgress } from "./useSectionScrollProgress";

const EarthCanvas = dynamic(() => import("./earth/EarthCanvas"), {
  ssr: false,
  loading: () => (
    // eslint-disable-next-line @next/next/no-img-element -- плейсхолдер до Canvas
    <img
      src="/olivier-earth/assets/placeholder.png"
      alt=""
      className={styles.loadingImage}
      aria-hidden
    />
  ),
});

export function EarthScrollSection() {
  const mainRef = useRef<HTMLElement>(null);
  const scrollYProgress = useSectionScrollProgress(mainRef);
  const [scrollSpanVh, setScrollSpanVh] = useState(480);

  useEffect(() => {
    const apply = () => setScrollSpanVh(getEarthSceneProfile().scrollSpanVh);
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);

  return (
    <SmoothScroll>
      <main
        ref={mainRef}
        className={styles.main}
        style={{ ["--earth-scroll-span" as string]: `${scrollSpanVh}vh` }}
      >
        <div className={styles.stickyScene}>
          <StarfieldBackground />
          <div className={styles.earthLayer}>
            <EarthCanvas />
          </div>
          <div className={styles.logoOverlay}>
            <RassvetLogoOutline scrollYProgress={scrollYProgress} />
          </div>
        </div>
      </main>
    </SmoothScroll>
  );
}
