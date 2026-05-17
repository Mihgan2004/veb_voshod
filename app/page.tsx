import { Suspense } from "react";
import Hero from "@/components/hero/Hero";
import { MarqueeStrip } from "@/components/sections/MarqueeStrip";
import { HighlightsCollections } from "@/components/sections/HighlightsCollections";
import { LookbookSlider } from "@/components/sections/LookbookSlider";
import { STATIC_COLLECTIONS } from "@/lib/catalog";
import { HomeScrollProvider } from "@/components/home/HomeScrollContext";
import { EarthScrollSection } from "@/components/home/EarthScrollSection/EarthScrollSection";

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
      {/* 3D Earth + projects: клиентский блок с dynamic(Canvas); без общего Suspense — см. EarthScrollSection. */}
      <EarthScrollSection />
      <HomeScrollProvider>
        <Suspense fallback={<HomeScrollFallback />}>
          <TeeIntroBlock />
        </Suspense>
      </HomeScrollProvider>

      <MarqueeStrip />

      <div className="vx-below-fold vx-brutal-bg">
        <HighlightsCollections collections={STATIC_COLLECTIONS} />
        <LookbookSlider />
      </div>
    </div>
  );
}
