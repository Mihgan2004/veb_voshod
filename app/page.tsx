import dynamic from "next/dynamic";
import Hero from "@/components/hero/Hero";
import { WelcomeBlock } from "@/components/blocks/WelcomeBlock";
import { TeeIntroBlock } from "@/components/blocks/TeeIntroBlock";
import { STATIC_COLLECTIONS } from "@/lib/catalog";
import { HomeScrollProvider } from "@/components/home/HomeScrollContext";

/* Code-splitting: ниже-fold секции в отдельных чанках — меньше начальный бандл, быстрее FCP */
const HighlightsCollections = dynamic(
  () => import("@/components/sections/HighlightsCollections").then((m) => ({ default: m.HighlightsCollections })),
  { ssr: true }
);

const LookbookSlider = dynamic(
  () => import("@/components/sections/LookbookSlider").then((m) => ({ default: m.LookbookSlider })),
  { ssr: true }
);

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

      <HighlightsCollections collections={STATIC_COLLECTIONS} />
      <LookbookSlider />

      <div className="h-4" />
    </div>
  );
}
