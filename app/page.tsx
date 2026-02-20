import dynamic from "next/dynamic";
import { Suspense } from "react";
import Hero from "@/components/hero/Hero";
import { MarqueeStrip } from "@/components/sections/MarqueeStrip";
import { HighlightsCollections } from "@/components/sections/HighlightsCollections";
import { LookbookSlider } from "@/components/sections/LookbookSlider";
import { STATIC_COLLECTIONS } from "@/lib/catalog";
import { HomeScrollProvider } from "@/components/home/HomeScrollContext";

/* Тяжёлые блоки со скроллом/анимациями — отдельные чанки, рендер на сервере (ssr: true). */
const WelcomeBlock = dynamic(
  () => import("@/components/blocks/WelcomeBlock").then((m) => ({ default: m.WelcomeBlock })),
  { ssr: true }
);

const TeeIntroBlock = dynamic(
  () => import("@/components/blocks/TeeIntroBlock").then((m) => ({ default: m.TeeIntroBlock })),
  { ssr: true }
);

/* ------------------------------------------------------------------ */
/*  Главная: серверный рендер. Hero + Welcome + TeeIntro — клиент (скролл);
    MarqueeStrip, ниже — сервер/клиент по месту. */
/* ------------------------------------------------------------------ */
export const revalidate = 60;

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

      {/* Бегущая строка — между TeeIntroBlock и блоком КОЛЛЕКЦИИ, без наложения */}
      <div className="relative flex justify-center shrink-0 mt-[min(25vh,220px)] sm:mt-[min(28vh,260px)] mb-10 sm:mb-12" aria-hidden>
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
