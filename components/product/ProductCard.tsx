// components/product/ProductCard.tsx
import React from "react";
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/types";

function ProductCardInner({ product }: { product: Product }) {
  const src =
    product.imagePlaceholder ||
    (product.images?.length ? product.images[0] : null) ||
    product.image ||
    "/globe.svg";

  return (
    <Link
      href={`/product/${product.slug}`}
      prefetch={false}
      className="group relative flex flex-col"
    >
      {/* --- Изображение --- */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-white/[0.03] border border-white/[0.06] transition-[border-color] duration-200 sm:duration-300 group-hover:border-white/[0.14]">
        <Image
          src={src}
          alt={product.name}
          fill
          unoptimized={false}
          sizes="(max-width: 479px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          loading="lazy"
          className="object-cover transition-transform duration-200 sm:duration-300 ease-out group-hover:scale-[1.02] sm:group-hover:scale-[1.03]"
        />

        {/* Статус-бейдж */}
        {product.status !== "available" && (
          <div className="absolute top-0 left-0 px-2 py-1 bg-black/80 text-[10px] font-mono uppercase tracking-widest text-white/90">
            {product.status === "sold_out" ? "SOLD OUT" : product.status.toUpperCase()}
          </div>
        )}
      </div>

      {/* --- Инфо под фото: цвет, название, цена --- */}
      <div className="mt-3 sm:mt-4 space-y-1">
        {product.specs?.color && (
          <span className="text-[10px] font-mono uppercase tracking-wider text-white/45">
            {product.specs.color}
          </span>
        )}
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

export const ProductCard = React.memo(ProductCardInner);
