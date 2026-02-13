import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-10 sm:mt-14 border-t border-white/5 py-14 sm:py-12 px-4 sm:px-6">
      <div className="max-w-[1240px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="text-[11px] font-mono tracking-[0.32em] uppercase text-white/35">
          <p>© 2024 ВОСХОД. МОСКВА.</p>
          <p className="mt-1">ВСЕ ПРАВА ЗАЩИЩЕНЫ.</p>
        </div>
        <div className="flex gap-6 text-[11px] font-mono uppercase tracking-[0.32em] text-white/45">
          <Link href="/legal/offer" className="hover:text-white/80 transition-colors duration-300">
            Offer
          </Link>
          <Link href="/legal/shipping" className="hover:text-white/80 transition-colors duration-300">
            Shipping
          </Link>
          <Link href="/legal/policy" className="hover:text-white/80 transition-colors duration-300">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}
