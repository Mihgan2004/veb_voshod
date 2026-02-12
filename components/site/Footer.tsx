import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-32 border-t border-white/5 py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="text-xs text-gray-600 font-mono">
          <p>© 2024 ВОСХОД. МОСКВА.</p>
          <p className="mt-1">ВСЕ ПРАВА ЗАЩИЩЕНЫ.</p>
        </div>
        <div className="flex gap-6 text-xs text-gray-400 uppercase tracking-widest">
          <Link href="/legal/offer" className="hover:text-gold">
            Offer
          </Link>
          <Link href="/legal/shipping" className="hover:text-gold">
            Shipping
          </Link>
          <Link href="/legal/policy" className="hover:text-gold">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}
