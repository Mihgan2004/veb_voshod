import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { verifyWebhookIp, type YooWebhookEvent } from "@/lib/yookassa";
import {
  getOrderByPaymentId,
  updateOrderStatus,
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
      console.warn(`[webhook] Invalid IP address: ${clientIp}`);
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

    const { event, object: payment } = body;
    const paymentId = payment.id;

    console.log(`[webhook] Received event: ${event}, paymentId: ${paymentId}`);

    const order = await getOrderByPaymentId(paymentId);

    if (!order) {
      console.warn(`[webhook] Order not found for paymentId: ${paymentId}`);
      return NextResponse.json({ ok: true, message: "Order not found" });
    }

    switch (event) {
      case "payment.succeeded":
        await updateOrderStatus(order.id, "paid", "succeeded");
        console.log(`[webhook] Order ${order.id} marked as paid`);
        break;

      case "payment.canceled":
        await updateOrderStatus(order.id, "payment_failed", "canceled");
        console.log(`[webhook] Order ${order.id} marked as payment_failed`);
        break;

      case "payment.waiting_for_capture":
        console.log(`[webhook] Payment ${paymentId} waiting for capture`);
        break;

      default:
        console.log(`[webhook] Unhandled event: ${event}`);
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
