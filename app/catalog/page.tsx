// app/catalog/page.tsx
import { catalog } from "@/lib/catalog";
import { CatalogPageClient } from "@/components/catalog/CatalogPageClient";
import { PageShell } from "@/components/site/PageShell";

export default async function CatalogPage() {
  const products = await catalog.listProducts();

  return (
    <PageShell>
      <CatalogPageClient products={products} />
    </PageShell>
  );
}
