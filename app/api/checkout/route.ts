import { NextResponse } from "next/server";
import {
  createCheckoutOrder,
  updateOrderPaymentId,
  getOrderById,
  type CheckoutOrderPayload,
} from "@/lib/orders/directus-orders";
import {
  createPayment,
  getPayment,
  buildPaymentReceipt,
  isYooKassaReceiptEnabled,
  paymentIdempotenceKey,
} from "@/lib/yookassa";
import { CheckoutValidationError, verifyCheckoutCart } from "@/lib/checkout/server-checkout";
import { parseCheckoutBody } from "@/lib/checkout/validate";

function checkoutReturnUrl(orderId: string | number): string {
  const override = process.env.YOOKASSA_RETURN_URL?.trim();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const base = override || siteUrl;
  return `${base.replace(/\/+$/, "")}/checkout/success?orderId=${orderId}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parsed = parseCheckoutBody(body);
    if (!parsed) {
      return NextResponse.json(
        { error: "INVALID_PAYLOAD", message: "Invalid checkout data" },
        { status: 400 }
      );
    }

    const verified = await verifyCheckoutCart(parsed);

    const orderPayload: CheckoutOrderPayload = {
      customer: parsed.customer,
      cart: verified.cart,
      delivery: {
        type: parsed.delivery.type,
        address: parsed.delivery.address,
        cdekPvzCode: parsed.delivery.cdekPvzCode,
        cost: verified.deliveryCost,
        provider: parsed.delivery.provider,
        cdekCityCode: parsed.delivery.cdekCityCode,
      },
    };

    const order = await createCheckoutOrder(orderPayload);
    const orderId = order.id;

    console.log(
      `[checkout] Order created id=${orderId} subtotal=${verified.subtotal} delivery=${verified.deliveryCost} total=${verified.total}`
    );

    const existing = await getOrderById(orderId);
    if (existing?.payment_id) {
      try {
        const existingPayment = await getPayment(existing.payment_id);
        const url = existingPayment.confirmation?.confirmation_url;
        if (url && existingPayment.status === "pending") {
          console.log(
            `[checkout] Reusing pending payment ${existing.payment_id} for order ${orderId}`
          );
          return NextResponse.json({
            ok: true,
            orderId,
            confirmationUrl: url,
          });
        }
      } catch (e) {
        console.warn(
          `[checkout] Could not reuse payment ${existing.payment_id} for order ${orderId}:`,
          e
        );
      }
    }

    const returnUrl = checkoutReturnUrl(orderId);

    const itemsDescription = verified.cart
      .map((item) => `${item.product.name} (${item.size}) x${item.qty}`)
      .join(", ");
    const description = `Заказ №${orderId}: ${itemsDescription}`.slice(0, 128);

    const receipt = isYooKassaReceiptEnabled()
      ? buildPaymentReceipt({
          email: parsed.customer.email,
          phone: parsed.customer.phone,
          cart: verified.cart,
          deliveryCost: verified.deliveryCost,
        })
      : undefined;

    const payment = await createPayment(verified.total, description, returnUrl, {
      orderId,
      idempotenceKey: paymentIdempotenceKey(orderId),
      receipt,
    });

    await updateOrderPaymentId(orderId, payment.id);

    console.log(`[checkout] Payment created id=${payment.id} for order ${orderId}`);

    const confirmationUrl = payment.confirmation?.confirmation_url;

    if (!confirmationUrl) {
      console.error("[checkout] No confirmation URL in payment response");
      return NextResponse.json(
        { error: "PAYMENT_ERROR", message: "No confirmation URL received" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      orderId,
      confirmationUrl,
    });
  } catch (e) {
    if (e instanceof CheckoutValidationError) {
      const status =
        e.code === "DELIVERY_CALCULATION_FAILED" ? 503 : 400;
      return NextResponse.json(
        { error: e.code, message: e.message },
        { status }
      );
    }

    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("[checkout] POST /api/checkout failed:", e);
    return NextResponse.json(
      { error: "CHECKOUT_FAILED", message },
      { status: 500 }
    );
  }
}
