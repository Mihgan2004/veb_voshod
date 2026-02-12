"use client";

import { create } from "zustand";
import type { Product } from "@/lib/catalog";

// Убедитесь, что тип Product содержит `price: number`
type CartItem = Product & { qty: number };

type CartStore = {
  cart: CartItem[];
  add: (product: Product, qty?: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  total: () => number;
};

export const useCart = create<CartStore>((set, get) => ({
  cart: [], // ✅ инициализирован как пустой массив

  add: (product, qty = 1) =>
    set((state) => {
      const existingIndex = state.cart.findIndex((item) => item.id === product.id);
      if (existingIndex >= 0) {
        const updatedCart = [...state.cart];
        updatedCart[existingIndex] = {
          ...updatedCart[existingIndex],
          qty: updatedCart[existingIndex].qty + qty,
        };
        return { cart: updatedCart };
      }
      return {
        cart: [...state.cart, { ...product, qty }],
      };
    }),

  remove: (id) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.id !== id),
    })),

  clear: () => set({ cart: [] }),

  total: () =>
    get().cart.reduce((acc, item) => {
      // Защита на случай, если price не определён
      const price = typeof item.price === "number" ? item.price : 0;
      return acc + price * item.qty;
    }, 0),
}));