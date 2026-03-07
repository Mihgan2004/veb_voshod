import React from "react";
import Link from "next/link";

const GOLD_GRADIENT = "bg-gradient-to-r from-amber-800/90 via-amber-600/70 to-amber-800/90 bg-[length:200%_100%] animate-gold-shimmer bg-clip-text text-transparent";

export function Footer() {
  return (
    <footer className="vx-footer">
      <div className="vx-footer-inner">
        {/* Main row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 md:gap-12">
          {/* Copyright */}
          <div className="vx-footer-meta font-mono">
            <p>© 2026 ВОСХОД. СОЛНЕЧНОГОРСК.</p>
            <p className="mt-1">ВСЕ ПРАВА ЗАЩИЩЕНЫ.</p>
          </div>

          {/* Legal links — золотой градиент */}
          <nav className="flex flex-wrap items-center justify-start md:justify-end gap-x-5 sm:gap-x-8 md:gap-x-10 gap-y-3 font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.14em] sm:tracking-[0.2em] w-full min-w-0">
            <Link href="/legal/offer" className={GOLD_GRADIENT}>
              Оферта
            </Link>
            <Link href="/legal/shipping" className={GOLD_GRADIENT}>
              Доставка
            </Link>
            <Link href="/legal/policy" className={GOLD_GRADIENT}>
              Конфиденциальность
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
