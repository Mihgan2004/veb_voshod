import type { LegacyOrderRow } from "@/lib/orders/types";

/**
 * TODO: Future CDEK integration via Medusa fulfillment provider.
 * - Trigger only after YooKassa payment.succeeded webhook (Medusa payment provider).
 * - Read delivery metadata from Medusa order (cdek_city_code, cdek_pvz_code, etc.).
 * - All CDEK API calls must stay server-side (CDEK_CLIENT_SECRET never on frontend).
 */
export async function createCdekShipmentForPaidOrder(
  order: LegacyOrderRow,
): Promise<void> {
  console.warn(
    `[cdek/create-order] Legacy Directus CDEK shipment skipped for order ${order.id}.`,
  );
}
