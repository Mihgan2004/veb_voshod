"use client";

import { useRef, useState, useCallback, useEffect } from "react";

/* ================================================================== */
/*  Lookbook images from /public/lookbook                              */
/* ================================================================== */

const LOOKBOOK_IMAGES: string[] = [
  "/lookbook/ChatGPT Image 3 февр. 2026 г., 17_47_41.png",
  "/lookbook/ChatGPT Image 3 февр. 2026 г., 18_29_58.png",
  "/lookbook/ChatGPT Image 4 февр. 2026 г., 17_21_34.png",
  "/lookbook/ChatGPT Image 13 февр. 2026 г., 04_49_22.png",
  "/lookbook/ChatGPT Image 13 февр. 2026 г., 04_50_10.png",
  "/lookbook/photo_2026-02-04_00-28-36.jpg",
  "/lookbook/photo_2026-02-04_00-45-31.jpg",
  "/lookbook/photo_2026-02-04_01-13-41.jpg",
  "/lookbook/photo_2026-02-13_05-00-26.jpg",
];

/* ================================================================== */
/*  Fade-in image with skeleton shimmer                                */
/* ================================================================== */

function FadeImage({
  src,
  alt,
  sizes,
}: {
  src: string;
  alt: string;
  sizes: string;
}) {
  const [loaded, setLoaded] = useState(false);
  /* Encode URI for local files with Cyrillic / spaces */
  const safeSrc = src.startsWith("/") ? encodeURI(src) : src;

  return (
    <>
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${
          loaded ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <div className="absolute inset-0 bg-white/[0.04]" />
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={safeSrc}
        alt={alt}
        onLoad={() => setLoaded(true)}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </>
  );
}

/* ================================================================== */
/*  Scroll progress indicator                                          */
/* ================================================================== */

function ScrollProgress({
  scrollRef,
}: {
  scrollRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [thumb, setThumb] = useState({ w: 30, x: 0 });

  const sync = useCallback(() => {
    const el = scrollRef.current;
    if (!el || el.scrollWidth <= el.clientWidth) return;
    const ratio = el.clientWidth / el.scrollWidth;
    const pos = el.scrollLeft / (el.scrollWidth - el.clientWidth);
    const w = Math.max(ratio * 100, 12);
    setThumb({ w, x: pos * (100 - w) });
  }, [scrollRef]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    sync();
    el.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      el.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [sync, scrollRef]);

  return (
    <div className="h-[2px] bg-white/10 rounded-full overflow-hidden">
      <div
        className="h-full bg-white/35 rounded-full transition-[margin] duration-150 ease-out"
        style={{ width: `${thumb.w}%`, marginLeft: `${thumb.x}%` }}
      />
    </div>
  );
}

/* ================================================================== */
/*  Chevron arrow button                                               */
/* ================================================================== */

function ArrowButton({
  direction,
  disabled,
  onClick,
}: {
  direction: "left" | "right";
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "left" ? "Previous" : "Next"}
      className="w-10 h-10 sm:w-10 sm:h-10 flex items-center justify-center border border-white/10 bg-white/[0.02] rounded-xl text-white/70 transition-all duration-200 hover:border-white/[0.18] hover:bg-white/[0.03] disabled:opacity-20 disabled:pointer-events-none"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {direction === "left" ? (
          <path d="M15 19l-7-7 7-7" />
        ) : (
          <path d="M9 5l7 7-7 7" />
        )}
      </svg>
    </button>
  );
}

/* ================================================================== */
/*  LOOKBOOK SLIDER                                                    */
/* ================================================================== */

export function LookbookSlider() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  /* ---- Sync arrow states ---- */
  const syncArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    syncArrows();
    el.addEventListener("scroll", syncArrows, { passive: true });
    window.addEventListener("resize", syncArrows);
    return () => {
      el.removeEventListener("scroll", syncArrows);
      window.removeEventListener("resize", syncArrows);
    };
  }, [syncArrows]);

  /* ---- Scroll by one frame ---- */
  const scroll = (dir: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    const frame = el.querySelector<HTMLElement>("[data-frame]");
    if (!frame) return;
    const step = frame.offsetWidth;
    el.scrollBy({ left: step * dir, behavior: "smooth" });
  };

  return (
    <section className="py-16 sm:py-20">
      {/* ---- Header + Arrows ---- */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 flex items-end justify-between">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-[0.32em] text-white/35 block mb-1.5">
            @VOSHOD
          </span>
          <h2 className="text-[22px] sm:text-[28px] font-semibold uppercase tracking-[0.28em] text-white/90">
            LOOKBOOK
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <ArrowButton direction="left" disabled={!canLeft} onClick={() => scroll(-1)} />
          <ArrowButton direction="right" disabled={!canRight} onClick={() => scroll(1)} />
        </div>
      </div>

      {/* ---- Photo strip (seamless / слитные фото) ---- */}
      <div
        ref={scrollRef}
        className="mt-8 sm:mt-10 flex overflow-x-auto scrollbar-none snap-x snap-mandatory"
      >
        {LOOKBOOK_IMAGES.map((src, i) => (
          <div
            key={i}
            data-frame
            className="shrink-0 snap-start w-[78vw] sm:w-[45vw] lg:w-[25vw]"
          >
            <div className="relative aspect-square overflow-hidden bg-white/[0.02]">
              <FadeImage
                src={src}
                alt={`Lookbook ${i + 1}`}
                sizes="(max-width:640px) 78vw, (max-width:1024px) 45vw, 25vw"
              />
            </div>
          </div>
        ))}
      </div>

      {/* ---- Progress indicator ---- */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 mt-5">
        <ScrollProgress scrollRef={scrollRef} />
      </div>
    </section>
  );
}
