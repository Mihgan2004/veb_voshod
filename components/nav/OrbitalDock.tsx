"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useCart } from "@/lib/cart/cart-store";

export const OrbitalDock: React.FC = () => {
  const pathname = usePathname();

  // ✅ селектор возвращает число, а не объект → нет infinite loop
  const cartCount = useCart((s) => s.cart.reduce((sum, i) => sum + i.qty, 0));

  const [mscTime, setMscTime] = useState(() => new Date());
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setMscTime(new Date()), 1000);
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
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        scrolled ? "scale-95 opacity-90" : "scale-100 opacity-100"
      }`}
    >
      <div className="relative rounded-full">
        <div className="relative overflow-hidden rounded-full bg-[#141821]/70 backdrop-blur-md border border-white/10 px-6 py-3 flex items-center gap-8">
          <Link href="/" className="font-semibold tracking-widest text-sm text-gray-200 hover:text-[#C6902E] transition-colors">
            VOSKHOD
          </Link>

          <div className="hidden md:flex items-center gap-6 text-xs font-medium text-gray-400">
            <Link href="/catalog" className={`hover:text-white transition-colors ${isActive("/catalog") ? "text-white" : ""}`}>
              КАТАЛОГ
            </Link>
            <Link href="/collections" className={`hover:text-white transition-colors ${isActive("/collections") ? "text-white" : ""}`}>
              КОЛЛЕКЦИИ
            </Link>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-gray-400">
            <span className="hidden sm:inline-block border-r border-white/10 pr-4">
              MSC{" "}
              {mscTime.toLocaleTimeString("ru-RU", {
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "Europe/Moscow",
              })}
            </span>
            <Link href="/cart" className="hover:text-[#C6902E] transition-colors">
              CART <span className="text-white">[{cartCount}]</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
