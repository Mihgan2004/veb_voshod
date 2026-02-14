"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useState, useCallback, useEffect } from "react";
import type { Collection } from "@/lib/catalog";

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
  // Next.js оптимизирует изображения из remotePatterns (admin.voshod.shop, picsum.photos)

  return (
    <>
      {/* Shimmer skeleton — fades out when image loads */}
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
        unoptimized={false}
        sizes={sizes}
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
/*  HIGHLIGHTS / COLLECTIONS                                           */
/* ================================================================== */

export function HighlightsCollections({
  collections,
}: {
  collections: Collection[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section className="vx-section-seams py-16 sm:py-20">
      <div className="relative z-10">
        {/* ---- Header ---- */}
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <h2 className="text-[22px] sm:text-[28px] font-semibold uppercase tracking-[0.28em] text-white/90 text-center">
            КОЛЛЕКЦИИ
          </h2>
        </div>

        {/* ---- Carousel ---- */}
        <div
          ref={scrollRef}
          className="mt-8 sm:mt-10 flex overflow-x-auto scrollbar-none snap-x snap-mandatory gap-5 sm:gap-6 px-4 sm:px-6 min-[1288px]:px-[calc((100vw-1240px)/2+24px)]"
        >
          {collections.map((col) => (
            <Link
              key={col.id}
              href={`/collections/${col.slug}`}
              prefetch={false}
              className="group shrink-0 snap-start w-[78vw] max-w-[520px] sm:w-[520px] lg:w-[560px] outline-none focus-visible:ring-1 focus-visible:ring-white/20 rounded-2xl flex flex-col"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] transition-all duration-300 group-hover:border-white/[0.18] group-hover:bg-white/[0.03]">
                <FadeImage
                  src={col.coverImage || "/globe.svg"}
                  alt={col.label ?? col.tag}
                  sizes="(max-width:640px) 78vw, (max-width:1024px) 520px, 560px"
                />
                {col.id === "col-1" && (
                  <div className="absolute inset-0 bg-black/35 pointer-events-none rounded-2xl" aria-hidden />
                )}
              </div>
              <span className="mt-3 text-[11px] font-mono uppercase tracking-[0.32em] text-white/50 text-center block">
                {col.label ?? col.tag}
              </span>
            </Link>
          ))}

          {/* trailing spacer */}
          <div className="shrink-0 w-px" aria-hidden />
        </div>

        {/* ---- Progress indicator ---- */}
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 mt-5">
          <ScrollProgress scrollRef={scrollRef} />
        </div>
      </div>
    </section>
  );
}
