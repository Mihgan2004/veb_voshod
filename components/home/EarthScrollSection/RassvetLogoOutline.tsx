"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";

import styles from "./earth-scroll-section.module.scss";
import { logoDrawProgress } from "./earthScrollProgress";
import { RASSVET_TRACED_PATHS, RASSVET_TRACED_VIEWBOX } from "./rassvetTracedPaths";

type Props = {
  scrollYProgress: MotionValue<number>;
};

export function RassvetLogoOutline({ scrollYProgress }: Props) {
  const draw = useTransform(scrollYProgress, (p) => logoDrawProgress(p));

  return (
    <div className={styles.logoWrap}>
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
        <defs>
          <linearGradient id="rassvetGold" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#e8c96e" />
            <stop offset="55%" stopColor="#ffcc00" />
            <stop offset="100%" stopColor="#fff2bc" />
          </linearGradient>
        </defs>
        {RASSVET_TRACED_PATHS.map((pathD, i) => (
          <motion.path
            key={i}
            d={pathD}
            stroke="url(#rassvetGold)"
            strokeWidth={2.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            initial={{ pathLength: 0, opacity: 1 }}
            style={{ pathLength: draw }}
            vectorEffect="nonScalingStroke"
          />
        ))}
      </svg>
    </div>
  );
}
