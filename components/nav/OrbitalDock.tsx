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
  const stampVisible = useCart((s) => s.stampVisible);

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

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const isActive = (href: string) => pathname === href;

  return (
    <>
      <nav
        className={`fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-out
        top-[max(0.75rem,env(safe-area-inset-top))] sm:top-4 md:top-5
        w-max max-w-[calc(100%-1.5rem)] sm:max-w-[min(88vw,680px)]`}
      >
        <div className="relative rounded-full">
          <div className={`relative overflow-hidden rounded-full
            flex items-center gap-1.5 sm:gap-5 md:gap-7
            px-2.5 py-1.5 sm:px-4 sm:py-2 md:px-5 md:py-2
            min-h-[38px] sm:min-h-0
            border transition-all duration-500
            ${scrolled
              ? "bg-[#0c0e13]/92 backdrop-blur-xl border-white/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
              : "bg-[#0c0e13]/75 backdrop-blur-md border-white/[0.04] shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
            }`}
          >
            <Link href="/" className="shrink-0 flex items-center pl-0.5">
              <Image
                src={ASSETS.header.logo}
                alt="VOSKHOD"
                width={59}
                height={32}
                sizes="59px"
                className="h-[18px] md:h-5 w-auto opacity-90 hover:opacity-100 transition-opacity duration-200"
                priority
              />
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-5 lg:gap-7 text-[11px] font-medium text-white/40 z-10 tracking-[0.14em]">
              <Link
                href="/catalog"
                className={`transition-colors duration-200 hover:text-white/80 ${isActive("/catalog") ? "text-white/90" : ""}`}
              >
                КАТАЛОГ
              </Link>
              <Link
                href="/collections"
                className={`transition-colors duration-200 hover:text-white/80 ${isActive("/collections") ? "text-white/90" : ""}`}
              >
                КОЛЛЕКЦИИ
              </Link>
            </div>

            {/* Time + Cart (desktop) */}
            <div className="hidden md:flex items-center gap-3 text-[10px] font-mono text-white/35 z-10 tracking-wider">
              {time ? (
                <span className="border-r border-white/[0.06] pr-3 tabular-nums" suppressHydrationWarning>
                  MSC {time}
                </span>
              ) : null}
              <Link
                href="/cart"
                className={`hover:text-white/70 transition-colors duration-200 flex items-center gap-1.5 ${stampVisible ? "animate-cart-pulse" : ""}`}
              >
                <span className="text-white/40">CART</span>
                <span className="text-white/60 tabular-nums">[{cartCount}]</span>
              </Link>
            </div>

            {/* Mobile: cart + burger */}
            <div className="flex md:hidden items-center gap-0.5 shrink-0">
              <Link
                href="/cart"
                aria-label={`Корзина${cartCount > 0 ? `, товаров: ${cartCount}` : ""}`}
                className={`relative shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-white/55 hover:text-white/80 transition-all duration-200 z-10 ${stampVisible ? "animate-cart-pulse" : ""}`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                  <path d="M3 6h18" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-0.5 flex items-center justify-center rounded-full bg-gold text-graphite text-[9px] font-bold tabular-nums leading-none">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Menu"
                className="shrink-0 w-8 h-8 flex flex-col items-center justify-center gap-[3.5px] text-white/55 hover:text-white/80 rounded-full transition-colors duration-200"
              >
                <span className={`block w-[14px] h-[1.2px] bg-current transition-all duration-300 origin-center ${menuOpen ? "rotate-45 translate-y-[4.7px]" : ""}`} />
                <span className={`block w-[14px] h-[1.2px] bg-current transition-all duration-300 ${menuOpen ? "opacity-0 scale-x-0" : ""}`} />
                <span className={`block w-[14px] h-[1.2px] bg-current transition-all duration-300 origin-center ${menuOpen ? "-rotate-45 -translate-y-[4.7px]" : ""}`} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Fullscreen mobile menu */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-300 ${
          menuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-[#060709]/97 backdrop-blur-sm"
          onClick={() => setMenuOpen(false)}
        />

        <div className="relative z-10 flex flex-col items-center justify-center h-full gap-10">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`text-[18px] font-medium uppercase tracking-[0.3em] transition-colors duration-200 ${
                isActive(link.href) ? "text-white/90" : "text-white/35 hover:text-white/60"
              }`}
            >
              {link.label}
              {link.href === "/cart" && cartCount > 0 && (
                <span className="ml-2 text-[13px] text-white/25 tabular-nums">[{cartCount}]</span>
              )}
            </Link>
          ))}

          {time && (
            <span className="mt-6 text-[10px] font-mono tracking-[0.32em] text-white/15 tabular-nums" suppressHydrationWarning>
              MSC {time}
            </span>
          )}
        </div>
      </div>
    </>
  );
};
