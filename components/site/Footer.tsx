import React from "react";
import Link from "next/link";

const GOLD_GRADIENT = "bg-gradient-to-r from-amber-700 via-yellow-500 to-amber-700 bg-[length:200%_100%] animate-gold-shimmer bg-clip-text text-transparent";

export function Footer() {
  return (
    <footer className="vx-footer">
      <div className="vx-footer-inner">
        {/* Brand signature */}
        <div className="vx-footer-brand font-mono">
          ПРОЕКТ ВОСХОД — ТАКТИЧЕСКИЙ МЕРЧ
        </div>

        <div className="vx-footer-divider" />

        {/* Main row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 md:gap-12">
          {/* Copyright */}
          <div className="vx-footer-meta font-mono">
            <p>© 2026 ВОСХОД. СОЛНЕЧНОГОРСК.</p>
            <p className="mt-1">ВСЕ ПРАВА ЗАЩИЩЕНЫ.</p>
          </div>

          {/* Legal links — gold gradient */}
          <nav className="flex items-center gap-6 sm:gap-8 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.18em]">
            <Link href="/legal/offer" className={GOLD_GRADIENT}>
              Оферта
            </Link>
            <span className="text-white/10 select-none" aria-hidden>·</span>
            <Link href="/legal/shipping" className={GOLD_GRADIENT}>
              Доставка
            </Link>
            <span className="text-white/10 select-none" aria-hidden>·</span>
            <Link href="/legal/policy" className={GOLD_GRADIENT}>
              Конфиденциальность
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
