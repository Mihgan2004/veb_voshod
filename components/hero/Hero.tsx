"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ASSETS } from "@/lib/assets";

function Hero() {
  const [videoError, setVideoError] = useState(false);
  const [loadVideo, setLoadVideo] = useState(false);
  const [posterVisible, setPosterVisible] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  /* ---- Determine which video source to use based on viewport ---- */
  const [videoSrc, setVideoSrc] = useState<string>("");

  useEffect(() => {
    // Respect prefers-reduced-motion
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionQuery.matches) return;

    // Respect data-saver
    const conn = (navigator as unknown as { connection?: { saveData?: boolean } }).connection;
    if (conn?.saveData) return;

    const isMobileViewport = window.innerWidth < 640;
    const src = isMobileViewport
      ? ASSETS.video.heroMobile540
      : ASSETS.video.heroDesktop720;
    setVideoSrc(src);

    if (videoRef.current) {
      videoRef.current.poster = isMobileViewport
        ? ASSETS.brand.logoMobile
        : ASSETS.brand.logoDesktop;
    }

    // IntersectionObserver: load video only when hero is near viewport
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoadVideo(true);
          observer.disconnect();
        }
      },
      { rootMargin: "250px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /* ---- Once loadVideo is true, attach source and play ---- */
  useEffect(() => {
    if (!loadVideo || !videoRef.current || !videoSrc) return;
    const video = videoRef.current;
    video.src = videoSrc;
    video.load();
    video.play().catch(() => {
      // Autoplay blocked — fine, poster stays
    });
  }, [loadVideo, videoSrc]);

  return (
    <section
      ref={sectionRef}
      className="relative h-[100vh] overflow-hidden mb-0 bg-[#0B0D10] min-h-[100dvh]"
    >
      {!videoError && (
        <>
          <video
            ref={videoRef}
            loop
            muted
            playsInline
            preload="none"
            poster={ASSETS.brand.logoDesktop}
            disablePictureInPicture
            disableRemotePlayback
            className="absolute inset-0 w-full h-full object-cover z-0"
            onError={() => setVideoError(true)}
            onCanPlay={() => setPosterVisible(false)}
          />
          {/* Mobile-only: constrained logo until video loads — same image, reduced scale for better fit */}
          {posterVisible && (
            <div
              className="absolute inset-0 z-[0.25] flex items-center justify-center sm:hidden pointer-events-none"
              aria-hidden
            >
              <Image
                src={ASSETS.brand.logoMobile}
                alt=""
                width={320}
                height={120}
                className="w-[min(140px,38vw)] h-auto object-contain"
                priority
              />
            </div>
          )}
          {/* Perf: overlay replaces runtime filter — hidden on mobile via CSS, shown from sm+ (same as former isMobile logic) */}
          <div
            className="absolute inset-0 z-[0.5] pointer-events-none hidden sm:block"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.22) 50%, rgba(0,0,0,0.32) 100%)",
            }}
            aria-hidden
          />
        </>
      )}

      {videoError && (
        <div className="absolute inset-0 z-0 bg-[#0B0D10]">
          <div className="absolute inset-0 bg-gradient-to-b from-[#141821] via-[#0B0D10] to-[#0B0D10] opacity-90" />
        </div>
      )}

      <div className="absolute inset-0 z-[1] bg-black/40 lg:bg-black/50" role="presentation" />
      <div className="absolute inset-0 z-[2] bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.5)_85%)]" />
      {/* Desktop: cinematic vignette + warm gold falloff */}
      <div className="absolute inset-0 z-[2] hidden lg:block pointer-events-none bg-[radial-gradient(ellipse_80%_50%_at_50%_50%,transparent_0%,rgba(0,0,0,0.4)_70%,rgba(0,0,0,0.6)_100%)]" aria-hidden />
      <div className="absolute inset-0 z-[2] hidden lg:block pointer-events-none bg-[radial-gradient(ellipse_120%_100%_at_50%_90%,rgba(198,144,46,0.04)_0%,transparent_50%)]" aria-hidden />

      {/* Узкая кнопка "вниз" в овале */}
      <a
        href="#welcome"
        aria-label="Вниз"
        className="absolute top-[78%] md:top-[85%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-[3] flex items-center justify-center w-10 h-14 lg:w-12 lg:h-16 rounded-full border border-white/20 lg:border-white/25 bg-white/5 lg:bg-white/[0.07] backdrop-blur-sm transition-all duration-300 hover:border-white/40 hover:bg-white/10 lg:hover:border-gold/30 lg:hover:bg-gold/[0.08] active:scale-95"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-white/80 lg:text-white/90"
        >
          <path d="M12 5v14M19 12l-7 7-7-7" />
        </svg>
      </a>
    </section>
  );
}

export default Hero;
export { Hero };
