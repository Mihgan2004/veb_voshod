"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { ASSETS } from "@/lib/assets";
import styles from "./text-parallax-section.module.css";

type BackgroundVerticalMarqueeProps = {
  progress: MotionValue<number>;
};

function BackgroundArt() {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- фоновая WebP с прозрачностью
    <img
      src={ASSETS.textParallax.backgroundVertical}
      alt=""
      className={styles.backgroundArt}
      decoding="async"
      draggable={false}
    />
  );
}

/** Вертикальный аналог Slide: три копии + смещение по скроллу, как текст по горизонтали. */
export function BackgroundVerticalMarquee({ progress }: BackgroundVerticalMarqueeProps) {
  const y = useTransform(progress, [0, 1], [-150, 150]);

  return (
    <div className={styles.backgroundViewport} aria-hidden>
      <motion.div style={{ y }} className={styles.backgroundScrollLayer}>
        <div className={styles.backgroundTrack}>
          <BackgroundArt />
          <BackgroundArt />
          <BackgroundArt />
        </div>
      </motion.div>
    </div>
  );
}
