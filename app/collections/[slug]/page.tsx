import { notFound } from 'next/navigation';
import { catalog } from '@/lib/catalog';
import { ProductCard } from '@/components/product/ProductCard';

export default async function CollectionDetailPage({ params }: { params: { slug: string } }) {
  const collection = await catalog.getCollectionBySlug(params.slug);
  if (!collection) notFound();

  const products = await catalog.getProductsByCollectionId(collection.id);

  return (
    <div className="pt-2 max-w-7xl mx-auto px-4 sm:px-6 animate-fade-in min-h-screen">
      <div className="mb-10 sm:mb-16">
        <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{collection.tag}</div>
        <h1 className="text-3xl sm:text-5xl font-light mt-3">{collection.name}</h1>
        <p className="mt-4 text-gray-400 max-w-2xl">{collection.description}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-12 sm:gap-y-16">
        {products.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}
