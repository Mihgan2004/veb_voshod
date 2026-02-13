import Hero from "@/components/hero/Hero";
import { WelcomeBlock } from "@/components/blocks/WelcomeBlock";
import { TeeIntroBlock } from "@/components/blocks/TeeIntroBlock";
import { HighlightsCollections } from "@/components/sections/HighlightsCollections";
import { LookbookSlider } from "@/components/sections/LookbookSlider";
import { catalog } from "@/lib/catalog";

/* ------------------------------------------------------------------ */
/*  Home page                                                          */
/* ------------------------------------------------------------------ */
export default async function HomePage() {
  const collections = await catalog.listCollections();

  return (
    <div className="animate-fade-in">
      <Hero />
      <WelcomeBlock />
      <TeeIntroBlock />

      {/* ---- Highlights: коллекции (горизонтальный скролл) ---- */}
      <HighlightsCollections collections={collections} />

      {/* ---- Lookbook: фото-слайдер ---- */}
      <LookbookSlider />

      <div className="h-4" />
    </div>
  );
}
