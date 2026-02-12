import { createDirectusClient } from "@/lib/directus/client";
import type { CartLine } from "@/lib/cart/cart-store";

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

export type CreatedOrder = {
  id: string | number;
};

type DirectusCreateResponse<T> = {
  data: T;
};

/**
 * Создание записи в Directus c корректным форматом body `{ data: {...} }`.
 */
async function directusCreateItem<TInput extends object, TOut>(
  client: ReturnType<typeof createDirectusClient>,
  collection: string,
  data: TInput,
): Promise<TOut> {
  const res = await client.request<DirectusCreateResponse<TOut>>(`/items/${collection}`, {
    method: "POST",
    body: JSON.stringify({ data }),
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
    productId: line.product.id,
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

  // 2) создаём позиции заказа (batch create)
  if (items.length > 0) {
    const orderItemsPayload = items.map((item) => ({
      order: orderId,
      productId: item.productId,
      productSlug: item.productSlug,
      productName: item.productName,
      size: item.size,
      qty: item.qty,
      price: item.price,
    }));

    try {
      await client.request(`/items/${orderItemsCollection}`, {
        method: "POST",
        body: JSON.stringify({ data: orderItemsPayload }),
      });
    } catch (e) {
      console.error("[orders] Failed to create order_items batch, trying sequentially:", e);

      for (const item of orderItemsPayload) {
        try {
          // eslint-disable-next-line no-await-in-loop
          await directusCreateItem(client, orderItemsCollection, item);
        } catch (inner) {
          console.error("[orders] Failed to create single order_item:", inner, "item:", item);
        }
      }
    }
  }

  return { id: orderId };
}

