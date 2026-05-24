"use client";

import { useRef } from "react";
import { useScroll } from "framer-motion";
import { ASSETS } from "@/lib/assets";
import { TEXT_PARALLAX_SLIDES } from "./config";
import { nfsFont } from "./nfsFont";
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
      <div
        className={styles.background}
        style={{ backgroundImage: `url(${ASSETS.textParallax.background})` }}
        aria-hidden
      />
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
