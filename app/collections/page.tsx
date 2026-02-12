import Link from "next/link";
import { catalog } from "@/lib/catalog";

export default async function CollectionsPage() {
  const collections = await catalog.listCollections();
  const products = await catalog.listProducts();

  const countByCollection = new Map<string, number>();
  for (const p of products) {
    if (!p.collectionId) continue;
    countByCollection.set(
      p.collectionId,
      (countByCollection.get(p.collectionId) ?? 0) + 1
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-20 sm:pt-24 md:pt-32 pb-20 sm:pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 sm:mb-10 md:mb-14">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <h1 className="text-[11px] sm:text-xs font-mono tracking-[0.25em] uppercase text-white/50 shrink-0">
            SECTORS
          </h1>
          <span className="h-px w-8 sm:w-16 bg-white/10 shrink-0" />
          <span className="text-[11px] sm:text-xs font-mono tracking-wider text-white/25 truncate">
            ALL COLLECTIONS
          </span>
        </div>
        <Link
          href="/catalog"
          className="shrink-0 ml-4 text-[11px] sm:text-xs font-mono tracking-[0.18em] text-gold hover:text-gold/80 uppercase transition-colors"
        >
          FULL CATALOG&nbsp;&rarr;
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {collections.map((col) => {
          const itemsCount = countByCollection.get(col.id) ?? 0;
          return (
            <Link
              key={col.id}
              href={`/collections/${col.slug}`}
              className="group relative flex flex-col justify-end rounded-xl sm:rounded-2xl border border-white/5 bg-graphite-light p-4 sm:p-6 min-h-[120px] sm:min-h-[160px] transition-all duration-300 hover:border-white/15 hover:bg-white/[0.02]"
            >
              <span className="text-[9px] sm:text-[10px] font-mono tracking-[0.2em] uppercase text-white/45">
                {col.tag}
              </span>
              <h2 className="mt-1.5 sm:mt-2 text-base sm:text-lg md:text-xl font-semibold tracking-tight text-white uppercase leading-tight">
                {col.name}
              </h2>
              {col.description && (
                <p className="mt-1.5 text-[11px] sm:text-xs leading-relaxed text-white/45 max-w-[44ch] line-clamp-2">
                  {col.description}
                </p>
              )}
              <div className="mt-2.5 sm:mt-3 text-[10px] sm:text-[11px] text-white/35 font-mono tracking-wider">
                {itemsCount} ITEM{itemsCount === 1 ? "" : "S"}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
