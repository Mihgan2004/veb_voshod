"use client";

import { useCallback, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { useInView } from "framer-motion";
import { useRouter } from "next/navigation";
import type { Collection } from "@/lib/catalog";
import { CollectionSwipeHint } from "./CollectionSwipeHint";
import { LarosePair } from "./LarosePair";
import { useSwipeRightNavigate } from "./useSwipeRightNavigate";
import styles from "./perspective-section-transition.module.css";

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

function slugFromProgress(topSlug: string, bottomSlug: string, progress: number) {
  return progress < 0.55 ? topSlug : bottomSlug;
}

type PairState = {
  pairIndex: number;
  topSlug: string;
  bottomSlug: string;
  progress: number;
  inView: boolean;
  centerY: number;
};

function StaticSlide({ slug, image, name }: { slug: string; image: string; name: string }) {
  const router = useRouter();
  const navigate = useCallback(() => {
    router.push(`/collections/${slug}`);
  }, [router, slug]);
  const { onTouchStart, onTouchEnd } = useSwipeRightNavigate(navigate);

  return (
    <div
      className={styles.staticSlide}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <Image
        src={image}
        alt={name}
        fill
        sizes="100vw"
        className={styles.image}
        unoptimized
      />
      <CollectionSwipeHint activeSlug={slug} slug={slug} />
    </div>
  );
}

function StaticFallback({ collections }: { collections: Collection[] }) {
  return (
    <section className={styles.wrapper} aria-label="Коллекции">
      {collections.map((col) => (
        <StaticSlide
          key={col.id}
          slug={col.slug}
          image={col.coverImage || "/globe.svg"}
          name={col.name}
        />
      ))}
    </section>
  );
}

export function PerspectiveSectionTransition({
  collections,
}: {
  collections: Collection[];
}) {
  const wrapperRef = useRef<HTMLElement>(null);
  const sectionInView = useInView(wrapperRef, { amount: 0.08 });
  const pairStatesRef = useRef<Map<number, PairState>>(new Map());
  const router = useRouter();

  const [activeSlug, setActiveSlug] = useState(collections[0]?.slug ?? "");

  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    getReducedMotionServer
  );

  const updateActiveSlug = useCallback(() => {
    const viewportCenter = window.innerHeight / 2;
    const states = [...pairStatesRef.current.values()].filter((state) => state.inView);
    if (states.length === 0) return;

    const dominant = states.reduce((best, state) => {
      const bestDist = Math.abs(best.centerY - viewportCenter);
      const stateDist = Math.abs(state.centerY - viewportCenter);
      return stateDist < bestDist ? state : best;
    });

    setActiveSlug(
      slugFromProgress(dominant.topSlug, dominant.bottomSlug, dominant.progress)
    );
  }, []);

  const handlePairActiveChange = useCallback(
    (payload: PairState) => {
      pairStatesRef.current.set(payload.pairIndex, payload);
      updateActiveSlug();
    },
    [updateActiveSlug]
  );

  const navigateToActive = useCallback(() => {
    if (!activeSlug) return;
    router.push(`/collections/${activeSlug}`);
  }, [activeSlug, router]);

  const { onTouchStart, onTouchEnd } = useSwipeRightNavigate(
    navigateToActive,
    sectionInView && Boolean(activeSlug)
  );

  if (reducedMotion || collections.length < 2) {
    return <StaticFallback collections={collections} />;
  }

  return (
    <section
      ref={wrapperRef}
      className={styles.wrapper}
      aria-label="Коллекции"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {collections.slice(0, -1).map((top, index) => {
        const bottom = collections[index + 1];
        return (
          <LarosePair
            key={top.id}
            pairIndex={index}
            topImage={top.coverImage || "/globe.svg"}
            bottomImage={bottom.coverImage || "/globe.svg"}
            topSlug={top.slug}
            bottomSlug={bottom.slug}
            topAlt={top.name}
            bottomAlt={bottom.name}
            overlap={index > 0}
            priorityTop={index === 0}
            activeSlug={activeSlug}
            sectionInView={sectionInView}
            onActiveChange={handlePairActiveChange}
          />
        );
      })}
    </section>
  );
}
