"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import styles from "./perspective-section-transition.module.css";

type CollectionSwipeHintProps = {
  activeSlug: string;
  slug: string;
  visible?: boolean;
  onNavigate?: () => void;
  /** Hint wrap is provided by parent (stage / static slide). */
  unwrapped?: boolean;
};

export function CollectionSwipeHint({
  activeSlug,
  slug,
  visible = true,
  onNavigate,
  unwrapped = false,
}: CollectionSwipeHintProps) {
  const router = useRouter();

  const navigate = useCallback(() => {
    if (!slug) return;
    onNavigate?.();
    router.push(`/collections/${slug}`);
  }, [onNavigate, router, slug]);

  if (!visible || activeSlug !== slug) return null;

  const button = (
    <button
      type="button"
      className={styles.swipeHint}
      onClick={navigate}
      aria-label="Перейти в коллекцию"
    >
      смахните вправо, чтобы перейти в коллекцию
    </button>
  );

  if (unwrapped) return button;

  return <div className={styles.swipeHintWrap}>{button}</div>;
}
