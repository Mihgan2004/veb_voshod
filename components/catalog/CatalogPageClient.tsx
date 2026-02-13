"use client";

import { useMemo, useState, useEffect } from "react";
import type { Product, Category } from "@/lib/catalog";
import { ProductCard } from "@/components/product/ProductCard";

const CATEGORIES: { value: Category | "all"; label: string }[] = [
  { value: "all", label: "ALL" },
  { value: "tee", label: "TEE" },
  { value: "hoodie", label: "HOODIE" },
  { value: "patch", label: "PATCH" },
  { value: "lanyard", label: "LANYARD" },
  { value: "accessory", label: "ACC" },
];

const SEARCH_DEBOUNCE_MS = 200;

export function CatalogPageClient({ products }: { products: Product[] }) {
  const [queryInput, setQueryInput] = useState("");
  const [queryDebounced, setQueryDebounced] = useState("");
  const [category, setCategory] = useState<Category | "all">("all");

  useEffect(() => {
    const t = setTimeout(() => setQueryDebounced(queryInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [queryInput]);

  const filtered = useMemo(() => {
    const q = queryDebounced.toLowerCase();
    return products.filter((p) => {
      const okCategory = category === "all" ? true : p.category === category;
      const okQuery = q ? p.name.toLowerCase().includes(q) : true;
      return okCategory && okQuery;
    });
  }, [products, queryDebounced, category]);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        <h1 className="text-[28px] sm:text-[40px] font-medium tracking-[-0.02em] text-white">
          CATALOG
        </h1>
        <span className="h-px flex-1 bg-white/10 shrink-0" />
        <span className="text-[11px] font-mono tracking-[0.32em] uppercase text-white/45">
          {filtered.length} ITEMS
        </span>
      </div>

      {/* Filters + search */}
      <div className="mb-10 sm:mb-12 space-y-4">
        {/* Category pills — horizontal scroll on mobile */}
        <div className="flex gap-2 sm:gap-2.5 overflow-x-auto scrollbar-none pb-0.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`shrink-0 px-4 sm:px-5 py-2 sm:py-2.5 rounded-md text-[11px] sm:text-[12px] font-medium uppercase tracking-[0.18em] whitespace-nowrap transition-all duration-300 ${
                category === cat.value
                  ? "bg-white text-black"
                  : "border border-white/[0.08] bg-transparent text-white/40 hover:text-white/70 hover:border-white/[0.16]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <input
          value={queryInput}
          onChange={(e) => setQueryInput(e.target.value)}
          placeholder="Search..."
          className="h-10 w-full sm:w-56 rounded-md border border-white/[0.08] bg-transparent px-4 text-[13px] text-gray-200 outline-none placeholder:text-white/20 focus:border-white/20 transition-colors duration-300"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-3 sm:gap-x-4 gap-y-6 sm:gap-y-8">
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
