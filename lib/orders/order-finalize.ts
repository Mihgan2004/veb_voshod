import {
  getOrderById,
  markOrderPaid,
  markOrderCanceled,
  decrementStockForOrder,
  type DirectusOrderRow,
} from "@/lib/orders/directus-orders";
import { createCdekShipmentForPaidOrder } from "@/lib/cdek/order-service";

const finalizeChains = new Map<string, Promise<unknown>>();

function runOrderExclusive<T>(orderKey: string, fn: () => Promise<T>): Promise<T> {
  const prev = finalizeChains.get(orderKey) ?? Promise.resolve();
  const next = prev.then(fn);
  finalizeChains.set(
    orderKey,
    next.then(() => undefined).catch(() => undefined)
  );
  return next;
}

async function ensureStockDecremented(orderId: string | number): Promise<void> {
  const o = await getOrderById(orderId);
  if (!o?.stock_decremented_at) {
    console.log(`[orders/finalize] Decrementing stock for order ${orderId}`);
    await decrementStockForOrder(orderId);
  }
}

async function ensureCdekShipment(order: DirectusOrderRow): Promise<void> {
  if ((order.delivery_provider ?? "cdek") !== "cdek") {
    console.log(
      `[orders/finalize] Order ${order.id} delivery_provider=${order.delivery_provider ?? "cdek"}, skip CDEK`
    );
    return;
  }

  if (order.cdek_order_uuid || order.shipment_created_at) {
    console.log(
      `[orders/finalize] CDEK shipment already present for order ${order.id} (uuid=${order.cdek_order_uuid ?? "n/a"}), skip`
    );
    return;
  }

  await createCdekShipmentForPaidOrder(order);
}

/**
 * Единая точка финализации после подтверждённого успеха в ЮKassa (webhook или poll).
 * Идемпотентна: повторные вызовы безопасны.
 */
export async function finalizeOrderAfterPaymentSucceeded(
  orderId: string | number,
  paymentId: string,
  source: "webhook" | "poll"
): Promise<void> {
  const key = String(orderId);
  await runOrderExclusive(key, async () => {
    const order = await getOrderById(orderId);
    if (!order) {
      console.warn(`[orders/finalize] Order ${orderId} not found (${source})`);
      return;
    }

    const paid = order.status === "paid" && order.payment_status === "succeeded";

    if (paid) {
      console.log(`[orders/finalize] Order ${orderId} already paid (${source}), ensuring stock & CDEK`);
      await ensureStockDecremented(orderId);
      const fresh = await getOrderById(orderId);
      if (fresh) await ensureCdekShipment(fresh);
      return;
    }

    if (order.status === "payment_failed") {
      console.log(`[orders/finalize] Order ${orderId} already failed, skip success path (${source})`);
      return;
    }

    if (order.status !== "pending_payment") {
      console.warn(
        `[orders/finalize] Order ${orderId} unexpected status=${order.status} (${source}), skip auto-paid`
      );
      return;
    }

    console.log(`[orders/finalize] Marking order ${orderId} paid (${source})`);
    await markOrderPaid(orderId, { paymentId, paidAt: new Date().toISOString() });
    await ensureStockDecremented(orderId);
    const fresh = await getOrderById(orderId);
    if (fresh) await ensureCdekShipment(fresh);
  });
}

export async function finalizeOrderAfterPaymentCanceled(
  orderId: string | number,
  source: "webhook" | "poll"
): Promise<void> {
  const key = String(orderId);
  await runOrderExclusive(key, async () => {
    const order = await getOrderById(orderId);
    if (!order) {
      console.warn(`[orders/finalize] Order ${orderId} not found for cancel (${source})`);
      return;
    }

    if (order.status === "paid" && order.payment_status === "succeeded") {
      console.warn(
        `[orders/finalize] Cancel event for already paid order ${orderId} (${source}) — ignoring`
      );
      return;
    }

    if (order.status === "payment_failed" && order.payment_status === "canceled") {
      console.log(`[orders/finalize] Order ${orderId} already canceled (${source})`);
      return;
    }

    if (order.status !== "pending_payment") {
      console.warn(
        `[orders/finalize] Order ${orderId} cancel: unexpected status=${order.status} (${source})`
      );
      return;
    }

    console.log(`[orders/finalize] Marking order ${orderId} payment_failed (${source})`);
    await markOrderCanceled(orderId);
  });
}
