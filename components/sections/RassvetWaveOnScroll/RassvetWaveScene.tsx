"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import type { MotionValue } from "framer-motion";
import { RassvetWaveModel } from "./RassvetWaveModel";
import type { WaveSceneConfig } from "./wave-config";
import styles from "./rassvet-wave-on-scroll.module.css";

type RassvetWaveSceneProps = {
  scrollProgress: MotionValue<number>;
  config: WaveSceneConfig;
  reducedMotion: boolean;
};

export default function RassvetWaveScene({
  scrollProgress,
  config,
  reducedMotion,
}: RassvetWaveSceneProps) {
  return (
    <div className={styles.canvasWrap}>
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: false }}
        camera={{ position: [0, 0, 5], fov: 75, near: 0.1, far: 100 }}
        className={styles.canvas}
      >
        <color attach="background" args={["#050607"]} />
        <Suspense fallback={null}>
          <RassvetWaveModel
            scrollProgress={scrollProgress}
            config={config}
            reducedMotion={reducedMotion}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
