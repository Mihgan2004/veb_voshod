import { getMedusa, getRegionId } from "./client";
import type {
  MedusaCheckoutPayload,
  MedusaCheckoutResult,
  MedusaDeliveryMetadata,
} from "./types";
import { CART_FIELDS } from "./types";
import type { HttpTypes } from "@medusajs/types";

function splitName(fullName: string): { first_name: string; last_name: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return { first_name: "Customer", last_name: "" };
  }
  if (parts.length === 1) {
    return { first_name: parts[0], last_name: "" };
  }
  return {
    first_name: parts[0],
    last_name: parts.slice(1).join(" "),
  };
}

function getManualPaymentProviderId(): string {
  return (
    process.env.MEDUSA_MANUAL_PAYMENT_PROVIDER?.trim() || "pp_system_default"
  );
}

export async function completeMedusaCheckout(
  payload: MedusaCheckoutPayload,
): Promise<MedusaCheckoutResult> {
  const sdk = getMedusa();
  const { cartId, customer, delivery } = payload;
  const { first_name, last_name } = splitName(customer.name);

  const deliveryMetadata: MedusaDeliveryMetadata = {
    delivery_type: delivery.type,
    delivery_provider: delivery.provider,
    delivery_address: delivery.address,
    delivery_cost: delivery.cost,
    cdek_pvz_code: delivery.cdekPvzCode,
    cdek_pvz_address: delivery.address,
    cdek_city_code: delivery.cdekCityCode,
    customer_comment: customer.comment,
  };

  let { cart } = await sdk.store.cart.update(
    cartId,
    {
      email: customer.email,
      metadata: deliveryMetadata,
      shipping_address: {
        first_name,
        last_name,
        address_1: delivery.address,
        phone: customer.phone,
        country_code: "ru",
      },
    },
    { fields: CART_FIELDS },
  );

  const { shipping_options } = await sdk.store.fulfillment.listCartOptions({
    cart_id: cartId,
  });

  if (shipping_options.length === 0) {
    throw new Error(
      "No shipping options configured in Medusa. Add a manual fulfillment option in Admin.",
    );
  }

  const shippingOption = shipping_options[0];
  ({ cart } = await sdk.store.cart.addShippingMethod(
    cartId,
    { option_id: shippingOption.id },
    { fields: CART_FIELDS },
  ));

  const { payment_providers } = await sdk.store.payment.listPaymentProviders({
    region_id: cart.region_id ?? getRegionId(),
  });

  const manualProviderId = getManualPaymentProviderId();
  const provider =
    payment_providers.find((p) => p.id === manualProviderId) ??
    payment_providers.find((p) => p.id.includes("manual")) ??
    payment_providers[0];

  if (!provider) {
    throw new Error(
      "No payment providers available in Medusa region. Configure manual payment in Admin.",
    );
  }

  await sdk.store.payment.initiatePaymentSession(cart, {
    provider_id: provider.id,
  });

  const result = await sdk.store.cart.complete(cartId);

  if (result.type === "cart") {
    const message =
      typeof result.error === "object" && result.error && "message" in result.error
        ? String((result.error as { message?: string }).message)
        : "Failed to complete cart";
    throw new Error(message);
  }

  const order = result.order as HttpTypes.StoreOrder;
  return {
    orderId: order.id,
    displayId: order.display_id ?? 0,
  };
}
