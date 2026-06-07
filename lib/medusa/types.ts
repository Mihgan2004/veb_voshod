import type { HttpTypes } from "@medusajs/types";

export type MedusaStoreProduct = HttpTypes.StoreProduct;
export type MedusaStoreCart = HttpTypes.StoreCart;
export type MedusaStoreCollection = HttpTypes.StoreCollection;
export type MedusaStoreLineItem = HttpTypes.StoreCartLineItem;

export const MEDUSA_CART_ID_KEY = "medusa_cart_id";

export const PRODUCT_LIST_FIELDS =
  "id,handle,title,description,thumbnail,metadata,*images,*variants,*variants.calculated_price,*variants.options,*variants.options.option,*collection,*categories,+variants.inventory_quantity";

export const CART_FIELDS =
  "id,*items,*items.product,*items.variant,*items.variant.options,*items.variant.options.option";

export type MedusaCheckoutCustomer = {
  name: string;
  email: string;
  phone?: string;
  comment?: string;
};

/** Delivery metadata stored on Medusa cart/order for future CDEK integration. */
export type MedusaDeliveryMetadata = {
  delivery_type: string;
  delivery_provider: string;
  delivery_address: string;
  delivery_cost: number;
  cdek_city_code?: number;
  cdek_pvz_code?: string;
  cdek_pvz_address?: string;
  customer_comment?: string;
};

export type MedusaCheckoutDelivery = {
  type: string;
  provider: string;
  address: string;
  cdekPvzCode?: string;
  cdekCityCode?: number;
  cost: number;
};

export type MedusaCheckoutPayload = {
  cartId: string;
  customer: MedusaCheckoutCustomer;
  delivery: MedusaCheckoutDelivery;
};

export type MedusaCheckoutResult = {
  orderId: string;
  displayId: number;
};
