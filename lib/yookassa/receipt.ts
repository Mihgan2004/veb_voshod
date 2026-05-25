import type { CartLine } from "@/lib/cart/cart-store";
import type { YooReceipt, YooReceiptItem } from "./types";

function receiptEnvInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw == null || raw === "") return fallback;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) ? n : fallback;
}

function receiptEnvStr(name: string, fallback: string): string {
  const raw = process.env[name]?.trim();
  return raw || fallback;
}

export function isYooKassaReceiptEnabled(): boolean {
  return process.env.YOOKASSA_RECEIPT_ENABLED === "true";
}

export function buildPaymentReceipt(opts: {
  email: string;
  phone?: string;
  cart: CartLine[];
  deliveryCost: number;
  deliveryLabel?: string;
}): YooReceipt {
  const vatCode = receiptEnvInt("YOOKASSA_RECEIPT_VAT_CODE", 1);
  const paymentSubject = receiptEnvStr("YOOKASSA_RECEIPT_PAYMENT_SUBJECT", "commodity");
  const paymentMode = receiptEnvStr("YOOKASSA_RECEIPT_PAYMENT_MODE", "full_payment");

  const items: YooReceiptItem[] = opts.cart.map((line) => {
    const lineTotal = line.product.price * line.qty;
    return {
      description: `${line.product.name} (${line.size})`.slice(0, 128),
      quantity: String(line.qty),
      amount: {
        value: lineTotal.toFixed(2),
        currency: "RUB",
      },
      vat_code: vatCode,
      payment_subject: paymentSubject,
      payment_mode: paymentMode,
    };
  });

  if (opts.deliveryCost > 0) {
    items.push({
      description: (opts.deliveryLabel ?? "Доставка").slice(0, 128),
      quantity: "1",
      amount: {
        value: opts.deliveryCost.toFixed(2),
        currency: "RUB",
      },
      vat_code: vatCode,
      payment_subject: receiptEnvStr("YOOKASSA_RECEIPT_DELIVERY_SUBJECT", "service"),
      payment_mode: paymentMode,
    });
  }

  if (items.length === 0) {
    throw new Error("[yookassa] Receipt requires at least one item");
  }

  const customer: YooReceipt["customer"] = { email: opts.email };
  if (opts.phone?.trim()) {
    customer.phone = opts.phone.trim();
  }

  return { customer, items };
}
