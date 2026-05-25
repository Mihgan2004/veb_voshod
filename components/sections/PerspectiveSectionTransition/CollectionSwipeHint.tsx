"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import styles from "./perspective-section-transition.module.css";

type CollectionSwipeHintProps = {
  activeSlug: string;
  slug: string;
  visible?: boolean;
  onNavigate?: () => void;
};

export function CollectionSwipeHint({
  activeSlug,
  slug,
  visible = true,
  onNavigate,
}: CollectionSwipeHintProps) {
  const router = useRouter();

  const navigate = useCallback(() => {
    if (!slug) return;
    onNavigate?.();
    router.push(`/collections/${slug}`);
  }, [onNavigate, router, slug]);

  if (!visible || activeSlug !== slug) return null;

  return (
    <button
      type="button"
      className={`vx-btn-primary ${styles.swipeHint}`}
      onClick={navigate}
      aria-label="Перейти в коллекцию"
    >
      смахните вправо, чтобы перейти в коллекцию
    </button>
  );
}
