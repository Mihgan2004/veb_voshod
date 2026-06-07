import { NextResponse } from "next/server";
import {
  verifyWebhookIp,
  getPayment,
  isPaymentSucceeded,
  isPaymentCanceled,
  isWebhookIpAllowlistEnabled,
} from "@/lib/yookassa/client";
import type { YooHttpNotification, YooPayment } from "@/lib/yookassa/types";
import {
  finalizeOrderAfterPaymentCanceled,
  finalizeOrderAfterPaymentSucceeded,
} from "@/lib/orders/order-finalize";

/**
 * Извлекает клиентский IP для сверки с allowlist ЮKassa.
 */
export function getWebhookClientIp(headersList: Headers): string {
  const forwarded = headersList.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim() ?? "";
    if (/^[\d.:a-fA-F]+$/.test(first)) {
      return first;
    }
    return "";
  }

  const realIp = headersList.get("x-real-ip");
  if (realIp) {
    const t = realIp.trim();
    if (/^[\d.:a-fA-F]+$/.test(t)) {
      return t;
    }
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
 * TODO: Future YooKassa integration as Medusa payment provider.
 * - Do not create payments from frontend; use Medusa payment sessions.
 * - On payment.succeeded webhook → finalize Medusa order → trigger CDEK shipment.
 * - YOOKASSA_SECRET_KEY must remain server-only.
 *
 * Currently acknowledges legacy webhook events without Directus order finalization.
 */
export async function handleYooKassaPost(req: Request): Promise<Response> {
  const headersList = req.headers;
  const clientIp = getWebhookClientIp(headersList);

  const allowlistOn = isWebhookIpAllowlistEnabled();
  const trustProxy = process.env.TRUST_PROXY === "true";

  if (allowlistOn && !trustProxy) {
    console.warn(
      "[yookassa/webhook] YOOKASSA_WEBHOOK_IP_ALLOWLIST_ENABLED but TRUST_PROXY is not true — skipping IP verification",
    );
  } else if (allowlistOn) {
    const ipOk = verifyWebhookIp(clientIp);
    if (!ipOk) {
      console.warn(`[yookassa/webhook] Rejected — invalid IP: "${clientIp || "—"}"`);
      return NextResponse.json(
        { error: "FORBIDDEN", message: "Invalid source IP" },
        { status: 403 },
      );
    }
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
    `[yookassa/webhook] event=${event} payment.id=${paymentId} metadata.orderId=${metaOrderId ?? "—"} ip=${clientIp || "—"} (legacy — Medusa orders)`,
  );

  let realPayment: YooPayment;
  try {
    realPayment = await getPayment(paymentId);
  } catch (e) {
    console.error(`[yookassa/webhook] getPayment failed for ${paymentId}:`, e);
    return NextResponse.json({ error: "YOOKASSA_UNAVAILABLE" }, { status: 502 });
  }

  const orderId = metaOrderId ?? paymentId;

  try {
    if (event === "payment.succeeded") {
      if (!isPaymentSucceeded(realPayment)) {
        return NextResponse.json({ ok: true, skipped: true });
      }
      await finalizeOrderAfterPaymentSucceeded(orderId, paymentId, "webhook");
      return NextResponse.json({ ok: true, legacy: true });
    }

    if (event === "payment.canceled") {
      if (!isPaymentCanceled(realPayment)) {
        return NextResponse.json({ ok: true, skipped: true });
      }
      await finalizeOrderAfterPaymentCanceled(orderId, "webhook");
      return NextResponse.json({ ok: true, legacy: true });
    }

    return NextResponse.json({ ok: true, acknowledged: true });
  } catch (e) {
    console.error(`[yookassa/webhook] Handler error:`, e);
    return NextResponse.json({ error: "PROCESSING_FAILED" }, { status: 500 });
  }
}
