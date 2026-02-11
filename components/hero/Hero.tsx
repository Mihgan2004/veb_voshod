"use client";

import { useEffect, useMemo, useState } from "react";

export default function Hero() {
  const videoSources = useMemo(
    () => [
      "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm",
      "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    ],
    []
  );

  const [currentVideo, setCurrentVideo] = useState(videoSources[0]);

  useEffect(() => {
    const active = currentVideo;
    return () => {
      if (active && active.startsWith("blob:")) URL.revokeObjectURL(active);
    };
  }, [currentVideo]);

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-black">
      <video
        className="absolute inset-0 h-full w-full object-cover opacity-80"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      >
        {videoSources.map((src) => (
          <source key={src} src={src} />
        ))}
      </video>

      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/70" />

      {/* mobile-friendly */}
      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-4 pb-10 md:px-8 md:pb-16">
        <div className="max-w-xl">
          <div className="text-xs tracking-[0.35em] text-white/70">PROJECT VOSKHOD</div>
          <h1 className="mt-4 text-4xl font-semibold leading-[0.95] md:text-6xl">
            ВОСХОД
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-white/75 md:text-base">
            Премиальный дроп. Ограниченные партии. Никакого шума — только продукт.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <a
              href="/catalog"
              className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/10 px-6 py-3 text-sm backdrop-blur hover:bg-white/15"
            >
              В каталог
            </a>
            <a
              href="/collections"
              className="inline-flex items-center justify-center rounded-full border border-white/10 px-6 py-3 text-sm text-white/80 hover:bg-white/5"
            >
              Коллекции
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
