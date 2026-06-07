import { NextResponse } from "next/server";
import {
  addMedusaLineItem,
  removeMedusaLineItem,
  updateMedusaLineItem,
} from "@/lib/medusa/cart";

type LineItemBody = {
  cartId?: string;
  lineId?: string;
  variantId?: string;
  quantity?: number;
};

function parseBody(body: unknown): LineItemBody | null {
  if (!body || typeof body !== "object") return null;
  const v = body as LineItemBody;
  if (typeof v.cartId !== "string" || !v.cartId) return null;
  return v;
}

export async function POST(req: Request) {
  try {
    const body = parseBody(await req.json());
    if (!body?.variantId || typeof body.quantity !== "number" || body.quantity <= 0) {
      return NextResponse.json(
        { error: "INVALID_PAYLOAD", message: "cartId, variantId and quantity are required" },
        { status: 400 },
      );
    }

    const lines = await addMedusaLineItem(
      body.cartId!,
      body.variantId!,
      body.quantity!,
    );
    return NextResponse.json({ ok: true, cartId: body.cartId, lines });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to add line item";
    return NextResponse.json({ error: "CART_ERROR", message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = parseBody(await req.json());
    if (!body?.lineId || typeof body.quantity !== "number" || body.quantity <= 0) {
      return NextResponse.json(
        { error: "INVALID_PAYLOAD", message: "cartId, lineId and quantity are required" },
        { status: 400 },
      );
    }

    const lines = await updateMedusaLineItem(
      body.cartId!,
      body.lineId!,
      body.quantity!,
    );
    return NextResponse.json({ ok: true, cartId: body.cartId, lines });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update line item";
    return NextResponse.json({ error: "CART_ERROR", message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = parseBody(await req.json());
    if (!body?.lineId) {
      return NextResponse.json(
        { error: "INVALID_PAYLOAD", message: "cartId and lineId are required" },
        { status: 400 },
      );
    }

    const lines = await removeMedusaLineItem(body.cartId!, body.lineId!);
    return NextResponse.json({ ok: true, cartId: body.cartId, lines });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to remove line item";
    return NextResponse.json({ error: "CART_ERROR", message }, { status: 500 });
  }
}
