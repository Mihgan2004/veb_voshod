import { NextResponse } from "next/server";
import { createOrderFromCart, type OrderPayload } from "@/lib/orders/directus-orders";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<OrderPayload>;

    const customer = body?.customer;
    const cart = body?.cart;

    if (!customer?.name || !customer?.email || !Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json({ error: "INVALID_PAYLOAD" }, { status: 400 });
    }

    const order = await createOrderFromCart({ customer, cart });

    return NextResponse.json({ ok: true, orderId: order.id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("[orders] POST /api/orders failed:", e);
    return NextResponse.json({ error: "ORDER_FAILED", message }, { status: 500 });
  }
}

