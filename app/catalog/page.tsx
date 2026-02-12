// app/catalog/page.tsx
import { catalog } from "@/lib/catalog";
import { CatalogPageClient } from "@/components/catalog/CatalogPageClient";

export default async function CatalogPage() {
  const products = await catalog.listProducts();

  return (
    <section className="max-w-7xl mx-auto px-6 pt-24 md:pt-32 pb-24">
      <CatalogPageClient products={products} />
    </section>
  );
}
