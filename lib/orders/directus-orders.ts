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

