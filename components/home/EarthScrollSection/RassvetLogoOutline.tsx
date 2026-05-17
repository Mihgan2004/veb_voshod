"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";

import styles from "./earth-scroll-section.module.scss";
import { logoDrawProgress } from "./earthScrollProgress";
import { RASSVET_TRACED_PATHS, RASSVET_TRACED_VIEWBOX } from "./rassvetTracedPaths";

const LOGO_STROKE = "#e8b840";

type Props = {
  scrollYProgress: MotionValue<number>;
};

export function RassvetLogoOutline({ scrollYProgress }: Props) {
  const draw = useTransform(scrollYProgress, (p) => logoDrawProgress(p));

  return (
    <motion.div className={styles.logoWrap}>
      <svg
        className={styles.logoSvg}
        viewBox={RASSVET_TRACED_VIEWBOX}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="РАССВЕТ"
        role="img"
        preserveAspectRatio="xMidYMid meet"
      >
        <title>РАССВЕТ</title>
        {RASSVET_TRACED_PATHS.map((pathD, i) => (
          <motion.path
            key={i}
            d={pathD}
            stroke={LOGO_STROKE}
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            initial={{ pathLength: 0 }}
            style={{ pathLength: draw }}
            vectorEffect="nonScalingStroke"
          />
        ))}
      </svg>
    </motion.div>
  );
}
