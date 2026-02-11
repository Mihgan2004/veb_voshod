import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24 text-center">
      <div className="text-[10px] font-mono text-gray-500 tracking-[0.35em] uppercase">404</div>
      <h1 className="mt-4 text-3xl sm:text-4xl font-light">Page not found</h1>
      <Link href="/" className="mt-8 inline-block text-gold text-xs uppercase tracking-widest hover:underline underline-offset-4">
        Back to home
      </Link>
    </div>
  );
}
