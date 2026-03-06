import { NextResponse } from "next/server";
import { headers } from "next/headers";
import {
  verifyWebhookIp,
  getPayment,
  isPaymentSucceeded,
  isPaymentCanceled,
  type YooWebhookEvent,
} from "@/lib/yookassa";
import {
  getOrderByPaymentId,
  updateOrderStatus,
  decrementStockForOrder,
} from "@/lib/orders/directus-orders";

function getClientIp(headersList: Headers): string {
  const forwarded = headersList.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIp = headersList.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  return "";
}

export async function POST(req: Request) {
  try {
    const headersList = await headers();
    const clientIp = getClientIp(headersList);

    const isValidIp = verifyWebhookIp(clientIp);

    if (!isValidIp && process.env.NODE_ENV === "production") {
      console.warn(`[webhook] Rejected — invalid IP: ${clientIp}`);
      return NextResponse.json(
        { error: "FORBIDDEN", message: "Invalid source IP" },
        { status: 403 }
      );
    }

    const body = (await req.json()) as YooWebhookEvent;

    if (!body || !body.event || !body.object) {
      return NextResponse.json(
        { error: "INVALID_PAYLOAD" },
        { status: 400 }
      );
    }

    const { event, object: webhookPayment } = body;
    const paymentId = webhookPayment.id;

    console.log(`[webhook] Received ${event}, paymentId: ${paymentId}`);

    const order = await getOrderByPaymentId(paymentId);

    if (!order) {
      console.warn(`[webhook] Order not found for paymentId: ${paymentId}`);
      return NextResponse.json({ ok: true, message: "Order not found" });
    }

    // Second-layer verification: fetch the real payment status from YooKassa API
    // to protect against forged webhook payloads (per official docs recommendation)
    const realPayment = await getPayment(paymentId);

    if (realPayment.status !== webhookPayment.status) {
      console.warn(
        `[webhook] Status mismatch: webhook=${webhookPayment.status}, API=${realPayment.status}. Using API status.`
      );
    }

    if (isPaymentSucceeded(realPayment)) {
      await updateOrderStatus(order.id, "paid", "succeeded");
      await decrementStockForOrder(order.id);
      console.log(`[webhook] Order ${order.id} → paid, stock decremented`);
    } else if (isPaymentCanceled(realPayment)) {
      await updateOrderStatus(order.id, "payment_failed", "canceled");
      console.log(`[webhook] Order ${order.id} → payment_failed`);
    } else if (realPayment.status === "waiting_for_capture") {
      console.log(`[webhook] Payment ${paymentId} waiting_for_capture (auto-capture is on, will resolve shortly)`);
    } else if (realPayment.status === "pending") {
      console.log(`[webhook] Payment ${paymentId} still pending`);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("[webhook] Error processing webhook:", e);
    return NextResponse.json(
      { error: "WEBHOOK_ERROR", message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ status: "ok", service: "yookassa-webhook" });
}
