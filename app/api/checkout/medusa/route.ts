import { NextResponse } from "next/server";
import { completeMedusaCheckout } from "@/lib/medusa/checkout";
import type { MedusaCheckoutPayload } from "@/lib/medusa/types";

function parseBody(body: unknown): MedusaCheckoutPayload | null {
  if (!body || typeof body !== "object") return null;
  const v = body as MedusaCheckoutPayload;

  if (typeof v.cartId !== "string" || !v.cartId.trim()) return null;
  if (!v.customer || typeof v.customer !== "object") return null;
  if (typeof v.customer.name !== "string" || !v.customer.name.trim()) return null;
  if (typeof v.customer.email !== "string" || !v.customer.email.trim()) return null;
  if (!v.delivery || typeof v.delivery !== "object") return null;
  if (typeof v.delivery.type !== "string") return null;
  if (typeof v.delivery.provider !== "string") return null;
  if (typeof v.delivery.address !== "string" || !v.delivery.address.trim()) return null;
  if (typeof v.delivery.cost !== "number") return null;

  return {
    cartId: v.cartId.trim(),
    customer: {
      name: v.customer.name.trim(),
      email: v.customer.email.trim(),
      phone:
        typeof v.customer.phone === "string" ? v.customer.phone.trim() : undefined,
      comment:
        typeof v.customer.comment === "string" ? v.customer.comment.trim() : undefined,
    },
    delivery: {
      type: v.delivery.type,
      provider: v.delivery.provider,
      address: v.delivery.address.trim(),
      cdekPvzCode:
        typeof v.delivery.cdekPvzCode === "string"
          ? v.delivery.cdekPvzCode
          : undefined,
      cdekCityCode:
        typeof v.delivery.cdekCityCode === "number"
          ? v.delivery.cdekCityCode
          : undefined,
      cost: v.delivery.cost,
    },
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const payload = parseBody(body);

    if (!payload) {
      return NextResponse.json(
        { error: "INVALID_PAYLOAD", message: "Invalid checkout data" },
        { status: 400 },
      );
    }

    const result = await completeMedusaCheckout(payload);

    return NextResponse.json({
      ok: true,
      orderId: result.orderId,
      displayId: result.displayId,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Checkout failed";
    console.error("[checkout/medusa]", message);
    return NextResponse.json(
      { error: "CHECKOUT_ERROR", message },
      { status: 500 },
    );
  }
}
