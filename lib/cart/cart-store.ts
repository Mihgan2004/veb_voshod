"use client";

import { create } from "zustand";
import type { Product } from "@/lib/catalog";

export type CartLine = {
  cartId: string;
  product: Product;
  size: string;
  qty: number;
};

type CartStore = {
  cart: CartLine[];
  addToCart: (product: Product, size: string, qty?: number) => void;
  removeFromCart: (cartId: string) => void;
  clear: () => void;
  total: () => number;
};

function createCartId(productId: string, size: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${productId}-${size}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useCart = create<CartStore>((set, get) => ({
  cart: [],

  addToCart: (product, size, qty = 1) =>
    set((state) => {
      const existingIndex = state.cart.findIndex(
        (item) => item.product.id === product.id && item.size === size,
      );

      if (existingIndex >= 0) {
        const updated = [...state.cart];
        updated[existingIndex] = {
          ...updated[existingIndex],
          qty: updated[existingIndex].qty + qty,
        };
        return { cart: updated };
      }

      const cartId = createCartId(product.id, size);

      return {
        cart: [...state.cart, { cartId, product, size, qty }],
      };
    }),

  removeFromCart: (cartId) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.cartId !== cartId),
    })),

  clear: () => set({ cart: [] }),

  total: () =>
    get().cart.reduce((sum, item) => {
      const price = typeof item.product.price === "number" ? item.product.price : 0;
      return sum + price * item.qty;
    }, 0),
}));