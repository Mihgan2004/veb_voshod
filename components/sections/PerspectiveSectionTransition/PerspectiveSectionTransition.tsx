"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getCollectionCoverImage, type Collection } from "@/lib/catalog";
import { CollectionSwipeHint } from "./CollectionSwipeHint";
import { PerspectiveScene } from "./PerspectiveScene";
import {
  usePerspectiveScenesProgress,
  type SceneSlugPair,
} from "./usePerspectiveScenesProgress";
import { useSwipeRightNavigate } from "./useSwipeRightNavigate";
import styles from "./perspective-section-transition.module.css";

const IMAGE_SIZES = "(max-width: 768px) 92vw, 720px";

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

const MOBILE_MEDIA = "(max-width: 768px)";

function subscribeMobile(onStoreChange: () => void) {
  const mq = window.matchMedia(MOBILE_MEDIA);
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getMobile() {
  return window.matchMedia(MOBILE_MEDIA).matches;
}

function getMobileServer() {
  return false;
}

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
        sizes={IMAGE_SIZES}
        className={styles.image}
      />
      <CollectionSwipeHint activeSlug={slug} slug={slug} />
    </div>
  );
}

function StaticFallback({
  collections,
  isMobile,
}: {
  collections: Collection[];
  isMobile: boolean;
}) {
  return (
    <section className={styles.wrapper} aria-label="Коллекции">
      {collections.map((col) => (
        <StaticSlide
          key={col.id}
          slug={col.slug}
          image={getCollectionCoverImage(col, isMobile)}
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
  const sceneRefs = useRef<(HTMLDivElement | null)[]>([]);
  const activeSlugRef = useRef(collections[0]?.slug ?? "");
  const router = useRouter();

  const [activeSlug, setActiveSlug] = useState(collections[0]?.slug ?? "");
  const [sectionInView, setSectionInView] = useState(false);

  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    getReducedMotionServer,
  );

  const isMobile = useSyncExternalStore(subscribeMobile, getMobile, getMobileServer);

  const scenePairs = useMemo((): SceneSlugPair[] => {
    return collections.slice(0, -1).map((top, index) => {
      const bottom = collections[index + 1];
      return { topSlug: top.slug, bottomSlug: bottom.slug };
    });
  }, [collections]);

  useEffect(() => {
    sceneRefs.current = new Array(scenePairs.length).fill(null);
  }, [scenePairs.length]);

  const handleActiveSlugChange = useCallback((slug: string) => {
    activeSlugRef.current = slug;
    setActiveSlug(slug);
  }, []);

  usePerspectiveScenesProgress({
    sceneRefs,
    scenes: scenePairs,
    onActiveSlugChange: handleActiveSlugChange,
    activeSlugRef,
  });

  useEffect(() => {
    activeSlugRef.current = collections[0]?.slug ?? "";
    setActiveSlug(collections[0]?.slug ?? "");
  }, [collections]);

  useEffect(() => {
    const node = wrapperRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setSectionInView(entry?.isIntersecting ?? false);
      },
      { threshold: 0.08 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const navigateToActive = useCallback(() => {
    if (!activeSlug) return;
    router.push(`/collections/${activeSlug}`);
  }, [activeSlug, router]);

  const { onTouchStart, onTouchEnd } = useSwipeRightNavigate(
    navigateToActive,
    sectionInView && Boolean(activeSlug),
  );

  if (reducedMotion || collections.length < 2) {
    return <StaticFallback collections={collections} isMobile={isMobile} />;
  }

  const pairs = collections.slice(0, -1);

  return (
    <section
      ref={wrapperRef}
      className={styles.wrapper}
      aria-label="Коллекции"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {pairs.map((top, index) => {
        const bottom = collections[index + 1];
        return (
          <PerspectiveScene
            key={top.id}
            ref={(el) => {
              sceneRefs.current[index] = el;
            }}
            topImage={getCollectionCoverImage(top, isMobile)}
            bottomImage={getCollectionCoverImage(bottom, isMobile)}
            topAlt={top.name}
            bottomAlt={bottom.name}
            priorityTop={index === 0}
          />
        );
      })}

      <div
        className={styles.hintOverlay}
        data-visible={sectionInView ? "true" : undefined}
      >
        <CollectionSwipeHint
          activeSlug={activeSlug}
          slug={activeSlug}
          visible={sectionInView}
        />
      </div>
    </section>
  );
}
