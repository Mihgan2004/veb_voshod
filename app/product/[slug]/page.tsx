import { notFound } from 'next/navigation';
import { catalog } from '@/lib/catalog';
import { ProductPageClient } from '@/components/product/ProductPageClient';

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await catalog.getProductBySlug(params.slug);
  if (!product) notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <ProductPageClient product={product} />
    </div>
  );
}
