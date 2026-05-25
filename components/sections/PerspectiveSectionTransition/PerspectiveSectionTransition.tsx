"use client";

import {
  CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  getCollectionCoverImage,
  isPrecompressedCoverImage,
  type Collection,
} from "@/lib/catalog";
import { useLenisRef } from "@/components/providers/LenisContext";
import { CollectionSwipeHint } from "./CollectionSwipeHint";
import { useSwipeRightNavigate } from "./useSwipeRightNavigate";
import styles from "./perspective-section-transition.module.css";

const MOBILE_MEDIA = "(max-width: 768px)";
const REDUCED_MOTION_MEDIA = "(prefers-reduced-motion: reduce)";
const IMAGE_SIZES = "(max-width: 768px) 96vw, 800px";

function subscribeMedia(query: string, onStoreChange: () => void) {
  const media = window.matchMedia(query);
  media.addEventListener("change", onStoreChange);

  return () => {
    media.removeEventListener("change", onStoreChange);
  };
}

function getMobileSnapshot() {
  return window.matchMedia(MOBILE_MEDIA).matches;
}

function getReducedMotionSnapshot() {
  return window.matchMedia(REDUCED_MOTION_MEDIA).matches;
}

function getServerSnapshot() {
  return false;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

type CollectionCard = {
  id: string;
  slug: string;
  name: string;
  image: string;
};

function StaticFallback({ cards }: { cards: CollectionCard[] }) {
  return (
    <section className={styles.staticFallback} aria-label="Коллекции">
      {cards.map((card, index) => (
        <article key={card.id} className={styles.staticSlide}>
          <Image
            src={card.image}
            alt={card.name}
            fill
            priority={index === 0}
            sizes={IMAGE_SIZES}
            className={styles.image}
            unoptimized={isPrecompressedCoverImage(card.image)}
          />

          <div className={styles.swipeHintWrap}>
            <CollectionSwipeHint
              activeSlug={card.slug}
              slug={card.slug}
              visible
            />
          </div>
        </article>
      ))}
    </section>
  );
}

export function PerspectiveSectionTransition({
  collections,
}: {
  collections: Collection[];
}) {
  const router = useRouter();
  const lenisRef = useLenisRef();

  const wrapperRef = useRef<HTMLElement | null>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const activeSlugRef = useRef(collections[0]?.slug ?? "");

  const [sectionInView, setSectionInView] = useState(false);
  const [activeSlug, setActiveSlug] = useState(collections[0]?.slug ?? "");

  const isMobile = useSyncExternalStore(
    useCallback((onStoreChange) => subscribeMedia(MOBILE_MEDIA, onStoreChange), []),
    getMobileSnapshot,
    getServerSnapshot,
  );

  const reducedMotion = useSyncExternalStore(
    useCallback((onStoreChange) => subscribeMedia(REDUCED_MOTION_MEDIA, onStoreChange), []),
    getReducedMotionSnapshot,
    getServerSnapshot,
  );

  const cards = useMemo<CollectionCard[]>(() => {
    return collections.map((collection) => ({
      id: collection.id,
      slug: collection.slug,
      name: collection.name,
      image: getCollectionCoverImage(collection, isMobile),
    }));
  }, [collections, isMobile]);

  useEffect(() => {
    const firstSlug = cards[0]?.slug ?? "";

    activeSlugRef.current = firstSlug;
    setActiveSlug(firstSlug);
  }, [cards]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setSectionInView(Boolean(entry?.isIntersecting));
      },
      {
        threshold: 0.08,
      },
    );

    observer.observe(wrapper);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (reducedMotion || cards.length < 2) return;

    let rafId = 0;
    let lenisCleanup: (() => void) | null = null;
    let lenisRetryId: number | null = null;

    const applyProgress = () => {
      const wrapper = wrapperRef.current;
      const nodes = cardRefs.current;
      const count = cards.length;

      if (!wrapper || count === 0) {
        rafId = 0;
        return;
      }

      const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
      const rect = wrapper.getBoundingClientRect();

      if (rect.bottom < 0 || rect.top > viewportHeight) {
        rafId = 0;
        return;
      }

      const maxProgress = count - 1;
      const scrollable = Math.max(1, rect.height - viewportHeight);
      const globalProgress = clamp(
        (-rect.top / scrollable) * maxProgress,
        0,
        maxProgress,
      );

      const baseIndex = Math.min(maxProgress, Math.floor(globalProgress));
      const localProgress = globalProgress - baseIndex;

      const activeIndex = clamp(
        localProgress < 0.55 ? baseIndex : baseIndex + 1,
        0,
        maxProgress,
      );

      const nextActiveSlug = cards[activeIndex]?.slug ?? "";

      if (nextActiveSlug && nextActiveSlug !== activeSlugRef.current) {
        activeSlugRef.current = nextActiveSlug;
        setActiveSlug(nextActiveSlug);
      }

      for (let index = 0; index < nodes.length; index += 1) {
        const card = nodes[index];
        if (!card) continue;

        const delta = index - globalProgress;
        const visibleDelta = clamp(delta, -1.15, 1.15);
        const isUpcoming = visibleDelta > 0;
        const absDelta = Math.abs(visibleDelta);

        const translateY = isUpcoming
          ? visibleDelta * (isMobile ? 112 : 108)
          : visibleDelta * (isMobile ? 18 : 26);

        const scale = isUpcoming
          ? 1 - visibleDelta * (isMobile ? 0.035 : 0.055)
          : 1 + visibleDelta * (isMobile ? 0.025 : 0.06);

        const opacity =
          absDelta > 1.05
            ? 0
            : isUpcoming
              ? 1 - visibleDelta * 0.28
              : 1 + visibleDelta * 0.95;

        card.style.transform = `translate3d(0, ${translateY}%, 0) scale(${scale})`;
        card.style.opacity = String(clamp(opacity, 0, 1));
        card.style.pointerEvents = absDelta < 0.6 ? "auto" : "none";
        card.style.zIndex = String(100 + index);
      }

      rafId = 0;
    };

    const schedule = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(applyProgress);
    };

    const attachLenis = () => {
      const lenis = lenisRef?.current;

      if (!lenis || typeof lenis.on !== "function") {
        return false;
      }

      lenis.on("scroll", schedule);
      lenisCleanup = () => {
        lenis.off("scroll", schedule);
      };

      return true;
    };

    applyProgress();

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.visualViewport?.addEventListener("resize", schedule);

    if (!attachLenis()) {
      lenisRetryId = window.setInterval(() => {
        if (attachLenis() && lenisRetryId !== null) {
          window.clearInterval(lenisRetryId);
          lenisRetryId = null;
        }
      }, 120);
    }

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.visualViewport?.removeEventListener("resize", schedule);

      lenisCleanup?.();

      if (lenisRetryId !== null) {
        window.clearInterval(lenisRetryId);
      }

      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [cards, isMobile, reducedMotion, lenisRef]);

  const navigateToActive = useCallback(() => {
    const slug = activeSlugRef.current || activeSlug;

    if (!slug) return;

    router.push(`/collections/${slug}`);
  }, [activeSlug, router]);

  const { onTouchStart, onTouchEnd } = useSwipeRightNavigate(
    navigateToActive,
    sectionInView && Boolean(activeSlug),
  );

  if (cards.length === 0) {
    return null;
  }

  if (reducedMotion || cards.length < 2) {
    return <StaticFallback cards={cards} />;
  }

  const wrapperStyle = {
    height: `${cards.length * 100}svh`,
  } satisfies CSSProperties;

  return (
    <section
      ref={wrapperRef}
      className={styles.wrapper}
      style={wrapperStyle}
      aria-label="Коллекции"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className={styles.sticky}>
        <div className={styles.stage}>
          {cards.map((card, index) => (
            <article
              key={card.id}
              ref={(node) => {
                cardRefs.current[index] = node;
              }}
              className={styles.card}
              style={{
                zIndex: 100 + index,
                opacity: index === 0 ? 1 : 0,
                transform:
                  index === 0
                    ? "translate3d(0, 0%, 0) scale(1)"
                    : "translate3d(0, 112%, 0) scale(0.96)",
              }}
            >
              <Image
                src={card.image}
                alt={card.name}
                fill
                priority={index === 0}
                sizes={IMAGE_SIZES}
                className={styles.image}
                unoptimized={isPrecompressedCoverImage(card.image)}
              />
            </article>
          ))}

          <div className={styles.swipeHintWrap}>
            <CollectionSwipeHint
              activeSlug={activeSlug}
              slug={activeSlug}
              visible={sectionInView}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
