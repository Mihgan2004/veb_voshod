import { NextResponse, type NextRequest } from "next/server";

export type OrdersStatusPaymentPhase =
  | "paid"
  | "pending"
  | "failed"
  | "unknown"
  | "technical";

/** Legacy YooKassa order status poll — Medusa checkout uses /checkout/success?source=medusa */
export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get("orderId");

  if (!orderId) {
    return NextResponse.json(
      { ok: false, error: "MISSING_ORDER_ID" },
      { status: 400 },
    );
  }

  return NextResponse.json({
    ok: true,
    orderId,
    paymentPhase: "unknown" satisfies OrdersStatusPaymentPhase,
    legacy: true,
    message: "Legacy Directus order status is disabled. Use Medusa checkout success page.",
  });
}
