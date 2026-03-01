import dynamic from "next/dynamic";
import { Suspense } from "react";
import Hero from "@/components/hero/Hero";
import { MarqueeStrip } from "@/components/sections/MarqueeStrip";
import { HighlightsCollections } from "@/components/sections/HighlightsCollections";
import { LookbookSlider } from "@/components/sections/LookbookSlider";
import { STATIC_COLLECTIONS } from "@/lib/catalog";
import { HomeScrollProvider } from "@/components/home/HomeScrollContext";

const WelcomeBlock = dynamic(
  () => import("@/components/blocks/WelcomeBlock").then((m) => ({ default: m.WelcomeBlock })),
  { ssr: true }
);

const TeeIntroBlock = dynamic(
  () => import("@/components/blocks/TeeIntroBlock").then((m) => ({ default: m.TeeIntroBlock })),
  { ssr: true }
);

export const revalidate = 0;
export const dynamic = "force-dynamic";

function HomeScrollFallback() {
  return (
    <div className="relative w-full border-t border-white/5 min-h-[100vh] bg-[#0B0D10]" aria-hidden />
  );
}

export default function HomePage() {
  return (
    <div className="animate-fade-in">
      <Hero />
      <HomeScrollProvider>
        <Suspense fallback={<HomeScrollFallback />}>
          <WelcomeBlock />
          <TeeIntroBlock />
        </Suspense>
      </HomeScrollProvider>

      {/* Бегущая строка — сразу после TeeIntro, минимальные отступы */}
      <div className="relative z-10 -mt-16 sm:-mt-20 md:-mt-24 mb-6 sm:mb-8 px-4">
        <MarqueeStrip />
      </div>

      <div className="vx-below-fold vx-brutal-bg">
        <HighlightsCollections collections={STATIC_COLLECTIONS} />
        <LookbookSlider />
      </div>

      <div className="h-4" />
    </div>
  );
}
