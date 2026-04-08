import { createDirectusClient } from "@/lib/directus/client";
import type { CartLine } from "@/lib/cart/cart-store";
import type { CdekDeliveryType } from "@/lib/cdek/types";

/**
 * Payload coming from the public `/api/orders` endpoint.
 * Это формат данных, который отправляет клиент.
 */
export type OrderPayload = {
  customer: {
    name: string;
    email: string;
    phone?: string;
    comment?: string;
  };
  cart: CartLine[];
};

/**
 * Extended payload for checkout with delivery and payment.
 */
export type CheckoutOrderPayload = {
  customer: {
    name: string;
    email: string;
    phone?: string;
    comment?: string;
  };
  cart: CartLine[];
  delivery: {
    type: CdekDeliveryType;
    address: string;
    cdekPvzCode?: string;
    cost: number;
    /** yandex | ozon | cdek — для СДЭК-отправления после оплаты */
    provider?: string;
    /** Код города получателя (СДЭК), нужен для курьера и для to_location */
    cdekCityCode?: number;
  };
};

export type CreatedOrder = {
  id: string | number;
};

export type OrderStatus =
  | "new"
  | "pending_payment"
  | "paid"
  | "payment_failed"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "succeeded" | "canceled";

/**
 * Поля заказа в Directus (добавьте недостающие колонки в админке — см. комментарии в коде создания).
 */
export type DirectusOrderRow = {
  id: string | number;
  status: string;
  payment_status?: string | null;
  payment_id?: string | null;
  paid_at?: string | null;
  stock_decremented_at?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  total?: number | null;
  delivery_type?: string | null;
  delivery_address?: string | null;
  cdek_pvz_code?: string | null;
  delivery_cost?: number | null;
  delivery_provider?: string | null;
  cdek_city_code?: number | null;
  cdek_order_uuid?: string | null;
  cdek_number?: string | null;
  track_number?: string | null;
  cdek_status?: string | null;
  cdek_waybill_url?: string | null;
  cdek_barcode_url?: string | null;
  shipment_created_at?: string | null;
  shipment_error?: string | null;
};

/** Явный список не используем — читаем запись целиком, чтобы не ломать GET при отсутствии новых колонок в Directus. */

type DirectusCreateResponse<T> = {
  data: T;
};

/**
 * Создание одной записи в Directus.
 * REST API ожидает поля на верхнем уровне: { "field": "value" }, НЕ { "data": { ... } }.
 */
async function directusCreateItem<TInput extends object, TOut>(
  client: ReturnType<typeof createDirectusClient>,
  collection: string,
  data: TInput,
): Promise<TOut> {
  const res = await client.request<DirectusCreateResponse<TOut>>(`/items/${collection}`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data;
}

/**
 * Создаёт заказ и связанные позиции заказа в Directus (orders + order_items).
 *
 * 1) Создаём заказ в коллекции `orders`
 * 2) Создаём связанные строки в `order_items` с полем `order` = id заказа
 */
export async function createOrderFromCart(payload: OrderPayload): Promise<CreatedOrder> {
  const url = process.env.DIRECTUS_URL;
  const token = process.env.DIRECTUS_TOKEN;

  if (!url) {
    console.warn("[orders] DIRECTUS_URL is not set, returning fake order id");
    return { id: `dev-${Date.now()}` };
  }

  if (!token) {
    throw new Error(
      "[orders] DIRECTUS_TOKEN is not set. Set DIRECTUS_TOKEN in environment for order creation.",
    );
  }

  const client = createDirectusClient({ url, token });

  const items = payload.cart.map((line) => ({
    product: line.product.id,
    productSlug: line.product.slug,
    productName: line.product.name,
    size: line.size,
    qty: line.qty,
    price: line.product.price,
  }));

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  const ordersCollection = process.env.DIRECTUS_ORDERS_NAME ?? "orders";
  const orderItemsCollection = process.env.DIRECTUS_ORDER_ITEMS_NAME ?? "order_items";

  // 1) создаём заказ
  const createdOrder = await directusCreateItem<
    {
      name: string;
      email: string;
      phone?: string;
      comment?: string;
      total: number;
      status: string;
    },
    CreatedOrder
  >(client, ordersCollection, {
    name: payload.customer.name,
    email: payload.customer.email,
    phone: payload.customer.phone,
    comment: payload.customer.comment,
    total,
    status: "new",
  });

  const orderId = createdOrder.id;

  // 2) создаём позиции заказа — ключи полей строго snake_case (как в DIRECTUS_ORDERS_SCHEMA.md)
  if (items.length > 0) {
    const orderItemsPayload = items.map((item) => {
      // product — Integer/M2O; мок-id вроде "p-tee-001" невалиден, отправляем null
      const productId =
        typeof item.product === "number" || /^\d+$/.test(String(item.product))
          ? item.product
          : null;
      return {
        order: Number(orderId),
        product: productId,
        product_slug: item.productSlug ?? "",
        product_name: item.productName ?? "",
        size: item.size ?? "",
        qty: Number(item.qty) || 0,
        price: Number(item.price) || 0,
      };
    });

    for (const item of orderItemsPayload) {
      try {
        if (process.env.NODE_ENV === "development") {
          console.log("[orders] Creating order_item:", JSON.stringify(item, null, 2));
        }
        const created = await directusCreateItem(client, orderItemsCollection, item);
        if (process.env.NODE_ENV === "development") {
          console.log("[orders] Created order_item response:", JSON.stringify(created));
        }
      } catch (e) {
        console.error("[orders] Failed to create order_item:", e, "item:", item);
        throw e;
      }
    }
  }

  return { id: orderId };
}

/**
 * Создаёт заказ с информацией о доставке для checkout flow.
 */
export async function createCheckoutOrder(
  payload: CheckoutOrderPayload
): Promise<CreatedOrder> {
  const url = process.env.DIRECTUS_URL;
  const token = process.env.DIRECTUS_TOKEN;

  if (!url) {
    console.warn("[orders] DIRECTUS_URL is not set, returning fake order id");
    return { id: `dev-${Date.now()}` };
  }

  if (!token) {
    throw new Error(
      "[orders] DIRECTUS_TOKEN is not set. Set DIRECTUS_TOKEN in environment for order creation."
    );
  }

  const client = createDirectusClient({ url, token });

  const items = payload.cart.map((line) => ({
    product: line.product.id,
    productSlug: line.product.slug,
    productName: line.product.name,
    size: line.size,
    qty: line.qty,
    price: line.product.price,
  }));

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const total = subtotal + payload.delivery.cost;

  const ordersCollection = process.env.DIRECTUS_ORDERS_NAME ?? "orders";
  const orderItemsCollection = process.env.DIRECTUS_ORDER_ITEMS_NAME ?? "order_items";

  const deliveryProvider = payload.delivery.provider ?? "cdek";

  const createdOrder = await directusCreateItem<
    {
      name: string;
      email: string;
      phone?: string;
      comment?: string;
      total: number;
      status: string;
      delivery_type: string;
      delivery_address: string;
      cdek_pvz_code?: string;
      delivery_cost: number;
      payment_status: string;
      delivery_provider?: string;
      cdek_city_code?: number;
    },
    CreatedOrder
  >(client, ordersCollection, {
    name: payload.customer.name,
    email: payload.customer.email,
    phone: payload.customer.phone,
    comment: payload.customer.comment,
    total,
    status: "pending_payment",
    delivery_type: payload.delivery.type,
    delivery_address: payload.delivery.address,
    cdek_pvz_code: payload.delivery.cdekPvzCode,
    delivery_cost: payload.delivery.cost,
    payment_status: "pending",
    delivery_provider: deliveryProvider,
    ...(payload.delivery.cdekCityCode != null
      ? { cdek_city_code: payload.delivery.cdekCityCode }
      : {}),
  });

  const orderId = createdOrder.id;

  if (items.length > 0) {
    const orderItemsPayload = items.map((item) => {
      const productId =
        typeof item.product === "number" || /^\d+$/.test(String(item.product))
          ? item.product
          : null;
      return {
        order: Number(orderId),
        product: productId,
        product_slug: item.productSlug ?? "",
        product_name: item.productName ?? "",
        size: item.size ?? "",
        qty: Number(item.qty) || 0,
        price: Number(item.price) || 0,
      };
    });

    for (const item of orderItemsPayload) {
      try {
        await directusCreateItem(client, orderItemsCollection, item);
      } catch (e) {
        console.error("[orders] Failed to create order_item:", e, "item:", item);
        throw e;
      }
    }
  }

  return { id: orderId };
}

/**
 * Обновляет payment_id в заказе после создания платежа.
 */
export async function updateOrderPaymentId(
  orderId: string | number,
  paymentId: string
): Promise<void> {
  const url = process.env.DIRECTUS_URL;
  const token = process.env.DIRECTUS_TOKEN;

  if (!url || !token) {
    console.warn("[orders] DIRECTUS_URL or DIRECTUS_TOKEN not set");
    return;
  }

  const client = createDirectusClient({ url, token });
  const ordersCollection = process.env.DIRECTUS_ORDERS_NAME ?? "orders";

  await client.request(`/items/${ordersCollection}/${orderId}`, {
    method: "PATCH",
    body: JSON.stringify({ payment_id: paymentId }),
  });
}

/**
 * Обновляет статус заказа и payment_status.
 * @deprecated Предпочтительнее markOrderPaid / markOrderCanceled из финализации оплаты.
 */
export async function updateOrderStatus(
  orderId: string | number,
  status: OrderStatus,
  paymentStatus?: PaymentStatus
): Promise<void> {
  await patchOrderFields(orderId, {
    status,
    ...(paymentStatus ? { payment_status: paymentStatus } : {}),
  });
}

export async function patchOrderFields(
  orderId: string | number,
  fields: Partial<Record<string, string | number | boolean | null>>
): Promise<void> {
  const url = process.env.DIRECTUS_URL;
  const token = process.env.DIRECTUS_TOKEN;

  if (!url || !token) {
    console.warn("[orders] DIRECTUS_URL or DIRECTUS_TOKEN not set");
    return;
  }

  const client = createDirectusClient({ url, token });
  const ordersCollection = process.env.DIRECTUS_ORDERS_NAME ?? "orders";

  await client.request(`/items/${ordersCollection}/${orderId}`, {
    method: "PATCH",
    body: JSON.stringify(fields),
  });
}

export async function getOrderById(
  orderId: string | number
): Promise<DirectusOrderRow | null> {
  const url = process.env.DIRECTUS_URL;
  const token = process.env.DIRECTUS_TOKEN;

  if (!url || !token) return null;

  const client = createDirectusClient({ url, token });
  const ordersCollection = process.env.DIRECTUS_ORDERS_NAME ?? "orders";

  type Res = { data: DirectusOrderRow };
  try {
    const res = await client.request<Res>(
      `/items/${ordersCollection}/${encodeURIComponent(String(orderId))}`
    );
    return res.data ?? null;
  } catch {
    return null;
  }
}

/**
 * Получить заказ по payment_id (для webhook).
 */
export async function getOrderByPaymentId(
  paymentId: string
): Promise<DirectusOrderRow | null> {
  const url = process.env.DIRECTUS_URL;
  const token = process.env.DIRECTUS_TOKEN;

  if (!url || !token) {
    console.warn("[orders] DIRECTUS_URL or DIRECTUS_TOKEN not set");
    return null;
  }

  const client = createDirectusClient({ url, token });
  const ordersCollection = process.env.DIRECTUS_ORDERS_NAME ?? "orders";

  type OrdersResponse = {
    data: DirectusOrderRow[];
  };

  const res = await client.request<OrdersResponse>(
    `/items/${ordersCollection}?filter[payment_id][_eq]=${encodeURIComponent(paymentId)}&limit=1`
  );

  if (res.data && res.data.length > 0) {
    return res.data[0];
  }

  return null;
}

export async function markOrderPaid(
  orderId: string | number,
  opts: { paymentId?: string; paidAt?: string }
): Promise<void> {
  const paidAt = opts.paidAt ?? new Date().toISOString();
  await patchOrderFields(orderId, {
    status: "paid",
    payment_status: "succeeded",
    paid_at: paidAt,
    ...(opts.paymentId ? { payment_id: opts.paymentId } : {}),
  });
}

export async function markOrderCanceled(orderId: string | number): Promise<void> {
  await patchOrderFields(orderId, {
    status: "payment_failed",
    payment_status: "canceled",
  });
}

export async function markStockDecremented(orderId: string | number): Promise<void> {
  await patchOrderFields(orderId, {
    stock_decremented_at: new Date().toISOString(),
  });
}

export async function markCdekShipmentCreated(
  orderId: string | number,
  data: {
    cdekOrderUuid: string;
    cdekNumber?: string | null;
    trackNumber?: string | null;
    cdekStatus?: string | null;
    waybillUrl?: string | null;
    barcodeUrl?: string | null;
  }
): Promise<void> {
  await patchOrderFields(orderId, {
    cdek_order_uuid: data.cdekOrderUuid,
    ...(data.cdekNumber != null ? { cdek_number: data.cdekNumber } : {}),
    ...(data.trackNumber != null ? { track_number: data.trackNumber } : {}),
    ...(data.cdekStatus != null ? { cdek_status: data.cdekStatus } : {}),
    ...(data.waybillUrl != null ? { cdek_waybill_url: data.waybillUrl } : {}),
    ...(data.barcodeUrl != null ? { cdek_barcode_url: data.barcodeUrl } : {}),
    shipment_created_at: new Date().toISOString(),
    shipment_error: null,
  });
}

export async function markCdekShipmentError(
  orderId: string | number,
  message: string
): Promise<void> {
  await patchOrderFields(orderId, {
    shipment_error: message.slice(0, 4000),
  });
}

/**
 * Данные заказа для сборки отправления СДЭК (после оплаты).
 */
export async function getOrderFullForShipment(
  orderId: string | number
): Promise<DirectusOrderRow | null> {
  return getOrderById(orderId);
}

/**
 * Получить статус заказа и payment_status по orderId (для success page).
 */
export async function getOrderStatus(
  orderId: string | number
): Promise<{
  status: OrderStatus;
  payment_status: PaymentStatus | null;
  payment_id?: string;
  paid_at?: string | null;
} | null> {
  const row = await getOrderById(orderId);
  if (!row) return null;
  return {
    status: (row.status || "new") as OrderStatus,
    payment_status: (row.payment_status as PaymentStatus) || null,
    payment_id: row.payment_id || undefined,
    paid_at: row.paid_at ?? null,
  };
}

export type OrderItemRow = {
  product: string | number | null;
  size: string;
  qty: number;
  product_name?: string | null;
  price?: number | null;
};

/**
 * Получить позиции заказа (product id, size, qty) для списания остатков.
 */
export async function getOrderItems(
  orderId: string | number
): Promise<OrderItemRow[]> {
  const url = process.env.DIRECTUS_URL;
  const token = process.env.DIRECTUS_TOKEN;

  if (!url || !token) return [];

  const client = createDirectusClient({ url, token });
  const orderItemsCollection = process.env.DIRECTUS_ORDER_ITEMS_NAME ?? "order_items";

  type Res = { data: OrderItemRow[] };
  const res = await client.request<Res>(
    `/items/${orderItemsCollection}?filter[order][_eq]=${encodeURIComponent(String(orderId))}&fields=product,size,qty,product_name,price`
  );
  return res.data ?? [];
}

/**
 * Получить реальные цены товаров из Directus по списку ID.
 * Возвращает Map<productId, price>.
 */
export async function getProductPricesById(
  productIds: (string | number)[]
): Promise<Map<string, number>> {
  const url = process.env.DIRECTUS_URL;
  const token = process.env.DIRECTUS_TOKEN;
  const prices = new Map<string, number>();

  if (!url || !token || productIds.length === 0) return prices;

  const client = createDirectusClient({ url, token });
  const productsCollection = process.env.DIRECTUS_PRODUCTS_NAME ?? "products";

  const uniqueIds = [...new Set(productIds.map(String))];
  const idsFilter = uniqueIds.join(",");

  type PriceRow = { id: string | number; price: number };
  type PriceRes = { data: PriceRow[] };

  const res = await client.request<PriceRes>(
    `/items/${productsCollection}?filter[id][_in]=${encodeURIComponent(idsFilter)}&fields=id,price&limit=${uniqueIds.length}`
  );

  for (const row of res.data ?? []) {
    prices.set(String(row.id), Number(row.price) || 0);
  }

  return prices;
}

const PRODUCTS_SIZES = process.env.DIRECTUS_PRODUCTS_SIZES_NAME ?? "products_sizes";

/**
 * Списывает остатки в products_sizes по позициям заказа.
 * Вызывать после успешной оплаты (например в webhook payment.succeeded).
 */
export async function decrementStockForOrder(
  orderId: string | number
): Promise<void> {
  const url = process.env.DIRECTUS_URL;
  const token = process.env.DIRECTUS_TOKEN;

  if (!url || !token) {
    console.warn("[orders] DIRECTUS_URL or DIRECTUS_TOKEN not set, skip stock decrement");
    return;
  }

  const existing = await getOrderById(orderId);
  if (existing?.stock_decremented_at) {
    console.log(
      `[orders/finalize] Stock already decremented for order ${orderId} at ${existing.stock_decremented_at}, skip`
    );
    return;
  }

  const client = createDirectusClient({ url, token });
  const items = await getOrderItems(orderId);

  for (const row of items) {
    const productId = row.product;
    const size = row.size?.trim();
    const qty = Math.max(0, Number(row.qty) || 0);
    if (productId == null || !size || qty === 0) continue;

    try {
      type StockRow = { id: string | number; quantity: number };
      type StockRes = { data: StockRow[] };
      const listRes = await client.request<StockRes>(
        `/items/${PRODUCTS_SIZES}?filter[product_id][_eq]=${encodeURIComponent(String(productId))}&filter[size][_eq]=${encodeURIComponent(size)}&fields=id,quantity&limit=1`
      );
      const stockRow = listRes.data?.[0];
      if (!stockRow) {
        console.warn(`[orders] No products_sizes row for product ${productId} size ${size}, skip decrement`);
        continue;
      }
      const newQty = Math.max(0, Number(stockRow.quantity) - qty);
      await client.request(`/items/${PRODUCTS_SIZES}/${stockRow.id}`, {
        method: "PATCH",
        body: JSON.stringify({ quantity: newQty }),
      });
      if (process.env.NODE_ENV === "development") {
        console.log(`[orders] Stock decremented: product ${productId} size ${size} by ${qty}, new quantity ${newQty}`);
      }
    } catch (e) {
      console.error(`[orders] Failed to decrement stock for product ${productId} size ${size}:`, e);
    }
  }

  await markStockDecremented(orderId);
}

