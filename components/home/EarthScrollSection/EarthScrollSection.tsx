"use client";

import React, { Suspense, useRef } from "react";
import dynamic from "next/dynamic";
import { useScroll } from "framer-motion";
import { SmoothScrollProvider } from "./SmoothScrollProvider";
import styles from "./earth-scroll-section.module.css";

/* Canvas — только на клиенте (Three.js не имеет SSR-вывода).
 * Локальный <Suspense fallback={null}> ниже не пускает chunk-loading
 * EarthCanvas в родительский Suspense на app/page.tsx. */
const EarthCanvas = dynamic(
  () => import("./EarthCanvas").then((m) => ({ default: m.EarthCanvas })),
  { ssr: false },
);

/**
 * EarthScrollSection
 *
 * Минимальная (100vh) секция с 3D-Землёй, которая проезжает сквозь
 * viewport за один экран скролла. Никаких sticky-пинов, никаких
 * длинных тёмных хвостов после анимации.
 *
 * Структура:
 *   <section ref={sectionRef} height: 100vh>
 *     <div.canvasWrap position: absolute; inset: 0>
 *       <EarthCanvas scrollYProgress={...} />
 *
 * offset ["start end", "end start"] — прогресс растёт пока секция
 * вообще видна в viewport:
 *   - 0     — верх секции коснулся низа viewport
 *             (пользователь ещё докручивает Hero, Земля начинает
 *             всплывать снизу);
 *   - 0.5   — секция ровно совпала с viewport (Земля по центру);
 *   - 1     — низ секции коснулся верха viewport
 *             (Земля ушла наверх, начинается следующий блок).
 *
 * Итого: Земля рисуется и крутится на протяжении ~двух viewport
 * скролла (последний экран Hero + секция), но в документ
 * добавляется только 100vh высоты — никакого пустого пространства.
 */
export function EarthScrollSection() {
  const sectionRef = useRef<HTMLElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  return (
    <SmoothScrollProvider>
      <section
        ref={sectionRef}
        className={styles.section}
        aria-label="Earth scroll animation"
      >
        <div className={styles.canvasWrap}>
          <Suspense fallback={null}>
            <EarthCanvas scrollYProgress={scrollYProgress} />
          </Suspense>
        </div>
      </section>
    </SmoothScrollProvider>
  );
}
