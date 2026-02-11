import { catalog } from '@/lib/catalog';
import { CatalogPageClient } from '@/components/catalog/CatalogPageClient';

export default async function CatalogPage() {
  const products = await catalog.getProducts();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <CatalogPageClient products={products} />
    </div>
  );
}
