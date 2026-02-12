// components/product/ProductCard.tsx
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const src = product.imagePlaceholder || product.image || "/globe.svg";
  const isRemote = /^https?:\/\//.test(src);

  return (
    <Link href={`/product/${product.slug}`} className="group relative flex flex-col">
      {/* --- Изображение --- */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl sm:rounded-2xl bg-graphite-light border border-white/5 transition-all duration-500 group-hover:border-white/15">
        <Image
          src={src}
          alt={product.name}
          fill
          unoptimized={isRemote}
          sizes="(max-width: 479px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover opacity-90 transition-all duration-700 group-hover:opacity-100 group-hover:scale-[1.03]"
        />

        {/* Нижний градиент для читаемости кода */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

        {/* Код и батч — всегда видны */}
        <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-3.5 flex items-end justify-between">
          <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.12em] text-white/70 uppercase leading-none">
            {product.specs?.code ?? product.slug}
          </span>
          {product.specs?.batch && (
            <span className="text-[9px] sm:text-[10px] font-mono tracking-wider text-white/40 uppercase leading-none">
              {product.specs.batch}
            </span>
          )}
        </div>

        {/* Статус-бейдж */}
        {product.status !== "available" && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 px-2 py-0.5 sm:px-2.5 sm:py-1 bg-black/60 backdrop-blur-sm border border-white/10 rounded text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-white/80">
            {product.status === "sold_out" ? "SOLD OUT" : product.status.toUpperCase()}
          </div>
        )}
      </div>

      {/* --- Информация под карточкой --- */}
      <div className="mt-2.5 sm:mt-3.5 flex flex-col gap-0.5 sm:gap-1">
        <h3 className="text-[13px] sm:text-[15px] font-medium leading-snug tracking-wide text-gray-200 group-hover:text-white transition-colors line-clamp-2">
          {product.name}
        </h3>
        <div className="flex items-baseline justify-between gap-2 mt-0.5">
          <span className="text-[10px] sm:text-[11px] font-mono text-white/35 uppercase tracking-[0.15em]">
            {product.category}
          </span>
          <span className="text-[13px] sm:text-sm font-mono text-gold/90 tabular-nums whitespace-nowrap">
            {product.price.toLocaleString("ru-RU")}&nbsp;&#8381;
          </span>
        </div>
      </div>
    </Link>
  );
}
