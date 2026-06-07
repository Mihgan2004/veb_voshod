"use client";

import type { CartLine } from "./cart-store";
import { MEDUSA_CART_ID_KEY } from "@/lib/medusa/types";

type CartApiResponse = {
  ok?: boolean;
  cartId?: string;
  lines?: CartLine[];
  message?: string;
  error?: string;
};

async function parseResponse(res: Response): Promise<CartApiResponse> {
  const data = (await res.json()) as CartApiResponse;
  if (!res.ok || !data.ok) {
    throw new Error(data.message || data.error || "Cart request failed");
  }
  return data;
}

export function getStoredCartId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(MEDUSA_CART_ID_KEY);
}

export function setStoredCartId(cartId: string): void {
  localStorage.setItem(MEDUSA_CART_ID_KEY, cartId);
}

export function clearStoredCartId(): void {
  localStorage.removeItem(MEDUSA_CART_ID_KEY);
}

export async function ensureCartId(): Promise<string> {
  const existing = getStoredCartId();
  if (existing) return existing;

  const res = await fetch("/api/medusa/cart", { method: "POST" });
  const data = await parseResponse(res);
  if (!data.cartId) throw new Error("Cart ID missing in response");
  setStoredCartId(data.cartId);
  return data.cartId;
}

export async function fetchCartLines(cartId: string): Promise<CartLine[]> {
  const res = await fetch(
    `/api/medusa/cart?cartId=${encodeURIComponent(cartId)}`,
  );
  const data = await parseResponse(res);
  return data.lines ?? [];
}

export async function addLineItem(
  cartId: string,
  variantId: string,
  quantity: number,
): Promise<CartLine[]> {
  const res = await fetch("/api/medusa/cart/line-items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cartId, variantId, quantity }),
  });
  const data = await parseResponse(res);
  return data.lines ?? [];
}

export async function updateLineItem(
  cartId: string,
  lineId: string,
  quantity: number,
): Promise<CartLine[]> {
  const res = await fetch("/api/medusa/cart/line-items", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cartId, lineId, quantity }),
  });
  const data = await parseResponse(res);
  return data.lines ?? [];
}

export async function removeLineItem(
  cartId: string,
  lineId: string,
): Promise<CartLine[]> {
  const res = await fetch("/api/medusa/cart/line-items", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cartId, lineId }),
  });
  const data = await parseResponse(res);
  return data.lines ?? [];
}
