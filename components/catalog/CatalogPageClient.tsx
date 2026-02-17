"use client";

import { useMemo, useState, useEffect, useDeferredValue } from "react";
import type { Product, Category } from "@/lib/catalog";
import { ProductCard } from "@/components/product/ProductCard";

const CATEGORY_LABELS: Record<Category, string> = {
  tee: "TEE",
  hoodie: "HOODIE",
  patch: "PATCH",
  cap: "CAP",
  lanyard: "LANYARD",
  accessory: "ACC",
  other: "OTHER",
};

const SEARCH_DEBOUNCE_MS = 200;

export function CatalogPageClient({ products }: { products: Product[] }) {
  const [queryInput, setQueryInput] = useState("");
  const [queryDebounced, setQueryDebounced] = useState("");
  const [category, setCategory] = useState<Category | "all">("all");

  const deferredCategory = useDeferredValue(category);
  const deferredQuery = useDeferredValue(queryDebounced);

  /** Категории из Directus: уникальные по товарам + ALL. Порядок: all, затем по алфавиту slug. */
  const categories = useMemo(() => {
    const slugs = Array.from(new Set(products.map((p) => p.category))).sort();
    const list: { value: Category | "all"; label: string }[] = [
      { value: "all", label: "ALL" },
      ...slugs.map((value) => ({ value, label: CATEGORY_LABELS[value] ?? value.toUpperCase() })),
    ];
    return list;
  }, [products]);

  useEffect(() => {
    const t = setTimeout(() => setQueryDebounced(queryInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [queryInput]);

  const filtered = useMemo(() => {
    const q = deferredQuery.toLowerCase();
    return products.filter((p) => {
      const okCategory = deferredCategory === "all" ? true : p.category === deferredCategory;
      const okQuery = q ? p.name.toLowerCase().includes(q) : true;
      return okCategory && okQuery;
    });
  }, [products, deferredQuery, deferredCategory]);

  return (
    <div>
      {/* Header — на десктопе крупнее и с воздухом */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6 mb-6 sm:mb-8 md:mb-10">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <h1 className="text-[28px] sm:text-[40px] md:text-[2.75rem] lg:text-[3rem] font-medium tracking-[-0.02em] text-white">
            КАТАЛОГ
          </h1>
          <span className="h-px flex-1 bg-white/10 shrink-0 hidden sm:block" />
          <span className="text-[11px] font-mono tracking-[0.32em] uppercase text-white/45 shrink-0">
            {filtered.length} ШАГ
          </span>
        </div>

        {/* Desktop: фильтры + поиск в одну строку */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6 lg:flex-1 lg:max-w-xl lg:justify-end">
          <div className="flex gap-2 sm:gap-2.5 overflow-x-auto scrollbar-none pb-0.5 [contain:paint] [-webkit-overflow-scrolling:touch] lg:flex-wrap lg:overflow-visible">
            {categories.map((cat) => (
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
          <input
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            placeholder="Search..."
            className="h-10 w-full sm:w-56 lg:w-48 rounded-md border border-white/[0.08] bg-transparent px-4 text-[13px] text-gray-200 outline-none placeholder:text-white/20 focus:border-white/20 transition-colors duration-300 shrink-0"
          />
        </div>
      </div>

      {/* Grid — на десктопе больше отступы и 4 колонки */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-3 sm:gap-x-4 md:gap-x-6 gap-y-6 sm:gap-y-8 md:gap-y-10">
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
