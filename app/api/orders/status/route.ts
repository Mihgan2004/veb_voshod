import { NextResponse, type NextRequest } from "next/server";
import { getOrderStatus } from "@/lib/orders/directus-orders";
import { getPayment, isPaymentSucceeded, isPaymentCanceled } from "@/lib/yookassa";
import {
  finalizeOrderAfterPaymentCanceled,
  finalizeOrderAfterPaymentSucceeded,
} from "@/lib/orders/order-finalize";

export type OrdersStatusPaymentPhase =
  | "paid"
  | "pending"
  | "failed"
  | "unknown"
  | "technical";

export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get("orderId");

  if (!orderId) {
    return NextResponse.json(
      { ok: false, error: "MISSING_ORDER_ID" },
      { status: 400 }
    );
  }

  let result: Awaited<ReturnType<typeof getOrderStatus>>;
  try {
    result = await getOrderStatus(orderId);
  } catch (e) {
    console.error(`[orders/status] Directus error for order ${orderId}:`, e);
    return NextResponse.json({
      ok: true,
      orderId,
      paymentPhase: "technical" satisfies OrdersStatusPaymentPhase,
    });
  }

  if (!result) {
    return NextResponse.json({
      ok: true,
      orderId,
      paymentPhase: "unknown" satisfies OrdersStatusPaymentPhase,
    });
  }

  if (result.status === "paid" && result.payment_status === "succeeded") {
    return NextResponse.json({
      ok: true,
      orderId,
      paymentPhase: "paid" satisfies OrdersStatusPaymentPhase,
      paymentStatus: "succeeded",
    });
  }

  if (result.status === "payment_failed" || result.payment_status === "canceled") {
    return NextResponse.json({
      ok: true,
      orderId,
      paymentPhase: "failed" satisfies OrdersStatusPaymentPhase,
      paymentStatus: result.payment_status ?? "canceled",
    });
  }

  if (result.status === "pending_payment" && result.payment_id && result.payment_status !== "succeeded") {
    try {
      const payment = await getPayment(result.payment_id);

      if (isPaymentSucceeded(payment)) {
        console.log(`[orders/status] YooKassa reports succeeded, finalizing order ${orderId}`);
        try {
          await finalizeOrderAfterPaymentSucceeded(orderId, result.payment_id, "poll");
        } catch (e) {
          console.error(`[orders/status] finalize after poll failed for ${orderId}:`, e);
          return NextResponse.json({
            ok: true,
            orderId,
            paymentPhase: "pending" satisfies OrdersStatusPaymentPhase,
            degraded: true,
          });
        }
        return NextResponse.json({
          ok: true,
          orderId,
          paymentPhase: "paid" satisfies OrdersStatusPaymentPhase,
          paymentStatus: "succeeded",
        });
      }

      if (isPaymentCanceled(payment)) {
        try {
          await finalizeOrderAfterPaymentCanceled(orderId, "poll");
        } catch (e) {
          console.error(`[orders/status] finalize cancel after poll failed for ${orderId}:`, e);
          return NextResponse.json({
            ok: true,
            orderId,
            paymentPhase: "pending" satisfies OrdersStatusPaymentPhase,
            degraded: true,
          });
        }
        return NextResponse.json({
          ok: true,
          orderId,
          paymentPhase: "failed" satisfies OrdersStatusPaymentPhase,
          paymentStatus: "canceled",
        });
      }
    } catch (e) {
      console.error(`[orders/status] getPayment fallback failed for order ${orderId}:`, e);
      return NextResponse.json({
        ok: true,
        orderId,
        paymentPhase: "pending" satisfies OrdersStatusPaymentPhase,
        degraded: true,
      });
    }
  }

  return NextResponse.json({
    ok: true,
    orderId,
    paymentPhase: "pending" satisfies OrdersStatusPaymentPhase,
    paymentStatus: result.payment_status ?? "pending",
  });
}
