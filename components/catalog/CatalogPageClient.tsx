'use client';

import React, { useMemo, useState } from 'react';
import type { Product } from '@/lib/types';
import { ProductCard } from '@/components/product/ProductCard';

export function CatalogPageClient({ products }: { products: Product[] }) {
  const [filter, setFilter] = useState<'all' | 'tee' | 'hoodie' | 'accessory'>('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return products;
    return products.filter(p => p.category === filter);
  }, [filter, products]);

  return (
    <div className="animate-fade-in min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <h1 className="text-3xl sm:text-4xl font-light">CATALOG</h1>

        <div className="flex flex-wrap gap-3 text-[10px] font-mono uppercase tracking-widest">
          {(['all', 'tee', 'hoodie', 'accessory'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 border rounded-full transition-all ${
                filter === cat
                  ? 'border-gold/50 text-gold bg-gold/10'
                  : 'border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-12 sm:gap-y-16">
        {filtered.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}
