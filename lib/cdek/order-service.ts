import {
  getOrderById,
  getOrderItems,
  markCdekShipmentCreated,
  markCdekShipmentError,
  tryAcquireCdekShipmentCreationLock,
  releaseCdekShipmentCreationLock,
  CDEK_SHIPMENT_LOCK_PLACEHOLDER,
  type DirectusOrderRow,
} from "@/lib/orders/directus-orders";
import { createOrder, getFromCityCode, getDefaultPackage } from "@/lib/cdek/client";
import { CDEK_TARIFF_CODES } from "@/lib/cdek/types";

function normalizeRuPhone(raw: string | null | undefined): string {
  const d = raw?.replace(/\D/g, "") ?? "";
  if (d.length === 11 && d.startsWith("8")) return `+7${d.slice(1)}`;
  if (d.length === 10) return `+7${d}`;
  if (d.length === 11 && d.startsWith("7")) return `+${d}`;
  if (d.length >= 11) return `+${d.slice(-11)}`;
  return "+70000000000";
}

async function buildCdekOrderPayload(
  order: DirectusOrderRow
): Promise<Record<string, unknown> | null> {
  const deliveryType = order.delivery_type;
  if (deliveryType !== "pvz" && deliveryType !== "postamat" && deliveryType !== "courier") {
    console.warn(`[cdek/create-order] Unsupported delivery_type=${deliveryType} for order ${order.id}`);
    return null;
  }

  const fromCode = getFromCityCode();
  const senderName = process.env.CDEK_SENDER_NAME?.trim() || "Voshod Shop";

  const items = await getOrderItems(order.id);
  if (items.length === 0) {
    console.warn(`[cdek/create-order] No order_items for order ${order.id}`);
    return null;
  }

  const pkgTemplate = getDefaultPackage();
  const itemsWeight = items.reduce(
    (sum, line) => sum + (Number(line.qty) || 0) * 200,
    0
  );
  const totalWeight = Math.max(pkgTemplate.weight ?? 500, itemsWeight, 100);

  const packageItems = items.map((line, idx) => {
    const qty = Math.max(1, Number(line.qty) || 1);
    const unitPrice = Math.round(Number(line.price) || 0);
    return {
      name: (line.product_name || `Товар ${idx + 1}`).slice(0, 255),
      ware_key: `${String(line.product ?? "x")}-${line.size}`.slice(0, 50),
      payment: { value: 0 },
      cost: unitPrice,
      amount: qty,
      weight: Math.max(100, qty * 200),
    };
  });

  const tariff =
    deliveryType === "courier"
      ? CDEK_TARIFF_CODES.WAREHOUSE_TO_DOOR
      : CDEK_TARIFF_CODES.WAREHOUSE_TO_OFFICE;

  const payload: Record<string, unknown> = {
    type: 1,
    number: `voshod-${order.id}`,
    tariff_code: tariff,
    comment: `Site order #${order.id}`,
    from_location: { code: fromCode },
    sender: { name: senderName },
    recipient: {
      name: (order.name || "Получатель").slice(0, 100),
      email: order.email || undefined,
      phones: [{ number: normalizeRuPhone(order.phone) }],
    },
    packages: [
      {
        number: 1,
        weight: totalWeight,
        length: pkgTemplate.length,
        width: pkgTemplate.width,
        height: pkgTemplate.height,
        items: packageItems,
      },
    ],
  };

  if (deliveryType === "courier") {
    const code = order.cdek_city_code;
    if (!code || !order.delivery_address?.trim()) {
      console.warn(
        `[cdek/create-order] Courier order ${order.id} missing cdek_city_code or delivery_address`
      );
      return null;
    }
    payload.to_location = {
      code,
      address: order.delivery_address.trim(),
    };
  } else {
    const pvz = order.cdek_pvz_code?.trim();
    if (!pvz) {
      console.warn(`[cdek/create-order] PVZ order ${order.id} missing cdek_pvz_code`);
      return null;
    }
    payload.delivery_point = pvz;
  }

  const shipmentPoint = process.env.CDEK_SHIPMENT_POINT?.trim();
  if (shipmentPoint) {
    payload.shipment_point = shipmentPoint;
  }

  return payload;
}

/**
 * Создаёт отправление в СДЭК после успешной оплаты (вызывается только из финализации оплаты).
 */
export async function createCdekShipmentForPaidOrder(order: DirectusOrderRow): Promise<void> {
  const orderId = order.id;

  const latest = (await getOrderById(orderId)) ?? order;

  if ((latest.delivery_provider ?? "cdek") !== "cdek") {
    return;
  }

  if (latest.shipment_created_at) {
    return;
  }

  if (latest.cdek_order_uuid && latest.cdek_order_uuid !== CDEK_SHIPMENT_LOCK_PLACEHOLDER) {
    return;
  }

  if (latest.cdek_order_uuid === CDEK_SHIPMENT_LOCK_PLACEHOLDER) {
    console.log(
      `[cdek/create-order] Order ${orderId} has creation lock placeholder — another worker may be creating shipment, skip`
    );
    return;
  }

  const acquired = await tryAcquireCdekShipmentCreationLock(orderId);
  if (!acquired) {
    const again = await getOrderById(orderId);
    if (again?.cdek_order_uuid && again.cdek_order_uuid !== CDEK_SHIPMENT_LOCK_PLACEHOLDER) {
      return;
    }
    if (again?.shipment_created_at) {
      return;
    }
    console.log(
      `[cdek/create-order] Could not acquire CDEK creation lock for order ${orderId} — likely concurrent finalize, skip`
    );
    return;
  }

  const working = (await getOrderById(orderId)) ?? latest;

  try {
    const payload = await buildCdekOrderPayload(working);
    if (!payload) {
      console.warn(
        `[cdek/create-order] Skip order ${orderId} — insufficient data (ПВЗ/город/позиции) для СДЭК`
      );
      await releaseCdekShipmentCreationLock(orderId);
      return;
    }

    console.log(`[cdek/create-order] Creating CDEK order for site order ${orderId}`);
    const res = await createOrder(payload);

    const entity = res.entity;
    if (!entity?.uuid) {
      throw new Error("Ответ СДЭК без entity.uuid");
    }
    const uuid = entity.uuid;

    await markCdekShipmentCreated(orderId, {
      cdekOrderUuid: uuid,
      cdekNumber: entity.cdek_number ?? null,
      trackNumber: entity.tracking_number ?? null,
      cdekStatus: entity.status ?? null,
      waybillUrl: null,
      barcodeUrl: null,
    });

    console.log(
      `[cdek/create-order] CDEK order created: uuid=${uuid} cdek_number=${entity.cdek_number ?? "?"}`
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`[cdek/create-order] Failed for site order ${orderId}:`, e);
    try {
      await releaseCdekShipmentCreationLock(orderId);
    } catch (releaseErr) {
      console.error(`[cdek/create-order] Failed to release lock for ${orderId}:`, releaseErr);
    }
    await markCdekShipmentError(orderId, msg);
  }
}
