"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { ASSETS } from "@/lib/assets";

const LOOKBOOK_IMAGES: readonly string[] = ASSETS.lookbook;

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
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div
        className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-white/[0.04] to-white/[0.01]"
        aria-hidden
      >
        <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">VOSHOD</span>
      </div>
    );
  }

  return (
    <>
      {!loaded && (
        <div className="absolute inset-0 bg-[#0B0D10]">
          <div className="absolute inset-0 -translate-x-full motion-safe:animate-shimmer bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" />
        </div>
      )}

      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        loading={priority ? "eager" : "lazy"}
        quality={75}
        unoptimized={src.endsWith(".avif")}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className="object-cover"
      />
    </>
  );
}

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
    <div className="h-px bg-white/[0.06] overflow-hidden">
      <div
        className="h-full bg-white/25 transition-[margin] duration-150 ease-out"
        style={{ width: `${thumb.w}%`, marginLeft: `${thumb.x}%` }}
      />
    </div>
  );
}

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
      className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center border border-white/[0.06] bg-transparent rounded-lg text-white/45 transition-all duration-250 hover:border-white/[0.12] hover:text-white/70 hover:bg-white/[0.03] disabled:opacity-15 disabled:pointer-events-none"
    >
      <svg
        width="14"
        height="14"
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

export function LookbookSlider() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

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

  const scroll = (dir: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    const frame = el.querySelector<HTMLElement>("[data-frame]");
    if (!frame) return;
    const gap = parseInt(getComputedStyle(el).gap || "0", 10) || 16;
    const step = frame.offsetWidth + gap;
    el.scrollBy({ left: step * dir, behavior: "smooth" });
  };

  return (
    <section className="vx-section-seams vx-section-pad">
      <div className="relative z-10">
        {/* Header + Arrows */}
        <div className="max-w-[1280px] mx-auto px-5 sm:px-6 lg:px-10 xl:px-12 flex items-end justify-between opacity-0 md:opacity-100 animate-mobile-enter">
          <div>
            <span className="vx-tag bg-gradient-to-r from-amber-700/70 via-yellow-500/70 to-amber-700/70 bg-[length:200%_100%] animate-gold-shimmer bg-clip-text text-transparent block mb-2.5">
              @VOSHOD
            </span>
            <h2 className="vx-section-title">
              Галлерея
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            <ArrowButton direction="left" disabled={!canLeft} onClick={() => scroll(-1)} />
            <ArrowButton direction="right" disabled={!canRight} onClick={() => scroll(1)} />
          </div>
        </div>

        {/* Photo strip */}
        <div
          ref={scrollRef}
          data-lenis-prevent
          className="mt-10 sm:mt-12 md:mt-14 flex overflow-x-auto scrollbar-none snap-x snap-mandatory gap-3 sm:gap-4 md:gap-5 px-5 sm:px-6 lg:px-10 xl:px-12 min-[1320px]:px-[max(1.5rem,calc((100vw-1280px)/2+48px))] opacity-0 md:opacity-100 animate-mobile-enter animate-mobile-enter-delay-1"
        >
          {LOOKBOOK_IMAGES.map((src, i) => (
            <div
              key={src}
              data-frame
              className="shrink-0 snap-start w-[75vw] min-w-[75vw] sm:w-[42vw] sm:min-w-[42vw] lg:w-[380px] lg:min-w-[380px]"
            >
              <div className="relative aspect-square overflow-hidden rounded-sm border border-white/[0.04] bg-[#0a0c0f]">
                <FadeImage
                  src={src}
                  alt={`Lookbook ${i + 1}`}
                  sizes="(max-width:640px) 75vw, (max-width:1024px) 42vw, 380px"
                  priority={i === 0}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Progress indicator */}
        <div className="max-w-[1280px] mx-auto px-5 sm:px-6 lg:px-10 xl:px-12 mt-6">
          <ScrollProgress scrollRef={scrollRef} />
        </div>
      </div>
    </section>
  );
}
