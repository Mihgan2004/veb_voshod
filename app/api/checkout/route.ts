import { NextResponse } from "next/server";
import {
  createCheckoutOrder,
  updateOrderPaymentId,
  getProductPricesById,
  type CheckoutOrderPayload,
} from "@/lib/orders/directus-orders";
import { createPayment } from "@/lib/yookassa";
import type { CartLine } from "@/lib/cart/cart-store";
import type { CdekDeliveryType } from "@/lib/cdek/types";

const MAX_PRICE_DRIFT_RUB = 1;

type CheckoutRequestBody = {
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

function validateCheckoutBody(body: unknown): body is CheckoutRequestBody {
  if (!body || typeof body !== "object") return false;

  const b = body as Record<string, unknown>;

  if (!b.customer || typeof b.customer !== "object") return false;
  const customer = b.customer as Record<string, unknown>;
  if (typeof customer.name !== "string" || customer.name.trim().length < 2) return false;
  if (typeof customer.email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) return false;

  if (!Array.isArray(b.cart) || b.cart.length === 0) return false;

  if (!b.delivery || typeof b.delivery !== "object") return false;
  const delivery = b.delivery as Record<string, unknown>;
  if (!["pvz", "postamat", "courier"].includes(delivery.type as string)) return false;
  if (typeof delivery.address !== "string" || delivery.address.trim().length === 0) return false;
  if (typeof delivery.cost !== "number" || delivery.cost < 0) return false;

  return true;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!validateCheckoutBody(body)) {
      return NextResponse.json(
        { error: "INVALID_PAYLOAD", message: "Invalid checkout data" },
        { status: 400 }
      );
    }

    const { customer, cart, delivery } = body;

    // --- Server-side price verification ---
    // Never trust client-sent prices — fetch the real ones from Directus
    const productIds = cart.map((item) => item.product.id);
    const realPrices = await getProductPricesById(productIds);

    const verifiedCart: CartLine[] = cart.map((item) => {
      const serverPrice = realPrices.get(String(item.product.id));
      if (serverPrice !== undefined) {
        const drift = Math.abs(serverPrice - item.product.price);
        if (drift > MAX_PRICE_DRIFT_RUB) {
          console.warn(
            `[checkout] Price mismatch for product ${item.product.id}: client=${item.product.price}, server=${serverPrice}`
          );
        }
        return {
          ...item,
          product: { ...item.product, price: serverPrice },
        };
      }
      return item;
    });

    const subtotal = verifiedCart.reduce(
      (sum, item) => sum + item.product.price * item.qty,
      0
    );
    const total = subtotal + delivery.cost;

    if (total <= 0) {
      return NextResponse.json(
        { error: "INVALID_TOTAL", message: "Order total must be positive" },
        { status: 400 }
      );
    }

    const orderPayload: CheckoutOrderPayload = {
      customer,
      cart: verifiedCart,
      delivery: {
        type: delivery.type,
        address: delivery.address,
        cdekPvzCode: delivery.cdekPvzCode,
        cost: delivery.cost,
      },
    };

    const order = await createCheckoutOrder(orderPayload);
    const orderId = order.id;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const returnUrl = `${siteUrl}/checkout/success?orderId=${orderId}`;

    const itemsDescription = verifiedCart
      .map((item) => `${item.product.name} (${item.size}) x${item.qty}`)
      .join(", ");
    const description = `Заказ №${orderId}: ${itemsDescription}`.slice(0, 128);

    const payment = await createPayment(total, description, returnUrl, {
      orderId: String(orderId),
    });

    await updateOrderPaymentId(orderId, payment.id);

    const confirmationUrl = payment.confirmation?.confirmation_url;

    if (!confirmationUrl) {
      console.error("[checkout] No confirmation URL in payment response:", payment);
      return NextResponse.json(
        { error: "PAYMENT_ERROR", message: "No confirmation URL received" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      orderId,
      confirmationUrl,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("[checkout] POST /api/checkout failed:", e);
    return NextResponse.json(
      { error: "CHECKOUT_FAILED", message },
      { status: 500 }
    );
  }
}
