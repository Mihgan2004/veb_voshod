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
 */
export async function updateOrderStatus(
  orderId: string | number,
  status: OrderStatus,
  paymentStatus?: PaymentStatus
): Promise<void> {
  const url = process.env.DIRECTUS_URL;
  const token = process.env.DIRECTUS_TOKEN;

  if (!url || !token) {
    console.warn("[orders] DIRECTUS_URL or DIRECTUS_TOKEN not set");
    return;
  }

  const client = createDirectusClient({ url, token });
  const ordersCollection = process.env.DIRECTUS_ORDERS_NAME ?? "orders";

  const updateData: { status: string; payment_status?: string } = { status };
  if (paymentStatus) {
    updateData.payment_status = paymentStatus;
  }

  await client.request(`/items/${ordersCollection}/${orderId}`, {
    method: "PATCH",
    body: JSON.stringify(updateData),
  });
}

/**
 * Получить заказ по payment_id (для webhook).
 */
export async function getOrderByPaymentId(
  paymentId: string
): Promise<{ id: string | number } | null> {
  const url = process.env.DIRECTUS_URL;
  const token = process.env.DIRECTUS_TOKEN;

  if (!url || !token) {
    console.warn("[orders] DIRECTUS_URL or DIRECTUS_TOKEN not set");
    return null;
  }

  const client = createDirectusClient({ url, token });
  const ordersCollection = process.env.DIRECTUS_ORDERS_NAME ?? "orders";

  type OrdersResponse = {
    data: Array<{ id: string | number }>;
  };

  const res = await client.request<OrdersResponse>(
    `/items/${ordersCollection}?filter[payment_id][_eq]=${encodeURIComponent(paymentId)}&limit=1`
  );

  if (res.data && res.data.length > 0) {
    return res.data[0];
  }

  return null;
}

