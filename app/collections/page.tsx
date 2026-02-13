import Link from "next/link";
import { catalog } from "@/lib/catalog";
import { PageShell } from "@/components/site/PageShell";

export const revalidate = 60;

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
    <PageShell>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <h1 className="text-[11px] font-mono uppercase tracking-[0.32em] text-white/45 shrink-0">
            SECTORS
          </h1>
          <span className="h-px w-8 sm:w-16 bg-white/10 shrink-0" />
          <span className="text-[11px] font-mono tracking-[0.32em] uppercase text-white/25 truncate">
            ALL COLLECTIONS
          </span>
        </div>
        <Link
          href="/catalog"
          className="shrink-0 ml-4 text-[11px] font-mono tracking-[0.32em] text-white/45 hover:text-white/70 uppercase transition-colors duration-300"
        >
          FULL CATALOG&nbsp;&rarr;
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {collections.map((col) => {
          const itemsCount = countByCollection.get(col.id) ?? 0;
          return (
            <Link
              key={col.id}
              href={`/collections/${col.slug}`}
              className="group relative aspect-video overflow-hidden rounded-sm border border-white/[0.06] bg-white/[0.03] transition-all duration-300 hover:border-white/[0.14]"
            >
              {/* Diagonal accent */}
              <div className="absolute -top-[1px] -right-[1px] w-16 h-16">
                <div className="absolute top-0 right-0 w-full h-full overflow-hidden">
                  <div className="absolute top-0 right-0 w-[1px] h-full bg-white/10 origin-top-right rotate-[-45deg] translate-x-[22px]" />
                </div>
              </div>

              {/* Tag — top left */}
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex items-center gap-3">
                <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/40">
                  {col.tag}
                </span>
              </div>

              {/* Item count — top right */}
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                <span className="text-[10px] font-mono tracking-[0.2em] text-white/25">
                  {itemsCount} ITEM{itemsCount === 1 ? "" : "S"}
                </span>
              </div>

              {/* Name — bottom left */}
              <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4">
                <h2 className="text-[18px] sm:text-[22px] md:text-[26px] font-bold tracking-tight text-white uppercase leading-[1.1]">
                  {col.name}
                </h2>
                {col.description && (
                  <p className="mt-1 text-[11px] leading-relaxed text-white/35 line-clamp-1 max-w-[36ch]">
                    {col.description}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </PageShell>
  );
}
