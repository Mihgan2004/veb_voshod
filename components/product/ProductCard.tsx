// components/product/ProductCard.tsx
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const src = product.imagePlaceholder || product.image || "/globe.svg";
  const isRemote = /^https?:\/\//.test(src);

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block overflow-hidden rounded-2xl border border-white/10 bg-black/20"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        <Image
          src={src}
          alt={product.name}
          fill
          unoptimized={isRemote}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-sm tracking-wide">{product.name}</div>
            <div className="mt-1 text-xs text-white/60">
              {product.category.toUpperCase()}
            </div>
          </div>
          <div className="shrink-0 text-sm text-gold">
            {product.price.toLocaleString("ru-RU")} ₽
          </div>
        </div>
      </div>
    </Link>
  );
}
