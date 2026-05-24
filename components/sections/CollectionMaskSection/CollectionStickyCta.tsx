"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useTransform,
  type MotionValue,
} from "framer-motion";
import type { Collection } from "@/lib/catalog";
import {
  getActiveCollectionIndex,
  getCollectionCtaOpacity,
} from "./CollectionSlide";
import styles from "./collection-mask-section.module.css";

export function CollectionStickyCta({
  collections,
  scrollYProgress,
  introShare,
}: {
  collections: Collection[];
  scrollYProgress: MotionValue<number>;
  introShare: number;
}) {
  const total = collections.length;
  const [activeSlug, setActiveSlug] = useState(collections[0]?.slug ?? "");

  const buttonOpacity = useTransform(scrollYProgress, (progress) =>
    getCollectionCtaOpacity(progress, total, introShare)
  );

  const ctaPointer = useTransform(buttonOpacity, (v) =>
    v > 0.35 ? "auto" : "none"
  );

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    const activeIndex = getActiveCollectionIndex(progress, total, introShare);
    if (activeIndex >= 0) {
      setActiveSlug(collections[activeIndex].slug);
    }
  });

  useEffect(() => {
    const activeIndex = getActiveCollectionIndex(
      scrollYProgress.get(),
      total,
      introShare
    );
    if (activeIndex >= 0) {
      setActiveSlug(collections[activeIndex].slug);
    }
  }, [collections, introShare, scrollYProgress, total]);

  if (!activeSlug) return null;

  return (
    <motion.div
      className={styles.stickyCta}
      style={{ opacity: buttonOpacity, pointerEvents: ctaPointer }}
    >
      <Link
        href={`/collections/${activeSlug}`}
        prefetch={false}
        className={styles.glassButton}
      >
        В коллекцию
      </Link>
    </motion.div>
  );
}
