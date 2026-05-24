import { Suspense } from "react";
import Hero from "@/components/hero/Hero";
import { MarqueeStrip } from "@/components/sections/MarqueeStrip";
import { HighlightsCollections } from "@/components/sections/HighlightsCollections";
import { GalleryZoomParallax } from "@/components/sections/GalleryZoomParallax/GalleryZoomParallax";
import { STATIC_COLLECTIONS } from "@/lib/catalog";
import { HomeScrollProvider } from "@/components/home/HomeScrollContext";
import { TextParallaxSection } from "@/components/home/TextParallaxSection/TextParallaxSection";

import dynamic from "next/dynamic";

const TeeIntroBlock = dynamic(
  () => import("@/components/blocks/TeeIntroBlock").then((m) => ({ default: m.TeeIntroBlock })),
  { ssr: true }
);

export const revalidate = 300;

function HomeScrollFallback() {
  return (
    <div className="relative w-full border-t border-white/5 min-h-[100vh] bg-[#0B0D10]" aria-hidden />
  );
}

export default function HomePage() {
  return (
    <div className="animate-fade-in">
      <Hero />
      {/* Text parallax on scroll — см. TextParallaxSection */}
      <TextParallaxSection />
      <HomeScrollProvider>
        <Suspense fallback={<HomeScrollFallback />}>
          <TeeIntroBlock />
        </Suspense>
      </HomeScrollProvider>

      <MarqueeStrip />

      <div className="vx-below-fold vx-brutal-bg">
        <HighlightsCollections collections={STATIC_COLLECTIONS} />
      </div>

      <GalleryZoomParallax />
    </div>
  );
}
