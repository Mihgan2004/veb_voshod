"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useCart } from "@/lib/cart/cart-store";
import { ASSETS } from "@/lib/assets";

const NAV_LINKS = [
  { href: "/collections", label: "КОЛЛЕКЦИИ" },
  { href: "/catalog", label: "КАТАЛОГ" },
  { href: "/cart", label: "КОРЗИНА" },
];

export const OrbitalDock: React.FC = () => {
  const pathname = usePathname();
  const cartCount = useCart((s) => s.cart.reduce((sum, i) => sum + i.qty, 0));

  const [time, setTime] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("ru-RU", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Europe/Moscow",
        }),
      );
    };
    updateTime();
    const t = setInterval(updateTime, 1000);
    let rafId = 0;
    let prev = false;
    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const next = window.scrollY > 50;
        if (next !== prev) {
          prev = next;
          setScrolled(next);
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      clearInterval(t);
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  /* Close menu on route change */
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  /* Lock body scroll when menu open */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* ---- Top bar (капсула): на мобилке — safe area, отступы, без переполнения) ---- */}
      <nav
        className={`fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-out ${
          scrolled ? "opacity-95" : "opacity-100"
        } 
        top-[max(1rem,env(safe-area-inset-top))] sm:top-5 md:top-6
        w-[calc(100%-2rem)] min-w-0 max-w-[min(90vw,720px)] sm:w-auto`}
      >
        <div className="relative rounded-full min-w-0">
          <div className="relative overflow-hidden rounded-full bg-[#141821]/90 sm:bg-graphite/60 sm:backdrop-blur-md border border-white/10 flex items-center justify-between sm:justify-start gap-3 sm:gap-6 md:gap-8 shadow-[0_12px_40px_rgba(0,0,0,0.4)] 
            px-4 py-2.5 sm:px-5 sm:py-2 md:px-6 md:py-2.5 min-h-[44px] sm:min-h-0">
            {/* Logo — rendered at 20px, source should be 80px+ for retina */}
            <Link href="/" className="shrink-0 flex items-center">
              <Image
                src={ASSETS.header.logo}
                alt="VOSKHOD"
                width={59}
                height={32}
                sizes="59px"
                className="h-5 md:h-[22px] w-auto"
                priority
              />
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8 text-[11px] md:text-[12px] font-medium text-gray-400 z-10 tracking-[0.02em]">
              <Link
                href="/catalog"
                className={`hover:text-white transition-colors duration-200 ${isActive("/catalog") ? "text-white" : ""}`}
              >
                КАТАЛОГ
              </Link>
              <Link
                href="/collections"
                className={`hover:text-white transition-colors duration-200 ${isActive("/collections") ? "text-white" : ""}`}
              >
                КОЛЛЕКЦИИ
              </Link>
            </div>

            {/* Time + Cart (desktop) */}
            <div className="hidden md:flex items-center gap-4 text-[11px] md:text-[12px] font-mono text-gray-400 z-10 tracking-wide">
              {time ? (
                <span className="border-r border-white/10 pr-3" suppressHydrationWarning>
                  MSC {time}
                </span>
              ) : null}
              <Link href="/cart" className="hover:text-white transition-colors duration-200 flex items-center gap-1">
                CART <span className="text-white">[{cartCount}]</span>
              </Link>
            </div>

            {/* Мобилка: лого слева, иконки корзины и меню справа */}
            <div className="flex md:hidden items-center gap-2 shrink-0">
              <Link
                href="/cart"
                aria-label={`Корзина${cartCount > 0 ? `, товаров: ${cartCount}` : ""}`}
                className="relative shrink-0 w-9 h-9 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/[0.06] transition-all duration-200 z-10"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                  <path d="M3 6h18" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-gold text-graphite text-[10px] font-bold tabular-nums">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Menu"
                className="shrink-0 w-9 h-9 flex flex-col items-center justify-center gap-[4px] text-white/70 hover:text-white hover:bg-white/[0.06] rounded-full transition-colors duration-200"
              >
                <span className={`block w-[16px] h-[1.5px] bg-current transition-all duration-300 origin-center ${menuOpen ? "rotate-45 translate-y-[5.5px]" : ""}`} />
                <span className={`block w-[16px] h-[1.5px] bg-current transition-all duration-300 ${menuOpen ? "opacity-0 scale-x-0" : ""}`} />
                <span className={`block w-[16px] h-[1.5px] bg-current transition-all duration-300 origin-center ${menuOpen ? "-rotate-45 -translate-y-[5.5px]" : ""}`} />
              </button>
            </div>
          </div>

          <div className="absolute inset-0 rounded-full border border-white/5 pointer-events-none mix-blend-overlay" />
        </div>
      </nav>

      {/* ---- Fullscreen mobile menu ---- */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-300 ${
          menuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-graphite/95 backdrop-blur-sm"
          onClick={() => setMenuOpen(false)}
        />

        {/* Menu content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`text-[20px] font-semibold uppercase tracking-[0.28em] transition-colors duration-200 ${
                isActive(link.href) ? "text-white" : "text-white/50 hover:text-white/80"
              }`}
            >
              {link.label}
              {link.href === "/cart" && cartCount > 0 && (
                <span className="ml-2 text-[14px] text-white/40">[{cartCount}]</span>
              )}
            </Link>
          ))}

          {/* Time in menu */}
          {time && (
            <span className="mt-4 text-[11px] font-mono tracking-[0.32em] text-white/25" suppressHydrationWarning>
              MSC {time}
            </span>
          )}
        </div>
      </div>
    </>
  );
};
