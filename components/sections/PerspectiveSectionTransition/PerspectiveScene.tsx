"use client";

import Image from "next/image";
import { forwardRef } from "react";
import { CollectionSwipeHint } from "./CollectionSwipeHint";
import styles from "./perspective-section-transition.module.css";

const IMAGE_SIZES = "(max-width: 768px) 92vw, 720px";

export type PerspectiveSceneProps = {
  currentSlug: string;
  nextSlug: string;
  currentName: string;
  nextName: string;
  currentImage: string;
  nextImage: string;
  priorityCurrent?: boolean;
  showHint: boolean;
  activeSlug: string;
  sectionInView: boolean;
};

export const PerspectiveScene = forwardRef<HTMLElement, PerspectiveSceneProps>(
  function PerspectiveScene(
    {
      currentName,
      nextName,
      currentImage,
      nextImage,
      priorityCurrent = false,
      showHint,
      activeSlug,
      sectionInView,
    },
    ref,
  ) {
    return (
      <section ref={ref} className={styles.scene}>
        <div className={styles.sticky}>
          <div className={styles.stage}>
            <article className={`${styles.card} ${styles.currentCard}`}>
              <Image
                src={currentImage}
                alt={currentName}
                fill
                priority={priorityCurrent}
                sizes={IMAGE_SIZES}
                className={styles.image}
              />
            </article>

            <article className={`${styles.card} ${styles.nextCard}`}>
              <Image
                src={nextImage}
                alt={nextName}
                fill
                sizes={IMAGE_SIZES}
                className={styles.image}
              />
            </article>

            {showHint ? (
              <div className={styles.swipeHintWrap}>
                <CollectionSwipeHint
                  activeSlug={activeSlug}
                  slug={activeSlug}
                  visible={sectionInView}
                  unwrapped
                />
              </div>
            ) : null}
          </div>
        </div>
      </section>
    );
  },
);
