import type { CartLine } from "@/lib/cart/cart-store";
import type { CdekDeliveryType, DeliveryProvider } from "@/lib/cdek/types";
import type { DirectusOrderRow, OrderStatus, PaymentStatus } from "@/lib/orders/directus-orders";
import type { YooPayment } from "@/lib/yookassa/types";

export type { DirectusOrderRow, OrderStatus, PaymentStatus, YooPayment };

export type DirectusProduct = {
  id: string | number;
  slug: string;
  name: string;
  price: number;
  sizes: string[];
  inStock: boolean;
};

export type DirectusOrderItem = {
  id?: string | number;
  order: string | number;
  product: string | number | null;
  product_slug: string;
  product_name: string;
  size: string;
  qty: number;
  price: number;
};

export type DeliveryRequest = {
  type: CdekDeliveryType;
  address: string;
  cdekPvzCode?: string;
  cost: number;
  provider?: DeliveryProvider;
  cdekCityCode?: number;
};

export type CheckoutRequest = {
  customer: {
    name: string;
    email: string;
    phone?: string;
    comment?: string;
  };
  cart: CartLine[];
  delivery: DeliveryRequest;
};

export type CdekCalculationResult = {
  delivery_sum: number;
  total_sum: number;
  period_min: number;
  period_max: number;
  currency: string;
};

export type VerifiedCheckoutCart = {
  cart: CartLine[];
  subtotal: number;
  deliveryCost: number;
  total: number;
  clientDeliveryCost: number;
};
