import { notFound } from "next/navigation";
import Link from "next/link";

import { catalog } from "@/lib/catalog";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/product/ProductCard";
import { PageShell } from "@/components/site/PageShell";

export const revalidate = 60;

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
    <PageShell>
      <div className="mb-14">
        <div className="text-[11px] font-mono tracking-[0.32em] uppercase text-white/45 mb-3">
          {collection.tag} / {collection.slug.toUpperCase()}
        </div>
        <h1 className="text-[28px] sm:text-[40px] font-medium tracking-[-0.02em] text-white">
          {collection.name}
        </h1>
        {collection.description ? (
          <p className="mt-5 max-w-2xl text-[14px] leading-[1.65] text-white/60">
            {collection.description}
          </p>
        ) : null}
      </div>

      {products.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
          <p className="text-[14px] leading-[1.65] text-white/60">В этой коллекции пока нет товаров.</p>
          <div className="mt-4">
            <Link
              href="/catalog"
              className="inline-flex items-center h-12 px-8 rounded-full border border-white/10 bg-white/[0.03] text-[11px] uppercase tracking-[0.22em] text-gray-200 hover:border-white/[0.18] hover:bg-white/[0.05] transition-all duration-300"
            >
              В КАТАЛОГ
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-3 sm:gap-x-4 gap-y-6 sm:gap-y-8">
          {products.map((p: Product) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </PageShell>
  );
}
