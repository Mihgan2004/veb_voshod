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
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-sm tracking-[0.35em] uppercase text-white/70">CATALOG</h1>
          <div className="mt-2 text-xs text-white/50">
            {filtered.length} items
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            className="h-10 w-full sm:w-72 rounded-xl border border-white/10 bg-black/30 px-3 text-sm outline-none focus:border-white/20"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category | "all")}
            className="h-10 w-full sm:w-48 rounded-xl border border-white/10 bg-black/30 px-3 text-sm outline-none focus:border-white/20"
          >
            <option value="all">All</option>
            <option value="tee">TEE</option>
            <option value="hoodie">HOODIE</option>
            <option value="patch">PATCH</option>
            <option value="lanyard">LANYARD</option>
            <option value="accessory">ACCESSORY</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
