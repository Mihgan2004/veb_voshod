import { notFound } from "next/navigation";
import Link from "next/link";

import { catalog } from "@/lib/catalog";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/product/ProductCard";

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const collection = await catalog.getCollectionBySlug(slug);
  if (!collection) notFound();

  const products = await catalog.getProductsByCollectionId(collection.id);

  return (
    <div className="max-w-7xl mx-auto px-6 pt-24 md:pt-32 pb-24">
      <div className="mb-14">
        <div className="text-[10px] md:text-xs font-mono tracking-widest text-white/40 mb-3">
          // {collection.tag} / {collection.slug.toUpperCase()}
        </div>
        <h1 className="text-3xl md:text-5xl font-light tracking-wide text-white">
          {collection.name}
        </h1>
        {collection.description ? (
          <p className="mt-5 max-w-2xl text-sm md:text-base text-white/55 leading-relaxed">
            {collection.description}
          </p>
        ) : null}
      </div>

      {products.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-graphite-light p-6">
          <p className="text-sm text-white/70">В этой коллекции пока нет товаров.</p>
          <div className="mt-4">
            <Link
              href="/catalog"
              className="inline-flex items-center h-12 px-8 rounded-full border border-white/10 bg-white/5 text-[11px] uppercase tracking-[0.22em] text-gray-200 hover:border-gold/35 hover:bg-white/7 transition-all"
            >
              В КАТАЛОГ
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 md:gap-8">
          {products.map((p: Product) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
