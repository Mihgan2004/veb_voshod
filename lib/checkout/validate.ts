import type { CartLine } from "@/lib/cart/cart-store";
import type { CdekDeliveryType, DeliveryProvider } from "@/lib/cdek/types";
import type { CheckoutRequest } from "@/lib/integrations/types";

export type CheckoutValidationError = {
  code: string;
  message: string;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return v != null && typeof v === "object" && !Array.isArray(v);
}

function isCartLine(v: unknown): v is CartLine {
  if (!isRecord(v)) return false;
  const product = v.product;
  if (!isRecord(product)) return false;
  if (typeof product.id !== "string" && typeof product.id !== "number") return false;
  if (typeof product.slug !== "string" || !product.slug.trim()) return false;
  if (typeof product.name !== "string" || !product.name.trim()) return false;
  if (typeof product.price !== "number" || product.price < 0) return false;
  if (typeof v.size !== "string" || !v.size.trim()) return false;
  if (typeof v.qty !== "number" || !Number.isInteger(v.qty) || v.qty <= 0) return false;
  return true;
}

const CDEK_TYPES: CdekDeliveryType[] = ["pvz", "postamat", "courier"];
const PROVIDERS: DeliveryProvider[] = ["cdek", "yandex", "ozon"];

export function parseCheckoutBody(body: unknown): CheckoutRequest | null {
  if (!isRecord(body)) return null;

  const customer = body.customer;
  if (!isRecord(customer)) return null;
  if (typeof customer.name !== "string" || customer.name.trim().length < 2) return null;
  if (
    typeof customer.email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim())
  ) {
    return null;
  }
  if (customer.phone != null && typeof customer.phone !== "string") return null;
  if (customer.comment != null && typeof customer.comment !== "string") return null;

  if (!Array.isArray(body.cart) || body.cart.length === 0) return null;
  if (!body.cart.every(isCartLine)) return null;

  const delivery = body.delivery;
  if (!isRecord(delivery)) return null;
  if (!CDEK_TYPES.includes(delivery.type as CdekDeliveryType)) return null;
  if (typeof delivery.address !== "string" || !delivery.address.trim()) return null;
  if (typeof delivery.cost !== "number" || delivery.cost < 0) return null;
  if (delivery.provider != null && !PROVIDERS.includes(delivery.provider as DeliveryProvider)) {
    return null;
  }
  if (delivery.cdekCityCode != null && typeof delivery.cdekCityCode !== "number") return null;
  if (delivery.cdekPvzCode != null && typeof delivery.cdekPvzCode !== "string") return null;

  const provider = (delivery.provider as DeliveryProvider | undefined) ?? "cdek";

  if (provider === "cdek") {
    if (delivery.cdekCityCode == null || delivery.cdekCityCode <= 0) return null;
    if (delivery.type === "courier") {
      if (!delivery.address.trim()) return null;
    } else if (!delivery.cdekPvzCode?.trim()) {
      return null;
    }
  }

  return {
    customer: {
      name: customer.name.trim(),
      email: customer.email.trim(),
      phone: customer.phone?.trim() || undefined,
      comment: customer.comment?.trim() || undefined,
    },
    cart: body.cart as CartLine[],
    delivery: {
      type: delivery.type as CdekDeliveryType,
      address: delivery.address.trim(),
      cost: delivery.cost,
      provider,
      cdekCityCode:
        delivery.cdekCityCode != null ? delivery.cdekCityCode : undefined,
      cdekPvzCode: delivery.cdekPvzCode?.trim(),
    },
  };
}
