"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useSyncExternalStore } from "react";
import { motion, useTransform } from "framer-motion";
import type { Collection } from "@/lib/catalog";
import { useStickySectionScrollProgress } from "@/lib/hooks/useStickySectionScrollProgress";
import { CollectionSlide } from "./CollectionSlide";
import { CollectionStickyCta } from "./CollectionStickyCta";
import { COLLECTION_SCROLL_VH_PER_STEP } from "./maskShape";
import styles from "./collection-mask-section.module.css";

function subscribeReducedMotion(onStoreChange: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServer() {
  return false;
}

function StaticCollections({ collections }: { collections: Collection[] }) {
  return (
    <section className={`vx-section-seams ${styles.section}`} aria-label="Коллекции">
      <p className={styles.introTitle} style={{ position: "relative", opacity: 1 }}>
        коллекция
      </p>
      <div className={styles.staticStack}>
        {collections.map((col) => (
          <article key={col.id} className={styles.staticCard}>
            <div className={styles.imageWrap}>
              <Image
                src={col.coverImage || "/globe.svg"}
                alt={col.label ?? col.tag}
                fill
                sizes="(max-width: 768px) 100vw, 720px"
                className={styles.image}
              />
              <div className={styles.imageOverlay} aria-hidden />
            </div>
            <div className={styles.cta}>
              <Link
                href={`/collections/${col.slug}`}
                prefetch={false}
                className={styles.glassButton}
              >
                В коллекцию
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function CollectionMaskSection({
  collections,
}: {
  collections: Collection[];
}) {
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    getReducedMotionServer
  );

  if (reducedMotion) {
    return <StaticCollections collections={collections} />;
  }

  return <CollectionMaskScroll collections={collections} />;
}

function CollectionMaskScroll({ collections }: { collections: Collection[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const count = collections.length;
  const introShare = 1 / (count + 1);

  const scrollYProgress = useStickySectionScrollProgress(containerRef);

  const titleOpacity = useTransform(
    scrollYProgress,
    [0, introShare * 0.12, introShare * 0.72, introShare],
    [0, 1, 1, 0],
    { clamp: true }
  );

  const titleY = useTransform(
    scrollYProgress,
    [0, introShare],
    [24, 0],
    { clamp: true }
  );

  return (
    <section className={`vx-section-seams ${styles.section}`} aria-label="Коллекции">
      <div
        ref={containerRef}
        className={styles.scrollContainer}
        style={{ height: `${(count + 1) * COLLECTION_SCROLL_VH_PER_STEP}vh` }}
      >
        <div className={styles.sticky}>
          <motion.h2
            className={styles.introTitle}
            style={{ opacity: titleOpacity, y: titleY }}
          >
            коллекция
          </motion.h2>

          {collections.map((col, index) => (
            <CollectionSlide
              key={col.id}
              collection={col}
              index={index}
              total={count}
              introShare={introShare}
              scrollYProgress={scrollYProgress}
            />
          ))}

          <CollectionStickyCta
            collections={collections}
            scrollYProgress={scrollYProgress}
            introShare={introShare}
          />
        </div>
      </div>
    </section>
  );
}
