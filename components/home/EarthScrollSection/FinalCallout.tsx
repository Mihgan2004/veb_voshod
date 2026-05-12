"use client";

import React from "react";
import Link from "next/link";
import { motion, useTransform, type MotionValue } from "framer-motion";

import styles from "./earth-scroll-section.module.css";
import {
  calloutDrawProgress,
  calloutLineScaleY,
  calloutTextOpacity,
  ctaOpacity,
  ctaTranslateY,
} from "./earthScrollConfig";

type Props = { scrollYProgress: MotionValue<number> };

export function FinalCallout({ scrollYProgress }: Props) {
  const rootOpacity = useTransform(scrollYProgress, calloutDrawProgress);

  const lineGrow = useTransform(scrollYProgress, calloutLineScaleY);

  const textOpacity = useTransform(scrollYProgress, calloutTextOpacity);

  const ctaOp = useTransform(scrollYProgress, ctaOpacity);

  const ctaY = useTransform(scrollYProgress, ctaTranslateY);

  return (
    <motion.div className={styles.finalCalloutRoot}>
      <div className={styles.finalCalloutGrid}>
        <motion.div
          className={styles.finalCalloutGlowWrap}
          style={{ opacity: rootOpacity }}
        >
          <div className={styles.finalCalloutGlow} />
        </motion.div>

        <motion.div
          className={styles.calloutLineCol}
          style={{ opacity: rootOpacity, scaleY: lineGrow }}
        >
          <div className={styles.calloutLineVert} />
        </motion.div>

        <motion.div className={styles.finalCalloutTextBlock} style={{ opacity: textOpacity }}>
          <div className={styles.finalCalloutTitle}>город Солнечногорск</div>
          <div className={styles.finalCalloutSub}>дислокация проекта ВОСХОД</div>
        </motion.div>
      </div>

      <motion.div className={styles.finalCtaRow} style={{ opacity: ctaOp, y: ctaY }}>
        <Link href="/catalog" className={styles.cta}>
          Перейти в каталог
          <span className={styles.ctaArrow} aria-hidden />
        </Link>
      </motion.div>
    </motion.div>
  );
}
