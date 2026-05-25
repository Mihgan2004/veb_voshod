"use client";

import { Canvas } from "@react-three/fiber";
import type { MotionValue } from "framer-motion";
import Model from "./Model";
import styles from "./rassvet-wave-on-scroll.module.css";

type SceneProps = {
  scrollProgress: MotionValue<number>;
};

export default function Scene({ scrollProgress }: SceneProps) {
  return (
    <Canvas className={styles.canvas} dpr={[1, 1.5]}>
      <Model scrollProgress={scrollProgress} />
    </Canvas>
  );
}
