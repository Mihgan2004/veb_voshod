import { NextResponse, type NextRequest } from "next/server";
import { getOrderStatus } from "@/lib/orders/directus-orders";

export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get("orderId");

  if (!orderId) {
    return NextResponse.json(
      { error: "MISSING_ORDER_ID" },
      { status: 400 }
    );
  }

  const result = await getOrderStatus(orderId);

  if (!result) {
    return NextResponse.json(
      { error: "ORDER_NOT_FOUND" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    orderId,
    status: result.status,
    paymentStatus: result.payment_status,
  });
}
