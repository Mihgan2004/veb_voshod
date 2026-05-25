"use client";

import Image from "next/image";
import { useEffect, useRef, useCallback } from "react";
import {
  motion,
  useInView,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { CollectionSwipeHint } from "./CollectionSwipeHint";
import styles from "./perspective-section-transition.module.css";

const CARD_RADIUS_MIN = "20px";
const CARD_RADIUS_MAX = "28px";

type LarosePairProps = {
  topImage: string;
  bottomImage: string;
  topSlug: string;
  bottomSlug: string;
  topAlt?: string;
  bottomAlt?: string;
  overlap?: boolean;
  priorityTop?: boolean;
  activeSlug: string;
  sectionInView: boolean;
  onActiveChange?: (payload: {
    pairIndex: number;
    topSlug: string;
    bottomSlug: string;
    progress: number;
    inView: boolean;
    centerY: number;
  }) => void;
};

function Section1({
  scrollYProgress,
  image,
  alt,
  slug,
  activeSlug,
  sectionInView,
  priority,
}: {
  scrollYProgress: MotionValue<number>;
  image: string;
  alt: string;
  slug: string;
  activeSlug: string;
  sectionInView: boolean;
  priority?: boolean;
}) {
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.8]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, -5]);
  const borderRadius = useTransform(
    scrollYProgress,
    [0, 1],
    [CARD_RADIUS_MIN, CARD_RADIUS_MAX]
  );

  return (
    <motion.div className={styles.section1} style={{ scale, rotate, borderRadius }}>
      <Image
        src={image}
        alt={alt}
        fill
        sizes="100vw"
        className={styles.image}
        priority={priority}
        unoptimized
      />
      <CollectionSwipeHint
        activeSlug={activeSlug}
        slug={slug}
        visible={sectionInView}
      />
    </motion.div>
  );
}

function Section2({
  scrollYProgress,
  image,
  alt,
  slug,
  activeSlug,
  sectionInView,
}: {
  scrollYProgress: MotionValue<number>;
  image: string;
  alt: string;
  slug: string;
  activeSlug: string;
  sectionInView: boolean;
}) {
  const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1]);
  const rotate = useTransform(scrollYProgress, [0, 1], [5, 0]);
  const borderRadius = useTransform(
    scrollYProgress,
    [0, 1],
    [CARD_RADIUS_MAX, CARD_RADIUS_MIN]
  );

  return (
    <motion.div className={styles.section2} style={{ scale, rotate, borderRadius }}>
      <Image
        src={image}
        alt={alt}
        fill
        sizes="100vw"
        className={styles.image}
        unoptimized
      />
      <CollectionSwipeHint
        activeSlug={activeSlug}
        slug={slug}
        visible={sectionInView}
      />
    </motion.div>
  );
}

/** Один блок = tutorial Larose: container h-[200vh] + useScroll + Section1 + Section2 */
export function LarosePair({
  topImage,
  bottomImage,
  topSlug,
  bottomSlug,
  topAlt = "",
  bottomAlt = "",
  overlap = false,
  priorityTop = false,
  activeSlug,
  sectionInView,
  pairIndex,
  onActiveChange,
}: LarosePairProps & { pairIndex: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { amount: 0.15 });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const report = useCallback(() => {
    const node = containerRef.current;
    if (!node) return;

    const rect = node.getBoundingClientRect();
    onActiveChange?.({
      pairIndex,
      topSlug,
      bottomSlug,
      progress: scrollYProgress.get(),
      inView,
      centerY: rect.top + rect.height / 2,
    });
  }, [bottomSlug, inView, onActiveChange, pairIndex, scrollYProgress, topSlug]);

  useMotionValueEvent(scrollYProgress, "change", report);

  useEffect(() => {
    report();
  }, [inView, report]);

  useEffect(() => {
    const onScroll = () => report();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [report]);

  return (
    <div
      ref={containerRef}
      className={styles.container}
      data-overlap={overlap ? "true" : undefined}
    >
      <Section1
        scrollYProgress={scrollYProgress}
        image={topImage}
        alt={topAlt}
        slug={topSlug}
        activeSlug={activeSlug}
        sectionInView={sectionInView}
        priority={priorityTop}
      />
      <Section2
        scrollYProgress={scrollYProgress}
        image={bottomImage}
        alt={bottomAlt}
        slug={bottomSlug}
        activeSlug={activeSlug}
        sectionInView={sectionInView}
      />
    </div>
  );
}
