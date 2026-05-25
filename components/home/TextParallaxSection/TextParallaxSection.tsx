"use client";

import { useRef } from "react";
import { useScroll } from "framer-motion";
import { TEXT_PARALLAX_SLIDES } from "./config";
import { nfsFont } from "./nfsFont";
import { BackgroundVerticalMarquee } from "./BackgroundVerticalMarquee";
import { Slide } from "./Slide";
import styles from "./text-parallax-section.module.css";

export function TextParallaxSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  return (
    <section
      className={`${styles.section} ${nfsFont.variable}`}
      aria-label="Text parallax"
    >
      <div className={styles.background} aria-hidden>
        <BackgroundVerticalMarquee progress={scrollYProgress} />
      </div>
      <div className={styles.backgroundOverlay} aria-hidden />

      <div className={styles.content}>
        <div className={styles.topSpacer} aria-hidden />
        <div ref={containerRef} className={styles.container}>
          {TEXT_PARALLAX_SLIDES.map((slide) => (
            <Slide
              key={slide.label}
              src={slide.src}
              label={slide.label}
              accent={slide.accent}
              iconVariant={slide.iconVariant}
              direction={slide.direction}
              progress={scrollYProgress}
            />
          ))}
        </div>
        <div className={styles.spacer} aria-hidden />
      </div>
    </section>
  );
}
