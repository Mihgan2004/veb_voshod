"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/cart/cart-store";

export function CartHydrator() {
  const hydrate = useCart((s) => s.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return null;
}
