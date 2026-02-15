import Hero from "@/components/hero/Hero";
import { WelcomeBlock } from "@/components/blocks/WelcomeBlock";
import { TeeIntroBlock } from "@/components/blocks/TeeIntroBlock";
import { MarqueeStrip } from "@/components/sections/MarqueeStrip";
import { HighlightsCollections } from "@/components/sections/HighlightsCollections";
import { LookbookSlider } from "@/components/sections/LookbookSlider";
import { STATIC_COLLECTIONS } from "@/lib/catalog";
import { HomeScrollProvider } from "@/components/home/HomeScrollContext";

/* ------------------------------------------------------------------ */
/*  Home page: статичные коллекции в Highlights; /collections — Directus */
/* ------------------------------------------------------------------ */
export const revalidate = 60;

export default function HomePage() {
  return (
    <div className="animate-fade-in">
      <Hero />
      <HomeScrollProvider>
        <WelcomeBlock />
        <TeeIntroBlock />
      </HomeScrollProvider>

      <MarqueeStrip />
      <HighlightsCollections collections={STATIC_COLLECTIONS} />
      <LookbookSlider />

      <div className="h-4" />
    </div>
  );
}
