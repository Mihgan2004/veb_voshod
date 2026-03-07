import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="vx-footer">
      <div className="vx-footer-inner">
        {/* Brand signature — золотой градиент */}
        <div className="vx-footer-brand vx-footer-brand-gradient font-mono">
          ПРОЕКТ ВОСХОД — ПРОЕКТ ПРО ЛЮДЕЙ
        </div>

        <div className="vx-footer-divider" />

        {/* Main row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 md:gap-12">
          {/* Copyright */}
          <div className="vx-footer-meta font-mono">
            <p>© 2026 ВОСХОД. СОЛНЕЧНОГОРСК.</p>
            <p className="mt-1">ВСЕ ПРАВА ЗАЩИЩЕНЫ.</p>
          </div>

          {/* Legal links — без градиента, нейтральный цвет, свободнее */}
          <nav className="flex flex-wrap items-center justify-start md:justify-end gap-x-5 sm:gap-x-8 md:gap-x-10 gap-y-3 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.1em] sm:tracking-[0.16em] w-full min-w-0">
            <Link href="/legal/offer" className="text-white/45 hover:text-white/65 transition-colors">
              Оферта
            </Link>
            <Link href="/legal/shipping" className="text-white/45 hover:text-white/65 transition-colors">
              Доставка
            </Link>
            <Link href="/legal/policy" className="text-white/45 hover:text-white/65 transition-colors">
              Конфиденциальность
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
