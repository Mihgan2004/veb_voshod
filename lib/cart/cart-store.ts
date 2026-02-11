'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/lib/types';

export type CartItem = {
  cartId: string;
  product: Product;
  size: string;
  qty: number;
};

type CartState = {
  cart: CartItem[];
  stampVisible: boolean;

  addToCart: (product: Product, size: string) => void;
  removeFromCart: (cartId: string) => void;
  clear: () => void;
};

const makeId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;

let stampTimer: ReturnType<typeof setTimeout> | null = null;

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],
      stampVisible: false,

      addToCart: (product, size) => {
        const { cart } = get();
        const idx = cart.findIndex(i => i.product.id === product.id && i.size === size);

        let next = cart;
        if (idx >= 0) {
          next = cart.map((i, k) => (k === idx ? { ...i, qty: i.qty + 1 } : i));
        } else {
          next = [...cart, { cartId: makeId(), product, size, qty: 1 }];
        }

        set({ cart: next, stampVisible: true });

        if (stampTimer) clearTimeout(stampTimer);
        stampTimer = setTimeout(() => set({ stampVisible: false }), 650);
      },

      removeFromCart: (cartId) => {
        set({ cart: get().cart.filter(i => i.cartId !== cartId) });
      },

      clear: () => set({ cart: [] }),
    }),
    { name: 'voshod-cart-v1' }
  )
);
