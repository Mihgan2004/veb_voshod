import Link from 'next/link';
import { catalog } from '@/lib/catalog';

export default async function CollectionsPage() {
  const collections = await catalog.getCollections();

  return (
    <div className="pt-2 max-w-7xl mx-auto px-4 sm:px-6 animate-fade-in min-h-screen">
      <h1 className="text-3xl sm:text-4xl font-light mb-10 sm:mb-16">COLLECTIONS</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {collections.map(col => (
          <Link
            key={col.id}
            href={`/collections/${col.slug}`}
            className="group relative h-56 sm:h-64 bg-graphite-light rounded-2xl border border-white/5 overflow-hidden flex items-center justify-center hover:border-gold/20 transition-all duration-500"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10 text-center px-6">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-widest text-gray-400 group-hover:text-white transition-colors uppercase">
                {col.name}
              </h2>
              <div className="h-0 overflow-hidden group-hover:h-auto group-hover:mt-4 transition-all duration-300">
                <span className="inline-block px-3 py-1 border border-gold/50 text-gold text-[10px] font-mono rounded-full">
                  {col.tag} / {col.id.toUpperCase()}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
