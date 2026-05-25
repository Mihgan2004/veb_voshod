"use client";

import { useMemo, useRef, useSyncExternalStore } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import {
  MANIFESTO_PARAGRAPHS,
  buildManifestoParagraphWords,
  countRevealWords,
  type ManifestoWord,
} from "./manifesto-content";
import { useLiteMode } from "@/lib/useLiteMode";
import { ManifestoCtaActions } from "./ManifestoCtaActions";
import styles from "./rassvet-manifesto.module.css";

const DIM_COLOR = "#4b4f55";
const ACTIVE_COLOR = "#e8e8e8";
const ACCENT_COLOR = "#c6902e";
const DIM_OPACITY = 0.22;
const WORD_PROGRESS_START = 0.1;
const WORD_PROGRESS_END = 0.98;
const TITLE_PROGRESS_END = 0.12;

function subscribeReducedMotion(onStoreChange: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

function wordRevealRange(globalIndex: number, totalWords: number) {
  if (totalWords <= 1) {
    return { start: WORD_PROGRESS_START, end: WORD_PROGRESS_END };
  }
  const span = (WORD_PROGRESS_END - WORD_PROGRESS_START) / totalWords;
  const start = WORD_PROGRESS_START + globalIndex * span;
  const end = Math.min(WORD_PROGRESS_END, start + span * 1.35);
  return { start, end };
}

type AnimatedWordProps = {
  item: ManifestoWord;
  totalWords: number;
  progress: MotionValue<number>;
};

function AnimatedWord({ item, totalWords, progress }: AnimatedWordProps) {
  const isRevealable = item.globalIndex >= 0;
  const { start, end } = isRevealable
    ? wordRevealRange(item.globalIndex, totalWords)
    : { start: 0, end: 1 };

  const opacity = useTransform(
    progress,
    [start, end],
    isRevealable ? [DIM_OPACITY, 1] : [1, 1],
  );
  const color = useTransform(
    progress,
    [start, end],
    isRevealable
      ? item.accent
        ? [DIM_COLOR, ACCENT_COLOR]
        : [DIM_COLOR, ACTIVE_COLOR]
      : [ACTIVE_COLOR, ACTIVE_COLOR],
  );

  if (!isRevealable) {
    return <span className={styles.word}>{item.word}</span>;
  }

  return (
    <motion.span className={styles.word} style={{ opacity, color }}>
      {item.word}
    </motion.span>
  );
}

type StaticWordProps = {
  item: ManifestoWord;
  reducedMotion: boolean;
};

function StaticWord({ item, reducedMotion }: StaticWordProps) {
  if (item.globalIndex < 0) {
    return <span className={styles.wordStatic}>{item.word}</span>;
  }

  const className = [
    styles.wordStatic,
    reducedMotion
      ? item.accent
        ? styles.wordStaticAccent
        : styles.wordStaticActive
      : styles.wordStaticDim,
  ].join(" ");

  return <span className={className}>{item.word}</span>;
}

type MaskRevealTitleProps = {
  progress: MotionValue<number>;
  reducedMotion: boolean;
};

function MaskRevealTitle({ progress, reducedMotion }: MaskRevealTitleProps) {
  const y = useTransform(progress, [0, TITLE_PROGRESS_END], ["108%", "0%"]);
  const opacity = useTransform(progress, [0, TITLE_PROGRESS_END * 0.85], [0, 1]);

  if (reducedMotion) {
    return (
      <div className={styles.titleMask}>
        <h2 className={styles.title}>ИДЕЯ ПРЕЖДЕ ФОРМЫ</h2>
      </div>
    );
  }

  return (
    <div className={styles.titleMask}>
      <motion.h2 className={styles.title} style={{ y, opacity }}>
        проект РАССВЕТ
      </motion.h2>
    </div>
  );
}

function ManifestoParagraph({
  paragraphWords,
  progress,
  totalWords,
  reducedMotion,
}: {
  paragraphWords: ManifestoWord[];
  progress: MotionValue<number>;
  totalWords: number;
  reducedMotion: boolean;
}) {
  return (
    <p className={styles.paragraph}>
      {paragraphWords.map((item, index) =>
        reducedMotion ? (
          <StaticWord
            key={`${index}-${item.word}-${item.globalIndex}`}
            item={item}
            reducedMotion={reducedMotion}
          />
        ) : (
          <AnimatedWord
            key={`${index}-${item.word}-${item.globalIndex}`}
            item={item}
            totalWords={totalWords}
            progress={progress}
          />
        ),
      )}
    </p>
  );
}

export function RassvetManifestoSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const liteMode = useLiteMode();
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
  const paragraphWords = useMemo(
    () => buildManifestoParagraphWords(MANIFESTO_PARAGRAPHS),
    [],
  );

  const totalWords = useMemo(
    () => countRevealWords(paragraphWords),
    [paragraphWords],
  );

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      aria-labelledby="rassvet-manifesto-title"
    >
      <div className={styles.sticky}>
        <div className={styles.frame}>
          <div className={`${styles.corner} ${styles.cornerTl}`} aria-hidden />
          <div className={`${styles.corner} ${styles.cornerTr}`} aria-hidden />
          <div className={`${styles.corner} ${styles.cornerBl}`} aria-hidden />
          <div className={`${styles.corner} ${styles.cornerBr}`} aria-hidden />

          {!liteMode && <div className={`${styles.noise} bg-noise`} aria-hidden />}

          <div className={styles.metaTop} aria-hidden>
            <span>UNIT 788</span>
            <span>STATUS: ACTIVE</span>
          </div>
          <div className={styles.metaBottom} aria-hidden>
            RASSVET / SUPPLY CO.
          </div>

          <div className={styles.inner}>
            <p className={`${styles.label} vx-tag`}>
              {"// PROJECT RASSVET / MANIFESTO"}
            </p>

            <MaskRevealTitle progress={scrollYProgress} reducedMotion={reducedMotion} />

            <div className={styles.body}>
              {paragraphWords.map((words, index) => (
                <ManifestoParagraph
                  key={index}
                  paragraphWords={words}
                  progress={scrollYProgress}
                  totalWords={totalWords}
                  reducedMotion={reducedMotion}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.ctaZone}>
        <ManifestoCtaActions />
      </div>

      <h2 id="rassvet-manifesto-title" className="sr-only">
        проект РАССВЕТ — проект про людей
      </h2>
    </section>
  );
}
