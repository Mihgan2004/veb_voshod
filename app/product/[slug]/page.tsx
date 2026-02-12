import { notFound } from "next/navigation";
import { catalog } from "@/lib/catalog";
import { ProductPageClient } from "@/components/product/ProductPageClient";

export default async function ProductSlugPage({ params }: { params: { slug: string } }) {
  const product = await catalog.getProductBySlug(params.slug);
  if (!product) notFound();

  return <ProductPageClient product={product} />;
}
