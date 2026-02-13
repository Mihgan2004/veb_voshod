"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useCart } from "@/lib/cart/cart-store";

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
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      clearInterval(t);
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
      {/* ---- Top bar ---- */}
      <nav
        className={`fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-out ${
          scrolled ? "opacity-95" : "opacity-100"
        }`}
      >
        <div className="relative rounded-full">
          <div className="relative overflow-hidden rounded-full bg-graphite/60 backdrop-blur-md border border-white/10 px-3 sm:px-5 py-1.5 sm:py-2 flex items-center gap-3 sm:gap-6 shadow-[0_12px_40px_rgba(0,0,0,0.4)]">
            {/* Logo — rendered at 20px, source should be 80px+ for retina */}
            <Link href="/" className="shrink-0 flex items-center">
              <Image
                src="/header/лого.png"
                alt="VOSKHOD"
                width={80}
                height={80}
                className="h-5 w-auto"
                priority
              />
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-5 text-[11px] font-medium text-gray-400 z-10">
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
            <div className="hidden sm:flex items-center gap-3 text-[11px] font-mono text-gray-400 z-10">
              {time ? (
                <span className="border-r border-white/10 pr-3" suppressHydrationWarning>
                  MSC {time}
                </span>
              ) : null}
              <Link href="/cart" className="hover:text-white transition-colors duration-200 flex items-center gap-1">
                CART <span className="text-white">[{cartCount}]</span>
              </Link>
            </div>

            {/* Burger button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
              className="md:hidden shrink-0 w-7 h-7 flex flex-col items-center justify-center gap-[4px] text-white/70 hover:text-white transition-colors duration-200"
            >
              <span className={`block w-[16px] h-[1.5px] bg-current transition-all duration-300 origin-center ${menuOpen ? "rotate-45 translate-y-[5.5px]" : ""}`} />
              <span className={`block w-[16px] h-[1.5px] bg-current transition-all duration-300 ${menuOpen ? "opacity-0 scale-x-0" : ""}`} />
              <span className={`block w-[16px] h-[1.5px] bg-current transition-all duration-300 origin-center ${menuOpen ? "-rotate-45 -translate-y-[5.5px]" : ""}`} />
            </button>
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
