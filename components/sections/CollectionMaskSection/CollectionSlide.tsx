"use client";

import Link from "next/link";
import { motion, useTransform, type MotionValue } from "framer-motion";
import type { Collection } from "@/lib/catalog";
import {
  getImageSizeForProgress,
  getMaskPathForProgress,
} from "./maskShape";
import styles from "./collection-mask-section.module.css";

const MASK_ID_PREFIX = "collection-mask-";

type CollectionSlideProps = {
  collection: Collection;
  index: number;
  total: number;
  introShare: number;
  scrollYProgress: MotionValue<number>;
};

export function CollectionSlide({
  collection,
  index,
  total,
  introShare,
  scrollYProgress,
}: CollectionSlideProps) {
  const segmentShare = (1 - introShare) / total;
  const segStart = introShare + index * segmentShare;
  const segEnd = segStart + segmentShare;
  const maskId = `${MASK_ID_PREFIX}${collection.id}`;

  const maskProgress = useTransform(
    scrollYProgress,
    [segStart, segEnd],
    [0, 1],
    { clamp: true }
  );

  const maskPath = useTransform(maskProgress, (progress) =>
    getMaskPathForProgress(progress)
  );
  const imageSize = useTransform(maskProgress, (progress) =>
    getImageSizeForProgress(progress)
  );
  const imageOffset = useTransform(imageSize, (size) => (100 - size) / 2);

  const src = collection.coverImage || "/globe.svg";

  return (
    <div className={styles.slide} style={{ zIndex: 10 + index }}>
      <svg
        className={styles.svgLayer}
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <defs>
          <mask
            id={maskId}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="100"
            height="100"
          >
            <rect x="0" y="0" width="100" height="100" fill="black" />
            <motion.path d={maskPath} fill="white" />
          </mask>
        </defs>

        <g mask={`url(#${maskId})`}>
          <motion.image
            href={src}
            preserveAspectRatio="xMidYMid slice"
            width={imageSize}
            height={imageSize}
            x={imageOffset}
            y={imageOffset}
          />
        </g>
      </svg>
    </div>
  );
}

export function getActiveCollectionIndex(
  progress: number,
  total: number,
  introShare: number
) {
  const segmentShare = (1 - introShare) / total;
  let activeIndex = -1;

  for (let i = 0; i < total; i++) {
    const revealAt = introShare + i * segmentShare + segmentShare * 0.76;
    if (progress >= revealAt) activeIndex = i;
  }

  return activeIndex;
}

export function getCollectionCtaOpacity(
  progress: number,
  total: number,
  introShare: number
) {
  const activeIndex = getActiveCollectionIndex(progress, total, introShare);
  if (activeIndex < 0) return 0;

  const segmentShare = (1 - introShare) / total;
  const segStart = introShare + activeIndex * segmentShare;
  const revealAt = segStart + segmentShare * 0.76;
  const fullAt = segStart + segmentShare * 0.88;

  if (progress >= fullAt) return 1;
  return (progress - revealAt) / (fullAt - revealAt);
}
