// components/product/ProductPageClient.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { useCart } from "@/lib/cart/cart-store";

export function ProductPageClient({ product }: { product: Product }) {
  const addToCart = useCart((s) => s.addToCart);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] ?? "ONE SIZE");

  const src = product.image || product.imagePlaceholder || "/globe.svg";
  const isRemote = /^https?:\/\//.test(src);

  const statusLabel =
    product.status === "available"
      ? "IN STOCK"
      : product.status === "preorder"
        ? "PREORDER"
        : "SOLD OUT";

  return (
    <div className="animate-fade-in min-h-screen">
      <div className="max-w-7xl mx-auto px-6 pt-24 md:pt-32 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <div className="relative bg-graphite-light rounded-xl border border-white/5 overflow-hidden aspect-[3/4] min-h-[360px] lg:min-h-[640px]">
            <Image
              src={src}
              alt={product.name}
              fill
              unoptimized={isRemote}
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          <div>
            <div className="text-[10px] md:text-xs font-mono tracking-widest text-white/40 mb-3">
              // PROJECT VOSKHOD / {product.category.toUpperCase()}
            </div>
            <h1 className="text-3xl md:text-5xl font-light tracking-wide text-white">
              {product.name}
            </h1>
            <div className="mt-4 text-xl font-mono text-gold">
              {product.price.toLocaleString("ru-RU")} ₽
            </div>
            <p className="mt-5 max-w-2xl text-sm md:text-base text-white/55 leading-relaxed">
              {product.description}
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4 max-w-2xl">
              <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-4">
                <div className="text-[10px] font-mono text-white/35">CODE</div>
                <div className="mt-1 text-xs font-mono text-white/65">
                  {product.specs?.code ?? product.slug.toUpperCase()}
                </div>
                <div className="mt-3 text-[10px] font-mono text-white/35">STATUS</div>
                <div className="mt-1 text-xs font-mono text-white/65">{statusLabel}</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-4">
                <div className="text-[10px] font-mono text-white/35">MATERIAL</div>
                <div className="mt-1 text-xs font-mono text-white/65">
                  {product.specs?.fabric ?? "GRAPHITE"}
                </div>
                <div className="mt-3 text-[10px] font-mono text-white/35">TAG</div>
                <div className="mt-1 text-xs font-mono text-white/65">
                  {product.specs?.batch ? `BATCH ${product.specs.batch}` : product.category.toUpperCase()}
                </div>
              </div>
            </div>

            <div className="mt-10">
              <div className="text-[10px] font-mono text-white/35 uppercase tracking-widest mb-3">
                SIZE
              </div>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-14 h-12 border rounded-xl font-mono text-sm transition-all ${
                      selectedSize === size
                        ? "border-gold text-gold bg-gold/10"
                        : "border-white/10 text-gray-300 hover:border-white/20"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <button
              disabled={!product.inStock}
              onClick={() => addToCart(product, selectedSize)}
              className="mt-10 inline-flex items-center justify-center h-12 md:h-14 px-8 md:px-10 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-[11px] md:text-xs uppercase tracking-[0.22em] text-gray-200 transition-all duration-300 hover:border-gold/35 hover:bg-white/7 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-white/10 disabled:hover:bg-white/5"
            >
              {product.inStock ? "ДОБАВИТЬ В КОРЗИНУ →" : "SOLD OUT"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
