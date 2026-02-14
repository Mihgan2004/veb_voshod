"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { ASSETS } from "@/lib/assets";

/* ================================================================== */
/*  Lookbook images — source of truth in lib/assets.ts                 */
/* ================================================================== */

const LOOKBOOK_IMAGES: readonly string[] = ASSETS.lookbook;

/* ================================================================== */
/*  Fade-in image: next/image + lazy, чтобы не грузить все 9 сразу     */
/* ================================================================== */

function FadeImage({
  src,
  alt,
  sizes,
  priority = false,
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);

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

      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        unoptimized
        loading={priority ? undefined : "lazy"}
        onLoad={() => setLoaded(true)}
        className={`object-cover transition-opacity duration-300 ${
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
  const rafRef = useRef<number | null>(null);

  const sync = useCallback(() => {
    const el = scrollRef.current;
    if (!el || el.scrollWidth <= el.clientWidth) return;
    const ratio = el.clientWidth / el.scrollWidth;
    const pos = el.scrollLeft / (el.scrollWidth - el.clientWidth);
    const w = Math.max(ratio * 100, 12);
    setThumb({ w, x: pos * (100 - w) });
  }, [scrollRef]);

  const throttledSync = useCallback(() => {
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => {
      sync();
      rafRef.current = null;
    });
  }, [sync]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    sync();
    el.addEventListener("scroll", throttledSync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      el.removeEventListener("scroll", throttledSync);
      window.removeEventListener("resize", sync);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [sync, throttledSync, scrollRef]);

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

  /* ---- Sync arrow states (throttled for mobile) ---- */
  const syncArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  const rafArrows = useRef<number | null>(null);
  const throttledSyncArrows = useCallback(() => {
    if (rafArrows.current != null) return;
    rafArrows.current = requestAnimationFrame(() => {
      syncArrows();
      rafArrows.current = null;
    });
  }, [syncArrows]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    syncArrows();
    el.addEventListener("scroll", throttledSyncArrows, { passive: true });
    window.addEventListener("resize", syncArrows);
    return () => {
      el.removeEventListener("scroll", throttledSyncArrows);
      window.removeEventListener("resize", syncArrows);
      if (rafArrows.current != null) cancelAnimationFrame(rafArrows.current);
    };
  }, [syncArrows, throttledSyncArrows]);

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
    <section className="vx-section-seams py-16 sm:py-20">
      <div className="relative z-10">
        {/* ---- Header + Arrows ---- */}
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 flex items-end justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-[0.32em] block mb-1.5 bg-gradient-to-r from-amber-700 via-yellow-500 to-amber-700 bg-[length:200%_100%] animate-gold-shimmer bg-clip-text text-transparent">
              @VOSHOD
            </span>
            <h2 className="text-[22px] sm:text-[28px] font-semibold uppercase tracking-[0.28em] text-white/90">
              Галлерея
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
              key={src}
              data-frame
              className="shrink-0 snap-start w-[78vw] sm:w-[45vw] lg:w-[25vw]"
            >
              <div className="relative aspect-square overflow-hidden bg-white/[0.02]">
                <FadeImage
                  src={src}
                  alt={`Lookbook ${i + 1}`}
                  sizes="(max-width:640px) 78vw, (max-width:1024px) 45vw, 25vw"
                  priority={i === 0}
                />
              </div>
            </div>
          ))}
        </div>

        {/* ---- Progress indicator ---- */}
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 mt-5">
          <ScrollProgress scrollRef={scrollRef} />
        </div>
      </div>
    </section>
  );
}
