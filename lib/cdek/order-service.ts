import type { LegacyOrderRow } from "@/lib/orders/types";

/**
 * Legacy CDEK shipment creation stub.
 * Will be rewired to Medusa orders in a later integration phase.
 */
export async function createCdekShipmentForPaidOrder(
  order: LegacyOrderRow,
): Promise<void> {
  console.warn(
    `[cdek/create-order] Legacy Directus CDEK shipment skipped for order ${order.id}.`,
  );
}
