"use client";

import { useEffect, useRef, useState } from "react";
import { ASSETS } from "@/lib/assets";

function Hero() {
  const [videoError, setVideoError] = useState(false);
  const [loadVideo, setLoadVideo] = useState(false);
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
      className="relative h-[100vh] overflow-hidden mb-0 bg-[#0B0D10]"
    >
      {!videoError && (
        <video
          ref={videoRef}
          loop
          muted
          playsInline
          preload="none"
          poster={ASSETS.brand.logoDesktop}
          className="absolute inset-0 w-full h-full object-cover z-0"
          onError={() => setVideoError(true)}
          style={{ filter: "contrast(1.05) saturate(0.85) brightness(0.65)" }}
        />
      )}

      {videoError && (
        <div className="absolute inset-0 z-0 bg-[#0B0D10]">
          <div className="absolute inset-0 bg-gradient-to-b from-[#141821] via-[#0B0D10] to-[#0B0D10] opacity-90" />
        </div>
      )}

      <div className="absolute inset-0 z-[1] bg-black/40" />
      <div className="absolute inset-0 z-[2] bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.5)_85%)]" />
    </section>
  );
}

export default Hero;
export { Hero };
