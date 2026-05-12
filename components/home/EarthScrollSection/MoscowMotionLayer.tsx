"use client";

import React from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";

import styles from "./earth-scroll-section.module.css";
import { MAP_ASSETS } from "./earthScrollConfig";
import {
  moscowExitOpacity,
  moscowExitScale,
  moscowExitTranslateXMul,
  moscowExitTranslateYMul,
  moscowHudOpacity,
  moscowHudScaleEnter,
  moscowHudTranslateYFrac,
} from "./earthScrollConfig";

type Props = { scrollYProgress: MotionValue<number> };

export function MoscowMotionLayer({ scrollYProgress }: Props) {
  const opacity = useTransform(scrollYProgress, (p) => moscowHudOpacity(p) * moscowExitOpacity(p));

  const scale = useTransform(scrollYProgress, (p) => moscowHudScaleEnter(p) * moscowExitScale(p));

  const tx = useTransform(scrollYProgress, (p) => 10 * moscowExitTranslateXMul(p));

  const ty = useTransform(
    scrollYProgress,
    (p) =>
      -5 * (1 - moscowHudTranslateYFrac(p)) + 14 * moscowExitTranslateYMul(p),
  );

  const tf = useTransform([tx, ty, scale], ([x, y, sc]) =>
    `translate3d(calc(${Number(x)}vw), calc(${Number(y)}vh), 0) scale(${Number(sc).toFixed(3)})`,
  );

  return (
    <div className={styles.moscowLayer}>
      <motion.div className={styles.moscowHudInner} style={{ opacity }}>
        <motion.div style={{ transform: tf, willChange: "transform" }}>
          <div className={styles.moscowHudFrame}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={MAP_ASSETS.moscowMarked} alt="" className={styles.hudSvgImage} draggable={false} />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
