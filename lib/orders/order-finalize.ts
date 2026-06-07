/**
 * Legacy YooKassa finalization stubs.
 * Orders are created via Medusa checkout — Directus order flow removed.
 */

export async function finalizeOrderAfterPaymentSucceeded(
  orderId: string | number,
  paymentId?: string,
  source?: string,
): Promise<void> {
  console.warn(
    `[orders/finalize] Legacy Directus finalize skipped for order ${orderId} (payment=${paymentId ?? "—"}, source=${source ?? "—"}). Use Medusa checkout.`,
  );
}

export async function finalizeOrderAfterPaymentCanceled(
  orderId: string | number,
  source?: string,
): Promise<void> {
  console.warn(
    `[orders/finalize] Legacy Directus cancel finalize skipped for order ${orderId} (source=${source ?? "—"}).`,
  );
}
