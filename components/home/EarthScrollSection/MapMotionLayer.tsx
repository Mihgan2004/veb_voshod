"use client";

import React from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";

import styles from "./earth-scroll-section.module.css";
import { heroTitleOpacity, hudBackdropOpacity } from "./earthScrollConfig";
import { RussiaMotionLayer } from "./RussiaMotionLayer";
import { MoscowMotionLayer } from "./MoscowMotionLayer";
import { SolnechnogorskMotionLayer } from "./SolnechnogorskMotionLayer";
import { FinalCallout } from "./FinalCallout";

type Props = {
  scrollYProgress: MotionValue<number>;
};

/** Все HUD-слои в одном absolute-контейнере над Canvas. */
export function MapMotionLayer({ scrollYProgress }: Props) {
  const backdropOpacity = useTransform(scrollYProgress, hudBackdropOpacity);

  return (
    <div className={styles.mapMotionLayer}>
      <motion.div className={styles.hudBackdrop} style={{ opacity: backdropOpacity }} aria-hidden />

      <HeroHud scrollYProgress={scrollYProgress} />

      <RussiaMotionLayer scrollYProgress={scrollYProgress} />

      <MoscowMotionLayer scrollYProgress={scrollYProgress} />

      <SolnechnogorskMotionLayer scrollYProgress={scrollYProgress} />

      <FinalCallout scrollYProgress={scrollYProgress} />
    </div>
  );
}

function HeroHud({ scrollYProgress }: Props) {
  const opacity = useTransform(scrollYProgress, heroTitleOpacity);

  return (
    <motion.div className={styles.heroHudWrap} style={{ opacity }}>
      <div className={styles.heroEyebrow}>Добро пожаловать</div>
      <div className={styles.heroTitle}>ВОСХОД</div>
      <div className={styles.heroSubMuted}>прокрутите вниз</div>
    </motion.div>
  );
}
