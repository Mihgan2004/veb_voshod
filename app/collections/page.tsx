import Link from "next/link";
import { notFound } from "next/navigation";
import { catalog } from "@/lib/catalog";
import { ProductCard } from "@/components/product/ProductCard";
import type { Product } from "@/lib/catalog";

export default async function CollectionSlugPage({ params }: { params: { slug: string } }) {
  const col = await catalog.getCollectionBySlug(params.slug);
  if (!col) notFound();

  // используем стабильный метод (алиас тоже есть)
  const products = await catalog.getProductsByCollectionId(col.id);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <div className="text-[10px] tracking-[0.35em] uppercase text-white/55">{col.tag}</div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{col.name}</h1>
          {col.description ? <p className="mt-2 text-sm text-white/60">{col.description}</p> : null}
        </div>

        <Link href="/collections" className="text-[10px] tracking-[0.35em] uppercase text-white/45 hover:text-white/80">
          ALL COLLECTIONS
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((p: Product) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
