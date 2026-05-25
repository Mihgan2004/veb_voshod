import type {
  YooPayment,
  YooCreatePaymentRequest,
  YooAmount,
  CreatePaymentOptions,
} from "./types";
import { buildPaymentReceipt, isYooKassaReceiptEnabled } from "./receipt";

const YOOKASSA_API_URL = "https://api.yookassa.ru/v3";

const YOOKASSA_WEBHOOK_IPS = [
  "185.71.76.0/27",
  "185.71.77.0/27",
  "77.75.153.0/25",
  "77.75.156.11",
  "77.75.156.35",
  "77.75.154.128/25",
  "2a02:5180::/32",
];

function getCredentials() {
  const shopId = process.env.YOOKASSA_SHOP_ID;
  const secretKey = process.env.YOOKASSA_SECRET_KEY;

  if (!shopId || !secretKey) {
    throw new Error(
      "[yookassa] YOOKASSA_SHOP_ID and YOOKASSA_SECRET_KEY must be set"
    );
  }

  return { shopId, secretKey };
}

function getAuthHeader(): string {
  const { shopId, secretKey } = getCredentials();
  const credentials = Buffer.from(`${shopId}:${secretKey}`).toString("base64");
  return `Basic ${credentials}`;
}

export function paymentIdempotenceKey(orderId: string | number): string {
  return `order-${orderId}-payment-v1`;
}

export async function createPayment(
  amount: number,
  description: string,
  returnUrl: string,
  options: CreatePaymentOptions
): Promise<YooPayment> {
  const amountData: YooAmount = {
    value: amount.toFixed(2),
    currency: "RUB",
  };

  const metadata: Record<string, string> = {
    orderId: String(options.orderId),
  };

  const payload: YooCreatePaymentRequest = {
    amount: amountData,
    confirmation: {
      type: "redirect",
      return_url: returnUrl,
    },
    capture: true,
    description,
    metadata,
  };

  if (isYooKassaReceiptEnabled()) {
    if (!options.receipt) {
      throw new Error(
        "[yookassa] YOOKASSA_RECEIPT_ENABLED=true but receipt was not provided"
      );
    }
    payload.receipt = options.receipt;
  } else if (options.receipt) {
    payload.receipt = options.receipt;
  }

  const idempotenceKey =
    options.idempotenceKey ?? paymentIdempotenceKey(options.orderId);

  const response = await fetch(`${YOOKASSA_API_URL}/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: getAuthHeader(),
      "Idempotence-Key": idempotenceKey,
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `[yookassa] createPayment failed: ${response.status} ${errorText}`
    );
  }

  return (await response.json()) as YooPayment;
}

export { buildPaymentReceipt, isYooKassaReceiptEnabled };

export async function getPayment(paymentId: string): Promise<YooPayment> {
  const response = await fetch(`${YOOKASSA_API_URL}/payments/${paymentId}`, {
    method: "GET",
    headers: {
      Authorization: getAuthHeader(),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `[yookassa] getPayment failed: ${response.status} ${errorText}`
    );
  }

  return (await response.json()) as YooPayment;
}

function ipToNumber(ip: string): number {
  const parts = ip.split(".").map(Number);
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

function isIpInCidr(ip: string, cidr: string): boolean {
  if (cidr.includes("/")) {
    const [network, prefixStr] = cidr.split("/");
    const prefix = parseInt(prefixStr, 10);
    const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
    const ipNum = ipToNumber(ip);
    const networkNum = ipToNumber(network);
    return (ipNum & mask) === (networkNum & mask);
  }
  return ip === cidr;
}

/**
 * ЮKassa notification IPv6 range (см. документацию). Проверка по префиксу /32 без полноценного парсинга IPv6.
 */
function isYooKassaIpv6(ip: string): boolean {
  const s = ip.trim().toLowerCase();
  if (!s.includes(":")) return false;
  return s.startsWith("2a02:5180:");
}

export function verifyWebhookIp(ip: string): boolean {
  if (!ip) return false;

  if (ip.includes(":")) {
    return isYooKassaIpv6(ip);
  }

  return YOOKASSA_WEBHOOK_IPS.some((cidr) => {
    if (cidr.includes(":")) return false;
    return isIpInCidr(ip, cidr);
  });
}

export function isWebhookIpAllowlistEnabled(): boolean {
  const flag = process.env.YOOKASSA_WEBHOOK_IP_ALLOWLIST_ENABLED;
  if (flag === "false") return false;
  if (flag === "true") return true;
  return process.env.NODE_ENV === "production";
}

export function isPaymentSucceeded(payment: YooPayment): boolean {
  return payment.status === "succeeded" && payment.paid;
}

export function isPaymentCanceled(payment: YooPayment): boolean {
  return payment.status === "canceled";
}
