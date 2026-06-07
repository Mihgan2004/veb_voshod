import { NextResponse } from "next/server";
import {
  createMedusaCart,
  getMedusaCartLines,
  retrieveMedusaCart,
} from "@/lib/medusa/cart";

export async function GET(req: Request) {
  try {
    const cartId = new URL(req.url).searchParams.get("cartId");
    if (!cartId) {
      return NextResponse.json(
        { error: "MISSING_CART_ID", message: "cartId is required" },
        { status: 400 },
      );
    }

    const lines = await getMedusaCartLines(cartId);
    return NextResponse.json({ ok: true, cartId, lines });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to retrieve cart";
    return NextResponse.json({ error: "CART_ERROR", message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const cart = await createMedusaCart();
    const lines = await getMedusaCartLines(cart.id);
    return NextResponse.json({ ok: true, cartId: cart.id, lines });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create cart";
    return NextResponse.json({ error: "CART_ERROR", message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const cartId = new URL(req.url).searchParams.get("cartId");
    if (!cartId) {
      return NextResponse.json(
        { error: "MISSING_CART_ID", message: "cartId is required" },
        { status: 400 },
      );
    }

    await retrieveMedusaCart(cartId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to access cart";
    return NextResponse.json({ error: "CART_ERROR", message }, { status: 500 });
  }
}
