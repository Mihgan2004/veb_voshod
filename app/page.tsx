import Link from "next/link";
import Hero from "@/components/hero/Hero";
import { WelcomeBlock } from "@/components/blocks/WelcomeBlock";
import { TeeIntroBlock } from "@/components/blocks/TeeIntroBlock";
import { ProductCard } from "@/components/product/ProductCard";
import { catalog } from "@/lib/catalog";
import type { Collection, Product } from "@/lib/catalog/types";

export default async function HomePage() {
  const collections = await catalog.listCollections();
  const products = await catalog.listProducts();

  const featuredCollections = collections.slice(0, 4);
  const featuredProducts = products.slice(0, 8);

  return (
    <div className="animate-fade-in">
      <Hero />
      <WelcomeBlock />
      <TeeIntroBlock />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-10 sm:mt-16 mb-16 sm:mb-24">
        <div className="flex justify-between items-end mb-8 sm:mb-12 border-b border-white/5 pb-4">
          <h2 className="text-lg sm:text-xl font-light text-white">SECTORS</h2>
          <Link
            href="/collections"
            className="text-[10px] sm:text-xs text-gold hover:underline underline-offset-4 uppercase tracking-widest"
          >
            View All
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredCollections.map((col: Collection) => (
            <Link
              key={col.id}
              href={`/collections/${col.slug}`}
              className="group block bg-white/5 p-7 sm:p-8 rounded-xl hover:bg-white/10 transition-colors border border-transparent hover:border-white/10"
            >
              <div className="flex justify-between items-start mb-10 sm:mb-12">
                <span className="text-[10px] font-mono text-gray-500">{col.id.toUpperCase()}</span>
                {col.tag === "LIMITED" && (
                  <span className="w-2 h-2 rounded-full bg-crimson shadow-[0_0_8px_rgba(255,77,77,0.8)]" />
                )}
              </div>
              <h3 className="text-xl sm:text-2xl font-light text-gray-200 group-hover:text-white">{col.name}</h3>
              <p className="text-xs text-gray-500 mt-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
                {col.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-end mb-8 sm:mb-12 border-b border-white/5 pb-4">
          <h2 className="text-lg sm:text-xl font-light text-white">IN STOCK</h2>
          <Link
            href="/catalog"
            className="text-[10px] sm:text-xs text-gold hover:underline underline-offset-4 uppercase tracking-widest"
          >
            Full Catalog
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-12 sm:gap-y-16">
          {featuredProducts.map((p: Product) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
