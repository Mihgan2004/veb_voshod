"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/types";

function ProductCardInner({ product }: { product: Product }) {
  const [imgError, setImgError] = useState(false);
  
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
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-[#0a0c0f] border border-white/[0.05] transition-[border-color] duration-300 group-hover:border-white/[0.10]">
        {imgError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/[0.02]">
            <span className="text-[9px] font-mono text-white/20 tracking-widest">NO IMAGE</span>
          </div>
        ) : (
          <Image
            src={src}
            alt={product.name}
            fill
            unoptimized
            sizes="(max-width: 479px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            loading="lazy"
            onError={() => setImgError(true)}
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
          />
        )}

        {product.status !== "available" && (
          <div className="absolute top-0 left-0 px-2.5 py-1 bg-black/85 text-[9px] font-mono uppercase tracking-[0.18em] text-white/80">
            {product.status === "sold_out" ? "SOLD OUT" : product.status.toUpperCase()}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-3 sm:mt-3.5 space-y-1">
        {product.specs?.color && (
          <span className="text-[9px] md:text-[10px] font-mono uppercase tracking-[0.18em] text-white/35">
            {product.specs.color}
          </span>
        )}
        <h3 className="text-[13px] sm:text-[14px] font-medium leading-tight tracking-[0.01em] text-white/80 group-hover:text-white/95 transition-colors duration-300 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-[13px] sm:text-[14px] font-semibold text-white/90 vx-price">
          {product.price.toLocaleString("ru-RU")} ₽
        </p>
      </div>
    </Link>
  );
}

export const ProductCard = React.memo(ProductCardInner);
