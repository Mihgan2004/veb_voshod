import Link from "next/link";
import Hero from "@/components/hero/Hero";
import { WelcomeBlock } from "@/components/blocks/WelcomeBlock";
import { TeeIntroBlock } from "@/components/blocks/TeeIntroBlock";
import { ProductCard } from "@/components/product/ProductCard";
import { catalog } from "@/lib/catalog";
import type { Collection, Product } from "@/lib/catalog";

function SectionHeader(props: { title: string; href?: string; linkText?: string }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <h2 className="text-sm tracking-[0.35em] uppercase text-white/70">{props.title}</h2>
      {props.href ? (
        <Link
          href={props.href}
          className="text-[10px] tracking-[0.35em] uppercase text-white/45 hover:text-white/80 transition"
        >
          {props.linkText ?? "VIEW ALL"}
        </Link>
      ) : null}
    </div>
  );
}

function CollectionCard({ col }: { col: Collection }) {
  return (
    <Link
      href={`/collections/${col.slug}`}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/25 p-6 transition hover:border-white/20"
    >
      <div className="text-[10px] tracking-[0.35em] uppercase text-white/55">
        {col.tag}
      </div>
      <div className="mt-3 text-xl font-semibold tracking-tight">{col.name}</div>
      {col.description ? (
        <div className="mt-2 text-xs leading-relaxed text-white/60 max-w-[44ch]">
          {col.description}
        </div>
      ) : null}

      <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100">
        <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-[#C6902E]/10 blur-2xl" />
        <div className="absolute -right-24 -bottom-24 h-64 w-64 rounded-full bg-white/5 blur-2xl" />
      </div>
    </Link>
  );
}

export default async function HomePage() {
  const collections = await catalog.listCollections();
  const products = await catalog.listProducts();

  const featuredCollections = collections.slice(0, 4);
  const inStock = products.filter((p: Product) => p.status === "available").slice(0, 8);

  return (
    <div className="animate-fade-in">
      <Hero />
      <WelcomeBlock />
      <TeeIntroBlock />

      <section className="mx-auto max-w-7xl px-6 mt-16">
        <SectionHeader title="SECTORS" href="/collections" linkText="ALL COLLECTIONS" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredCollections.map((col) => (
            <CollectionCard key={col.id} col={col} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 mt-16">
        <SectionHeader title="IN STOCK" href="/catalog" linkText="FULL CATALOG" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {inStock.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <div className="h-24" />
    </div>
  );
}
