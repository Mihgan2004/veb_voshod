"use client";

import React from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";

import styles from "./earth-scroll-section.module.css";
import { MAP_ASSETS } from "./earthScrollConfig";
import {
  russiaExitOpacity,
  russiaExitScale,
  russiaExitTranslateXMul,
  russiaExitTranslateYMul,
  russiaHudBlurPx,
  russiaHudOpacity,
  russiaHudScaleEnter,
  russiaHudTranslateYFrac,
} from "./earthScrollConfig";

type Props = { scrollYProgress: MotionValue<number> };

export function RussiaMotionLayer({ scrollYProgress }: Props) {
  const opacity = useTransform(scrollYProgress, (p) => russiaHudOpacity(p) * russiaExitOpacity(p));

  const scale = useTransform(scrollYProgress, (p) => russiaHudScaleEnter(p) * russiaExitScale(p));

  const tx = useTransform(scrollYProgress, (p) => -18 * russiaExitTranslateXMul(p));

  const ty = useTransform(
    scrollYProgress,
    (p) =>
      8 * (1 - russiaHudTranslateYFrac(p)) +
      8 * russiaExitTranslateYMul(p),
  );

  const tf = useTransform([tx, ty, scale], ([x, y, sc]) =>
    `translate3d(calc(${Number(x)}vw), calc(${Number(y)}vh), 0) scale(${Number(sc).toFixed(3)})`,
  );

  const blurPx = useTransform(scrollYProgress, russiaHudBlurPx);

  const filter = useTransform(blurPx, (bpx) =>
    typeof bpx === "number" && bpx > 0.06 ? `blur(${Math.min(8, bpx).toFixed(2)}px)` : "blur(0px)",
  );

  return (
    <div className={styles.russiaLayer}>
      <motion.div
        className={styles.russiaHudInner}
        style={{ opacity, filter, transform: tf, willChange: "transform, opacity, filter" }}
      >
        <div className={styles.russiaHudFrame}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={MAP_ASSETS.russiaMarked} alt="" className={styles.hudSvgImage} draggable={false} />
        </div>
      </motion.div>
    </div>
  );
}
