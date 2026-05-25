"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { useScroll } from "framer-motion";
import styles from "./rassvet-wave-on-scroll.module.css";

const Scene = dynamic(() => import("./Scene"), { ssr: false });

export default function RassvetWaveOnScroll() {
  const container = useRef<HTMLElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"],
  });

  return (
    <section ref={container} className={styles.section}>
      <div className={styles.sticky}>
        <Scene scrollProgress={scrollYProgress} />
      </div>
    </section>
  );
}
