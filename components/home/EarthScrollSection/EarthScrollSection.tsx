"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { RassvetLogoOutline } from "./RassvetLogoOutline";
import styles from "./earth-scroll-section.module.scss";
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

  return (
    <SmoothScroll>
      <main ref={mainRef} className={styles.main}>
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
