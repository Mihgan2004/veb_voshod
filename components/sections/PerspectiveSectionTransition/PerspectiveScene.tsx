"use client";

import Image from "next/image";
import { forwardRef } from "react";
import styles from "./perspective-section-transition.module.css";

const IMAGE_SIZES = "(max-width: 768px) 92vw, 720px";

export type PerspectiveSceneProps = {
  topImage: string;
  bottomImage: string;
  topAlt?: string;
  bottomAlt?: string;
  priorityTop?: boolean;
};

export const PerspectiveScene = forwardRef<HTMLDivElement, PerspectiveSceneProps>(
  function PerspectiveScene(
    { topImage, bottomImage, topAlt = "", bottomAlt = "", priorityTop = false },
    ref,
  ) {
    return (
      <div ref={ref} className={styles.scene} data-scene>
        <div className={styles.sticky}>
          <div className={styles.topCard}>
            <Image
              src={topImage}
              alt={topAlt}
              fill
              sizes={IMAGE_SIZES}
              className={styles.image}
              priority={priorityTop}
            />
          </div>
          <div className={styles.bottomCard}>
            <Image
              src={bottomImage}
              alt={bottomAlt}
              fill
              sizes={IMAGE_SIZES}
              className={styles.image}
            />
          </div>
        </div>
      </div>
    );
  },
);
