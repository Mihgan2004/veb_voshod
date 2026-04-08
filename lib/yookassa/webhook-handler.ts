import { NextResponse } from "next/server";
import {
  verifyWebhookIp,
  getPayment,
  isPaymentSucceeded,
  isPaymentCanceled,
} from "@/lib/yookassa/client";
import type { YooHttpNotification, YooPayment } from "@/lib/yookassa/types";
import { getOrderById, getOrderByPaymentId } from "@/lib/orders/directus-orders";
import {
  finalizeOrderAfterPaymentCanceled,
  finalizeOrderAfterPaymentSucceeded,
} from "@/lib/orders/order-finalize";

export function getWebhookClientIp(headersList: Headers): string {
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

function parseNotification(body: unknown): { event: string; object: YooPayment } | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const event = typeof b.event === "string" ? b.event : null;
  const obj = b.object;
  if (!event || !obj || typeof obj !== "object") return null;
  return { event, object: obj as YooPayment };
}

/**
 * Обработчик HTTP POST уведомлений ЮKassa. Возвращает 200 только после консистентной обработки.
 */
export async function handleYooKassaPost(req: Request): Promise<Response> {
  const headersList = req.headers;
  const clientIp = getWebhookClientIp(headersList);

  const ipOk = verifyWebhookIp(clientIp);
  if (!ipOk && process.env.NODE_ENV === "production") {
    console.warn(`[yookassa/webhook] Rejected — invalid IP: "${clientIp}"`);
    return NextResponse.json(
      { error: "FORBIDDEN", message: "Invalid source IP" },
      { status: 403 }
    );
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  if (raw && typeof raw === "object" && "type" in raw) {
    const t = (raw as YooHttpNotification).type;
    if (t !== "notification") {
      console.warn(`[yookassa/webhook] Unexpected type: ${String(t)}`);
    }
  }

  const parsed = parseNotification(raw);
  if (!parsed) {
    return NextResponse.json({ error: "INVALID_PAYLOAD" }, { status: 400 });
  }

  const { event, object: webhookPayment } = parsed;
  const paymentId = webhookPayment.id;

  const metaOrderId = webhookPayment.metadata?.orderId;
  console.log(
    `[yookassa/webhook] event=${event} payment.id=${paymentId} metadata.orderId=${metaOrderId ?? "—"} ip=${clientIp || "—"}`
  );

  let realPayment: YooPayment;
  try {
    realPayment = await getPayment(paymentId);
  } catch (e) {
    console.error(`[yookassa/webhook] getPayment failed for ${paymentId}:`, e);
    return NextResponse.json({ error: "YOOKASSA_UNAVAILABLE" }, { status: 502 });
  }

  if (realPayment.status !== webhookPayment.status) {
    console.warn(
      `[yookassa/webhook] Status mismatch: webhook=${webhookPayment.status}, API=${realPayment.status} (using API)`
    );
  }

  const order = await resolveOrder(realPayment, paymentId);
  if (!order) {
    console.warn(`[yookassa/webhook] Order not found for paymentId=${paymentId} metadata.orderId=${metaOrderId ?? "—"}`);
    return NextResponse.json({ ok: true, message: "order_not_found" });
  }

  const oid = order.id;

  try {
    if (event === "payment.succeeded") {
      if (!isPaymentSucceeded(realPayment)) {
        console.log(
          `[yookassa/webhook] event=succeeded but API status=${realPayment.status}, paid=${realPayment.paid} — no-op`
        );
        return NextResponse.json({ ok: true, skipped: true });
      }
      console.log(`[yookassa/webhook] Finalize success for order ${oid}`);
      await finalizeOrderAfterPaymentSucceeded(oid, paymentId, "webhook");
      return NextResponse.json({ ok: true });
    }

    if (event === "payment.canceled") {
      if (!isPaymentCanceled(realPayment)) {
        console.log(`[yookassa/webhook] event=canceled but API status=${realPayment.status} — no-op`);
        return NextResponse.json({ ok: true, skipped: true });
      }
      await finalizeOrderAfterPaymentCanceled(oid, "webhook");
      return NextResponse.json({ ok: true });
    }

    if (event === "payment.waiting_for_capture") {
      console.log(
        `[yookassa/webhook] payment.waiting_for_capture payment.id=${paymentId} — acknowledge, no status change`
      );
      return NextResponse.json({ ok: true, acknowledged: true });
    }

    if (event === "refund.succeeded") {
      console.log(`[yookassa/webhook] refund.succeeded payment.id=${paymentId} — acknowledged`);
      return NextResponse.json({ ok: true, acknowledged: true });
    }

    console.log(`[yookassa/webhook] Unhandled event ${event} — 200 acknowledge`);
    return NextResponse.json({ ok: true, acknowledged: true });
  } catch (e) {
    console.error(`[yookassa/webhook] Handler error for order ${oid}:`, e);
    return NextResponse.json(
      { error: "PROCESSING_FAILED" },
      { status: 500 }
    );
  }
}

async function resolveOrder(
  realPayment: YooPayment,
  paymentId: string
): Promise<{ id: string | number } | null> {
  const meta = realPayment.metadata?.orderId;
  if (meta) {
    const byMeta = await getOrderById(meta);
    if (byMeta) return { id: byMeta.id };
  }
  const byPay = await getOrderByPaymentId(paymentId);
  if (byPay) return { id: byPay.id };
  return null;
}
