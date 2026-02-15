"use client";

import { useEffect, useRef, useState } from "react";
import { ASSETS } from "@/lib/assets";

function Hero() {
  const [videoError, setVideoError] = useState(false);
  const [loadVideo, setLoadVideo] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  /* ---- Determine which video source to use based on viewport ---- */
  const [videoSrc, setVideoSrc] = useState<string>("");

  useEffect(() => {
    setIsMobile(window.innerWidth < 640);
  }, []);

  useEffect(() => {
    // Respect prefers-reduced-motion
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionQuery.matches) return;

    // Respect data-saver
    const conn = (navigator as unknown as { connection?: { saveData?: boolean } }).connection;
    if (conn?.saveData) return;

    // Pick mobile vs desktop source
    const src =
      window.innerWidth < 640
        ? ASSETS.video.heroMobile540
        : ASSETS.video.heroDesktop720;
    setVideoSrc(src);

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
    // Dynamically set src to avoid downloading before ready
    video.src = videoSrc;
    video.load();
    video.play().catch(() => {
      // Autoplay blocked — fine, poster stays
    });
  }, [loadVideo, videoSrc]);

  return (
    <section
      ref={sectionRef}
      className="relative h-[100vh] overflow-hidden mb-0 bg-[#0B0D10] scroll-snap-start"
    >
      {!videoError && (
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
          style={isMobile ? undefined : { filter: "contrast(1.05) saturate(0.85) brightness(0.65)" }}
        />
      )}

      {videoError && (
        <div className="absolute inset-0 z-0 bg-[#0B0D10]">
          <div className="absolute inset-0 bg-gradient-to-b from-[#141821] via-[#0B0D10] to-[#0B0D10] opacity-90" />
        </div>
      )}

      <div className="absolute inset-0 z-[1] bg-black/40" />
      <div className="absolute inset-0 z-[2] bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.5)_85%)]" />

      {/* Узкая кнопка "вниз" в овале */}
      <a
        href="#welcome"
        aria-label="Вниз"
        className="absolute top-[75%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-[3] flex items-center justify-center w-10 h-14 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm transition-all duration-200 hover:border-white/40 hover:bg-white/10 active:scale-95"
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
          className="text-white/80"
        >
          <path d="M12 5v14M19 12l-7 7-7-7" />
        </svg>
      </a>
    </section>
  );
}

export default Hero;
export { Hero };
