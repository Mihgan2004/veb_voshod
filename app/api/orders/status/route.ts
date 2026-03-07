import { NextResponse, type NextRequest } from "next/server";
import {
  getOrderStatus,
  updateOrderStatus,
  decrementStockForOrder,
} from "@/lib/orders/directus-orders";
import { getPayment, isPaymentSucceeded, isPaymentCanceled } from "@/lib/yookassa";

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

  if (
    result.status === "pending_payment" &&
    result.payment_id &&
    result.payment_status !== "succeeded" &&
    result.payment_status !== "canceled"
  ) {
    try {
      const payment = await getPayment(result.payment_id);

      if (isPaymentSucceeded(payment)) {
        await updateOrderStatus(orderId, "paid", "succeeded");
        await decrementStockForOrder(orderId);
        console.log(`[orders/status] Direct check: order ${orderId} → paid`);
        return NextResponse.json({
          orderId,
          status: "paid",
          paymentStatus: "succeeded",
        });
      }

      if (isPaymentCanceled(payment)) {
        await updateOrderStatus(orderId, "payment_failed", "canceled");
        console.log(`[orders/status] Direct check: order ${orderId} → payment_failed`);
        return NextResponse.json({
          orderId,
          status: "payment_failed",
          paymentStatus: "canceled",
        });
      }
    } catch (e) {
      console.error(`[orders/status] Direct YooKassa check failed for order ${orderId}:`, e);
    }
  }

  return NextResponse.json({
    orderId,
    status: result.status,
    paymentStatus: result.payment_status,
  });
}
