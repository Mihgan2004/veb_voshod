import { notFound } from "next/navigation";
import { catalog } from "@/lib/catalog";
import { ProductPageClient } from "@/components/product/ProductPageClient";

export const revalidate = 60;

export default async function ProductSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await catalog.getProductBySlug(slug);
  if (!product) notFound();

  return <ProductPageClient product={product} />;
}
