"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useState, useCallback, useEffect } from "react";
import type { Collection } from "@/lib/catalog";

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
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
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

export function HighlightsCollections({
  collections,
}: {
  collections: Collection[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section className="vx-section-seams vx-section-pad">
      <div className="relative z-10">
        {/* Header */}
        <div className="max-w-[1280px] mx-auto px-5 sm:px-6 lg:px-10 xl:px-12 opacity-0 md:opacity-100 animate-mobile-enter">
          <div className="flex flex-col items-center gap-2">
            <span className="vx-tag text-white/20 mb-1">ARCHIVE</span>
            <h2 className="vx-section-title text-center">
              КОЛЛЕКЦИИ
            </h2>
          </div>
        </div>

        {/* Carousel */}
        <div
          ref={scrollRef}
          className="mt-10 sm:mt-12 md:mt-14 flex overflow-x-auto scrollbar-none snap-x snap-mandatory gap-4 sm:gap-5 md:gap-6 px-5 sm:px-6 lg:px-10 xl:px-12 min-[1320px]:px-[max(1.5rem,calc((100vw-1280px)/2+48px))] opacity-0 md:opacity-100 animate-mobile-enter animate-mobile-enter-delay-1"
        >
          {collections.map((col) => (
            <Link
              key={col.id}
              href={`/collections/${col.slug}`}
              prefetch={false}
              className="group shrink-0 snap-start w-[78vw] max-w-[480px] sm:w-[480px] lg:w-[520px] outline-none focus-visible:ring-1 focus-visible:ring-white/20 rounded-xl flex flex-col"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-white/[0.06] bg-[#0B0D10] transition-all duration-400 group-hover:border-white/[0.12]">
                <FadeImage
                  src={col.coverImage || "/globe.svg"}
                  alt={col.label ?? col.tag}
                  sizes="(max-width:640px) 78vw, (max-width:1024px) 480px, 520px"
                />
                {/* Gradient overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" aria-hidden />
                {col.id === "col-1" && (
                  <div className="absolute inset-0 bg-black/30 pointer-events-none rounded-xl" aria-hidden />
                )}
                {/* Label inside card */}
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                  <span className="text-[10px] font-mono uppercase tracking-[0.28em] text-white/60 block">
                    {col.label ?? col.tag}
                  </span>
                </div>
              </div>
            </Link>
          ))}

          <div className="shrink-0 w-px" aria-hidden />
        </div>

        {/* Progress indicator */}
        <div className="max-w-[1280px] mx-auto px-5 sm:px-6 lg:px-10 xl:px-12 mt-6">
          <ScrollProgress scrollRef={scrollRef} />
        </div>
      </div>
    </section>
  );
}
