// components/product/ProductPageClient.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { useCart } from "@/lib/cart/cart-store";

export function ProductPageClient({ product }: { product: Product }) {
  const addToCart = useCart((s) => s.addToCart);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] ?? "ONE SIZE");

  const src = product.image;
  const isRemote = /^https?:\/\//.test(src);

  return (
    <div className="animate-fade-in min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        <div className="relative bg-graphite-light rounded-2xl border border-white/5 overflow-hidden min-h-[360px] lg:min-h-[640px]">
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
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                {product.category} / {product.collectionId}
              </div>
              <h1 className="text-2xl sm:text-4xl font-light mt-3">{product.name}</h1>
            </div>
            <div className="text-xl sm:text-2xl font-mono text-gold">
              {product.price.toLocaleString("ru-RU")} ₽
            </div>
          </div>

          <p className="mt-6 text-gray-400 leading-relaxed">{product.description}</p>

          <div className="mt-10">
            <div className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-4">
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
            className={`mt-10 w-full py-4 rounded-2xl font-mono uppercase tracking-widest text-sm transition-all ${
              product.inStock
                ? "bg-gold/15 border border-gold/40 text-gold hover:bg-gold/20"
                : "bg-white/5 border border-white/10 text-gray-600 cursor-not-allowed"
            }`}
          >
            {product.inStock ? "ADD TO CART" : "SOLD OUT"}
          </button>
        </div>
      </div>
    </div>
  );
}
