"use client";

import { create } from "zustand";
import type { Product } from "@/lib/catalog";
import { findVariantId } from "@/lib/medusa/mappers";
import {
  addLineItem,
  clearStoredCartId,
  ensureCartId,
  fetchCartLines,
  getStoredCartId,
  removeLineItem,
  updateLineItem,
} from "./medusa-cart-client";

export type CartLine = {
  cartId: string;
  lineItemId: string;
  product: Product;
  size: string;
  qty: number;
  variantId: string;
};

type CartStore = {
  cart: CartLine[];
  cartId: string | null;
  loading: boolean;
  error: string | null;
  stampVisible: boolean;
  hydrate: () => Promise<void>;
  addToCart: (product: Product, size: string, qty?: number) => Promise<void>;
  updateQuantity: (lineItemId: string, qty: number) => Promise<void>;
  removeFromCart: (lineItemId: string) => Promise<void>;
  clear: () => Promise<void>;
  total: () => number;
};

export const useCart = create<CartStore>((set, get) => ({
  cart: [],
  cartId: null,
  loading: false,
  error: null,
  stampVisible: false,

  hydrate: async () => {
    const storedCartId = getStoredCartId();
    if (!storedCartId) {
      set({ cart: [], cartId: null, loading: false });
      return;
    }

    set({ loading: true, error: null });
    try {
      const lines = await fetchCartLines(storedCartId);
      set({ cart: lines, cartId: storedCartId, loading: false });
    } catch (error) {
      clearStoredCartId();
      set({
        cart: [],
        cartId: null,
        loading: false,
        error: error instanceof Error ? error.message : "Failed to load cart",
      });
    }
  },

  addToCart: async (product, size, qty = 1) => {
    const variantId = findVariantId(product, size);
    if (!variantId) {
      set({ error: "Variant not found for selected size" });
      return;
    }

    set({ loading: true, error: null, stampVisible: true });
    setTimeout(() => set({ stampVisible: false }), 2200);

    try {
      const cartId = await ensureCartId();
      const lines = await addLineItem(cartId, variantId, qty);
      set({ cart: lines, cartId, loading: false });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : "Failed to add to cart",
      });
    }
  },

  updateQuantity: async (lineItemId, qty) => {
    const { cartId } = get();
    if (!cartId || qty <= 0) return;

    set({ loading: true, error: null });
    try {
      const lines = await updateLineItem(cartId, lineItemId, qty);
      set({ cart: lines, loading: false });
    } catch (error) {
      set({
        loading: false,
        error:
          error instanceof Error ? error.message : "Failed to update quantity",
      });
    }
  },

  removeFromCart: async (lineItemId) => {
    const { cartId } = get();
    if (!cartId) return;

    set({ loading: true, error: null });
    try {
      const lines = await removeLineItem(cartId, lineItemId);
      set({ cart: lines, loading: false });
    } catch (error) {
      set({
        loading: false,
        error:
          error instanceof Error ? error.message : "Failed to remove from cart",
      });
    }
  },

  clear: async () => {
    clearStoredCartId();
    set({ cart: [], cartId: null, error: null });
  },

  total: () =>
    get().cart.reduce((sum, item) => {
      const price =
        typeof item.product.price === "number" ? item.product.price : 0;
      return sum + price * item.qty;
    }, 0),
}));
