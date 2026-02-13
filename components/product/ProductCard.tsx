// components/product/ProductCard.tsx
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const src = product.imagePlaceholder || product.image || "/globe.svg";
  const isRemote = /^https?:\/\//.test(src);

  return (
    <Link href={`/product/${product.slug}`} prefetch={false} className="group relative flex flex-col">
      {/* --- Изображение --- */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-white/[0.03] border border-white/[0.06] transition-all duration-300 group-hover:border-white/[0.14]">
        <Image
          src={src}
          alt={product.name}
          fill
          unoptimized={isRemote}
          sizes="(max-width: 479px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-all duration-500 group-hover:scale-[1.03]"
        />

        {/* Статус-бейдж */}
        {product.status !== "available" && (
          <div className="absolute top-0 left-0 px-2 py-1 bg-black/80 text-[10px] font-mono uppercase tracking-widest text-white/90">
            {product.status === "sold_out" ? "SOLD OUT" : product.status.toUpperCase()}
          </div>
        )}
      </div>

      {/* --- Инфо под фото: название + цена --- */}
      <div className="mt-3 sm:mt-4 space-y-1">
        <h3 className="text-[13px] sm:text-[14px] font-medium leading-tight tracking-[0.01em] text-white/85 group-hover:text-white transition-colors duration-300 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-[13px] sm:text-[14px] font-semibold text-white tabular-nums">
          {product.price.toLocaleString("ru-RU")} &#8381;
        </p>
      </div>
    </Link>
  );
}
