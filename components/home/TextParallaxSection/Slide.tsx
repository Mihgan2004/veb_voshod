"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { Phrase } from "./Phrase";
import styles from "./text-parallax-section.module.css";

type SlideProps = {
  src?: string;
  label: string;
  accent?: string;
  iconVariant?: "square" | "tall";
  direction: "left" | "right";
  progress: MotionValue<number>;
};

export function Slide({
  src,
  label,
  accent,
  iconVariant,
  direction,
  progress,
}: SlideProps) {
  const sign = direction === "left" ? -1 : 1;
  const x = useTransform(progress, [0, 1], [150 * sign, -150 * sign]);

  return (
    <div className={styles.slideViewport}>
      <motion.div style={{ x }} className={styles.slide}>
        <Phrase src={src} label={label} accent={accent} iconVariant={iconVariant} />
        <Phrase src={src} label={label} accent={accent} iconVariant={iconVariant} />
        <Phrase src={src} label={label} accent={accent} iconVariant={iconVariant} />
      </motion.div>
    </div>
  );
}
