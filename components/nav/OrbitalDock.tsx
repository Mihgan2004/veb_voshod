"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useCart } from "@/lib/cart/cart-store";

export const OrbitalDock: React.FC = () => {
  const pathname = usePathname();
  const cartCount = useCart((s) => s.cart.reduce((sum, i) => sum + i.qty, 0));

  const [time, setTime] = useState("");
  const [scrolled, setScrolled] = useState(false);

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

  const isActive = (href: string) => pathname === href;

  return (
    <nav
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-40 transition-all duration-500 ease-out ${
        scrolled ? "scale-90 opacity-80" : "scale-100 opacity-100"
      }`}
    >
      <div className="relative group rounded-full">
        <div className="relative overflow-hidden rounded-full bg-graphite/60 backdrop-blur-md border border-white/10 px-6 py-3 flex items-center gap-8 shadow-lg shadow-black/20">
          <Link
            href="/"
            className="font-bold tracking-widest text-sm text-gray-200 hover:text-gold transition-colors"
          >
            VOSKHOD
          </Link>

          <div className="hidden md:flex items-center gap-6 text-xs font-medium text-gray-400 z-10">
            <Link
              href="/catalog"
              className={`hover:text-white transition-colors ${isActive("/catalog") ? "text-white" : ""}`}
            >
              КАТАЛОГ
            </Link>
            <Link
              href="/collections"
              className={`hover:text-white transition-colors ${isActive("/collections") ? "text-white" : ""}`}
            >
              КОЛЛЕКЦИИ
            </Link>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-gray-400 z-10">
            {time ? (
              <span className="hidden sm:inline-block border-r border-white/10 pr-4" suppressHydrationWarning>
                MSC {time}
              </span>
            ) : null}
            <Link href="/cart" className="hover:text-gold transition-colors flex items-center gap-1">
              CART <span className="text-white">[{cartCount}]</span>
            </Link>
          </div>
        </div>
        <div className="absolute inset-0 rounded-full border border-white/5 pointer-events-none mix-blend-overlay" />
      </div>
    </nav>
  );
};
