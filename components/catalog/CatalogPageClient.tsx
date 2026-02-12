"use client";

import { useMemo, useState } from "react";
import type { Product, Category } from "@/lib/catalog";
import { ProductCard } from "@/components/product/ProductCard";

export function CatalogPageClient({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "all">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const okCategory = category === "all" ? true : p.category === category;
      const okQuery = q ? p.name.toLowerCase().includes(q) : true;
      return okCategory && okQuery;
    });
  }, [products, query, category]);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        <h1 className="text-[11px] sm:text-xs font-mono tracking-[0.25em] uppercase text-white/50 shrink-0">
          FULL CATALOG
        </h1>
        <span className="h-px w-8 sm:w-16 bg-white/10 shrink-0" />
        <span className="text-[11px] sm:text-xs font-mono tracking-wider text-white/25">
          {filtered.length} items
        </span>
      </div>

      {/* Filters */}
      <div className="mb-8 sm:mb-10 flex flex-col sm:flex-row gap-2.5 sm:gap-3 sm:items-center">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search..."
          className="h-10 w-full sm:w-64 rounded-lg sm:rounded-xl border border-white/10 bg-graphite-light px-3 text-sm text-gray-200 outline-none placeholder:text-white/25 focus:border-gold/40 transition-colors"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Category | "all")}
          className="h-10 w-full sm:w-44 rounded-lg sm:rounded-xl border border-white/10 bg-graphite-light px-3 text-sm text-gray-200 outline-none focus:border-gold/40 transition-colors"
        >
          <option value="all">All</option>
          <option value="tee">TEE</option>
          <option value="hoodie">HOODIE</option>
          <option value="patch">PATCH</option>
          <option value="lanyard">LANYARD</option>
          <option value="accessory">ACCESSORY</option>
        </select>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 md:gap-6">
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
