import type { CartLine } from "@/lib/cart/cart-store";
import {
  calculateTariff,
  getDefaultPackage,
  getFromCityCode,
} from "@/lib/cdek/client";
import { CDEK_TARIFF_CODES, type CdekTariffCode } from "@/lib/cdek/types";
import type { CheckoutRequest, VerifiedCheckoutCart } from "@/lib/integrations/types";
import {
  getProductsForCheckout,
  getStockByProductAndSize,
  type CheckoutProductRow,
} from "@/lib/orders/directus-orders";

const MAX_PRICE_DRIFT_RUB = 1;

export class CheckoutValidationError extends Error {
  constructor(
    public readonly code: string,
    message: string
  ) {
    super(message);
    this.name = "CheckoutValidationError";
  }
}

function tariffForDelivery(type: CheckoutRequest["delivery"]["type"]): CdekTariffCode {
  return type === "courier"
    ? CDEK_TARIFF_CODES.WAREHOUSE_TO_DOOR
    : CDEK_TARIFF_CODES.WAREHOUSE_TO_OFFICE;
}

function packagesFromCart(cart: CartLine[]) {
  const template = getDefaultPackage();
  const itemsWeight = cart.reduce((sum, line) => sum + line.qty * 200, 0);
  const weight = Math.max(template.weight ?? 500, itemsWeight, 100);
  return [{ ...template, weight }];
}

export async function calculateServerDeliveryCost(
  delivery: CheckoutRequest["delivery"],
  cart: CartLine[]
): Promise<number> {
  const provider = delivery.provider ?? "cdek";
  if (provider !== "cdek") {
    return 0;
  }

  const cityCode = delivery.cdekCityCode;
  if (!cityCode || cityCode <= 0) {
    throw new CheckoutValidationError(
      "DELIVERY_INVALID",
      "CDEK city code is required"
    );
  }

  try {
    const result = await calculateTariff(
      getFromCityCode(),
      cityCode,
      packagesFromCart(cart),
      tariffForDelivery(delivery.type)
    );
    const cost = Number(result.delivery_sum);
    if (!Number.isFinite(cost) || cost < 0) {
      throw new CheckoutValidationError(
        "DELIVERY_CALCULATION_FAILED",
        "Invalid delivery cost from CDEK"
      );
    }
    return Math.round(cost);
  } catch (e) {
    if (e instanceof CheckoutValidationError) throw e;
    const msg = e instanceof Error ? e.message : "CDEK calculation failed";
    console.error("[checkout] CDEK calculateTariff failed:", msg);
    throw new CheckoutValidationError("DELIVERY_CALCULATION_FAILED", msg);
  }
}

function assertSizeAllowed(
  product: CheckoutProductRow,
  size: string,
  stockQty: number
): void {
  const normalized = size.trim();
  if (product.sizes.length > 0 && !product.sizes.includes(normalized)) {
    throw new CheckoutValidationError(
      "INVALID_SIZE",
      `Size "${normalized}" is not available for product ${product.id}`
    );
  }
  if (!product.inStock && stockQty <= 0) {
    throw new CheckoutValidationError(
      "OUT_OF_STOCK",
      `Product ${product.id} is out of stock`
    );
  }
}

/**
 * Validates cart against Directus, recalculates delivery server-side, returns verified cart + totals.
 */
export async function verifyCheckoutCart(
  request: CheckoutRequest
): Promise<VerifiedCheckoutCart> {
  const { cart, delivery } = request;
  const productIds = cart.map((item) => item.product.id);
  const products = await getProductsForCheckout(productIds);

  const stockKeys = cart.map((item) => ({
    productId: String(item.product.id),
    size: item.size.trim(),
  }));
  const stockMap = await getStockByProductAndSize(stockKeys);

  const verifiedCart: CartLine[] = [];

  for (const item of cart) {
    const pid = String(item.product.id);
    const product = products.get(pid);

    if (!product) {
      throw new CheckoutValidationError(
        "PRODUCT_NOT_FOUND",
        `Product ${pid} not found`
      );
    }

    const size = item.size.trim();
    const stockKey = `${pid}::${size}`;
    const stock = stockMap.get(stockKey);
    const stockQty = stock?.quantity ?? 0;

    assertSizeAllowed(product, size, stockQty);

    if (stock?.rowId != null) {
      if (stockQty < item.qty) {
        throw new CheckoutValidationError(
          "INSUFFICIENT_STOCK",
          `Not enough stock for ${product.name} (${size}): available ${stockQty}, requested ${item.qty}`
        );
      }
    } else if (!product.inStock) {
      throw new CheckoutValidationError(
        "OUT_OF_STOCK",
        `Product ${product.name} (${size}) is not available`
      );
    }

    const serverPrice = product.price;
    const drift = Math.abs(serverPrice - item.product.price);
    if (drift > MAX_PRICE_DRIFT_RUB) {
      console.warn(
        `[checkout] Price drift product ${pid}: client=${item.product.price} server=${serverPrice}`
      );
    }

    verifiedCart.push({
      ...item,
      size,
      product: {
        ...item.product,
        slug: product.slug,
        name: product.name,
        price: serverPrice,
      },
    });
  }

  const subtotal = verifiedCart.reduce(
    (sum, line) => sum + line.product.price * line.qty,
    0
  );

  const clientDeliveryCost = delivery.cost;
  const deliveryCost = await calculateServerDeliveryCost(delivery, verifiedCart);

  if (Math.abs(clientDeliveryCost - deliveryCost) > MAX_PRICE_DRIFT_RUB) {
    console.warn(
      `[checkout] Delivery cost drift: client=${clientDeliveryCost} server=${deliveryCost}`
    );
  }

  const total = subtotal + deliveryCost;
  if (total <= 0) {
    throw new CheckoutValidationError("INVALID_TOTAL", "Order total must be positive");
  }

  return {
    cart: verifiedCart,
    subtotal,
    deliveryCost,
    total,
    clientDeliveryCost,
  };
}
