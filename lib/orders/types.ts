export type OrderStatus =
  | "new"
  | "pending_payment"
  | "paid"
  | "canceled"
  | "shipped"
  | "completed";

export type PaymentStatus = "pending" | "succeeded" | "canceled";

/** Legacy order shape kept for YooKassa/CDEK modules until Medusa migration completes. */
export type LegacyOrderRow = {
  id: string | number;
  status?: OrderStatus;
  payment_status?: PaymentStatus | null;
  payment_id?: string | null;
  delivery_type?: string | null;
  delivery_provider?: string | null;
  delivery_address?: string | null;
  cdek_pvz_code?: string | null;
  cdek_city_code?: number | null;
  cdek_shipment_uuid?: string | null;
  stock_decremented_at?: string | null;
  customer_name?: string | null;
  customer_email?: string | null;
  customer_phone?: string | null;
};
