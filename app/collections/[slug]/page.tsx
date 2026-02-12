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
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="text-xs tracking-[0.25em] text-[#C6902E]">
          {collection.tag ?? "COLLECTION"}
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold">{collection.name}</h1>
        {collection.description ? (
          <p className="text-sm text-white/70 max-w-2xl">{collection.description}</p>
        ) : null}
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-white/70">В этой коллекции пока нет товаров.</p>
          <div className="mt-4">
            <Link className="text-sm text-[#C6902E] hover:underline" href="/catalog">
              Перейти в каталог
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p: Product) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
