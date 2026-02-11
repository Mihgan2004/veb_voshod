import Link from "next/link";
import type { Product } from "@/lib/catalog";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block overflow-hidden rounded-2xl border border-white/10 bg-black/20"
    >
      <div className="aspect-[3/4] w-full overflow-hidden">
        {/* карточки ты просил НЕ трогать — img оставляю */}
        <img
          src={product.imagePlaceholder}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-sm tracking-wide">{product.name}</div>
            <div className="mt-1 text-xs text-white/60">{product.category.toUpperCase()}</div>
          </div>
          <div className="shrink-0 text-sm text-gold">{product.price.toLocaleString("ru-RU")} ₽</div>
        </div>
      </div>
    </Link>
  );
}
