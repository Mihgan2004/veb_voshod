"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useLenisRef } from "@/components/providers/LenisContext";

export function RouteScrollTop() {
  const pathname = usePathname();
  const lenisRef = useLenisRef();

  useEffect(() => {
    const lenis = lenisRef?.current;
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, lenisRef]);

  return null;
}
