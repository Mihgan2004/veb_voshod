import Hero from "@/components/hero/Hero";
import { WelcomeBlock } from "@/components/blocks/WelcomeBlock";
import { TeeIntroBlock } from "@/components/blocks/TeeIntroBlock";
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
    <HomeScrollProvider>
      <div className="animate-fade-in">
        <Hero />
        <WelcomeBlock />
        <TeeIntroBlock />

        {/* ---- Highlights: статичные карточки (Коллекция №1–3) ---- */}
        <HighlightsCollections collections={STATIC_COLLECTIONS} />

        {/* ---- Lookbook: фото-слайдер ---- */}
        <LookbookSlider />

        <div className="h-4" />
      </div>
    </HomeScrollProvider>
  );
}
