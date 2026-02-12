import Link from "next/link";
import { catalog } from "@/lib/catalog";

export default async function CollectionsPage() {
  const collections = await catalog.listCollections();
  const products = await catalog.listProducts();

  const countByCollection = new Map<string, number>();
  for (const p of products) {
    if (!p.collectionId) continue;
    countByCollection.set(p.collectionId, (countByCollection.get(p.collectionId) ?? 0) + 1);
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 space-y-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-xs tracking-[0.35em] uppercase text-white/60">COLLECTIONS</div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight">Сектора VOSKHOD</h1>
          <p className="mt-2 text-sm text-white/60 max-w-xl">
            Постоянные и лимитированные коллекции проекта. Выберите сектор, чтобы посмотреть все
            доступные позиции.
          </p>
        </div>

        <Link
          href="/catalog"
          className="text-[10px] tracking-[0.35em] uppercase text-white/45 hover:text-white/80"
        >
          FULL CATALOG
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {collections.map((col) => {
          const itemsCount = countByCollection.get(col.id) ?? 0;
          return (
            <Link
              key={col.id}
              href={`/collections/${col.slug}`}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/25 p-6 transition hover:border-white/25"
            >
              <div className="text-[10px] tracking-[0.35em] uppercase text-white/55">
                {col.tag}
              </div>
              <div className="mt-3 text-xl font-semibold tracking-tight">{col.name}</div>
              {col.description ? (
                <p className="mt-2 text-xs leading-relaxed text-white/60 max-w-[44ch]">
                  {col.description}
                </p>
              ) : null}
              <div className="mt-4 text-[11px] text-white/50 font-mono">
                {itemsCount} ITEM{itemsCount === 1 ? "" : "S"}
              </div>

              <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100">
                <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-[#C6902E]/10 blur-2xl" />
                <div className="absolute -right-24 -bottom-24 h-64 w-64 rounded-full bg-white/5 blur-2xl" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
