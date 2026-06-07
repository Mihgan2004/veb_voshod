import { getMedusa, getRegionId } from "./client";
import { mapMedusaCartToLines } from "./mappers";
import { CART_FIELDS } from "./types";
import type { CartLine } from "@/lib/cart/cart-store";
import type { HttpTypes } from "@medusajs/types";

export async function createMedusaCart(): Promise<HttpTypes.StoreCart> {
  const sdk = getMedusa();
  const { cart } = await sdk.store.cart.create({
    region_id: getRegionId(),
  });
  return cart;
}

export async function retrieveMedusaCart(
  cartId: string,
): Promise<HttpTypes.StoreCart> {
  const sdk = getMedusa();
  const { cart } = await sdk.store.cart.retrieve(cartId, {
    fields: CART_FIELDS,
  });
  return cart;
}

export async function addMedusaLineItem(
  cartId: string,
  variantId: string,
  quantity: number,
): Promise<CartLine[]> {
  const sdk = getMedusa();
  const { cart } = await sdk.store.cart.createLineItem(
    cartId,
    { variant_id: variantId, quantity },
    { fields: CART_FIELDS },
  );
  return mapMedusaCartToLines(cart);
}

export async function updateMedusaLineItem(
  cartId: string,
  lineId: string,
  quantity: number,
): Promise<CartLine[]> {
  const sdk = getMedusa();
  const { cart } = await sdk.store.cart.updateLineItem(
    cartId,
    lineId,
    { quantity },
    { fields: CART_FIELDS },
  );
  return mapMedusaCartToLines(cart);
}

export async function removeMedusaLineItem(
  cartId: string,
  lineId: string,
): Promise<CartLine[]> {
  const sdk = getMedusa();
  const { parent: cart } = await sdk.store.cart.deleteLineItem(cartId, lineId, {
    fields: CART_FIELDS,
  });
  if (cart) {
    return mapMedusaCartToLines(cart);
  }
  return getMedusaCartLines(cartId);
}

export async function getMedusaCartLines(cartId: string): Promise<CartLine[]> {
  const cart = await retrieveMedusaCart(cartId);
  return mapMedusaCartToLines(cart);
}
