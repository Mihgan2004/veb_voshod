import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="vx-footer">
      <div className="vx-footer-inner">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="vx-footer-meta font-mono text-white/35">
            <p>© 2026 ВОСХОД. СОЛНЕЧНОГОРСК.</p>
            <p className="mt-1">ВСЕ ПРАВА ЗАЩИЩЕНЫ.</p>
          </div>
          <nav className="vx-footer-links font-mono">
            <Link href="/legal/offer" className="bg-gradient-to-r from-amber-700 via-yellow-500 to-amber-700 bg-[length:200%_100%] animate-gold-shimmer bg-clip-text text-transparent">Offer</Link>
            <Link href="/legal/shipping" className="bg-gradient-to-r from-amber-700 via-yellow-500 to-amber-700 bg-[length:200%_100%] animate-gold-shimmer bg-clip-text text-transparent">Shipping</Link>
            <Link href="/legal/policy" className="bg-gradient-to-r from-amber-700 via-yellow-500 to-amber-700 bg-[length:200%_100%] animate-gold-shimmer bg-clip-text text-transparent">Privacy</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
