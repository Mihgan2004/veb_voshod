import type { CartLine } from "@/lib/cart/cart-store";
import type { CdekDeliveryType, DeliveryProvider } from "@/lib/cdek/types";
import type { LegacyOrderRow, OrderStatus, PaymentStatus } from "@/lib/orders/types";
import type { YooPayment } from "@/lib/yookassa/types";

export type { LegacyOrderRow as DirectusOrderRow, OrderStatus, PaymentStatus, YooPayment };

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
