"use client";

import React from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";

import styles from "./earth-scroll-section.module.css";
import { MAP_ASSETS } from "./earthScrollConfig";
import { solHudOpacity, solHudScaleEnter, solHudTranslateYFrac } from "./earthScrollConfig";

type Props = { scrollYProgress: MotionValue<number> };

export function SolnechnogorskMotionLayer({ scrollYProgress }: Props) {
  const opacity = useTransform(scrollYProgress, solHudOpacity);

  const scale = useTransform(scrollYProgress, solHudScaleEnter);

  const moveYFrac = useTransform(scrollYProgress, solHudTranslateYFrac);

  const ty = useTransform(moveYFrac, (f) => 4 * (1 - Number(f)));

  const tf = useTransform([ty, scale], ([yvh, sc]) =>
    `translate3d(-4vw, calc(${Number(yvh)}vh), 0) scale(${Number(sc).toFixed(3)})`,
  );

  return (
    <div className={styles.solLayer}>
      <motion.div className={styles.solHudInner} style={{ opacity }}>
        <motion.div style={{ transform: tf, willChange: "transform" }}>
          <div className={styles.solHudFrame}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={MAP_ASSETS.solnechnogorsk} alt="" className={styles.hudSvgImage} draggable={false} />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
