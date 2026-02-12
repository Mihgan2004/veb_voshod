import Link from "next/link";
import Hero from "@/components/hero/Hero";
import { WelcomeBlock } from "@/components/blocks/WelcomeBlock";
import { TeeIntroBlock } from "@/components/blocks/TeeIntroBlock";
import { ProductCard } from "@/components/product/ProductCard";
import { catalog } from "@/lib/catalog";
import type { Collection } from "@/lib/catalog";

/* ------------------------------------------------------------------ */
/*  Collection card (inline — used only here)                         */
/* ------------------------------------------------------------------ */
function CollectionCard({ col }: { col: Collection }) {
  return (
    <Link
      href={`/collections/${col.slug}`}
      className="group relative flex flex-col justify-end rounded-xl sm:rounded-2xl border border-white/5 bg-graphite-light p-5 sm:p-7 min-h-[140px] sm:min-h-[180px] transition-all duration-300 hover:border-white/15 hover:bg-white/[0.02]"
    >
      <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.2em] uppercase text-white/45">
        {col.tag}
      </span>
      <h2 className="mt-2 sm:mt-3 text-lg sm:text-xl md:text-2xl font-semibold tracking-tight text-white uppercase leading-tight">
        {col.name}
      </h2>
      {col.description && (
        <p className="mt-2 text-xs sm:text-sm leading-relaxed text-white/45 max-w-[42ch] line-clamp-2">
          {col.description}
        </p>
      )}
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Section header                                                    */
/* ------------------------------------------------------------------ */
function SectionHeader({
  label,
  sub,
  href,
  linkLabel,
}: {
  label: string;
  sub: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <header className="flex items-center justify-between mb-6 sm:mb-8 md:mb-10">
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <h2 className="text-[11px] sm:text-xs font-mono tracking-[0.25em] uppercase text-white/50 shrink-0">
          {label}
        </h2>
        <span className="hidden sm:block h-px w-8 bg-white/10 shrink-0" aria-hidden />
        <span className="text-[11px] sm:text-xs font-mono tracking-wider text-white/25 truncate">
          {sub}
        </span>
      </div>
      <Link
        href={href}
        className="shrink-0 ml-4 text-[11px] sm:text-xs font-mono tracking-[0.18em] text-gold hover:text-gold/80 uppercase transition-colors"
      >
        {linkLabel}&nbsp;&rarr;
      </Link>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */
export default async function HomePage() {
  const collections = await catalog.listCollections();
  const products = await catalog.listProducts();

  const featuredCollections = collections.slice(0, 4);
  const featuredProducts = products.filter((p) => p.inStock).slice(0, 8);

  return (
    <div className="animate-fade-in">
      <Hero />
      <WelcomeBlock />
      <TeeIntroBlock />

      {/* ---- Секции каталога ---- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 md:pt-28">
        {/* Collections */}
        <SectionHeader
          label="SECTORS"
          sub="ALL COLLECTIONS"
          href="/collections"
          linkLabel="ALL COLLECTIONS"
        />

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-16 sm:mb-20 md:mb-28">
          {featuredCollections.map((col) => (
            <CollectionCard key={col.id} col={col} />
          ))}
        </div>

        {/* Products */}
        <SectionHeader
          label="IN STOCK"
          sub="FULL CATALOG"
          href="/catalog"
          linkLabel="FULL CATALOG"
        />

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 md:gap-6">
          {featuredProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <div className="h-16 md:h-24" />
    </div>
  );
}
