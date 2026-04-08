export type YooPaymentStatus =
  | "pending"
  | "waiting_for_capture"
  | "succeeded"
  | "canceled";

export type YooConfirmationType = "redirect" | "embedded";

export type YooConfirmation = {
  type: YooConfirmationType;
  confirmation_url?: string;
  return_url?: string;
};

export type YooAmount = {
  value: string;
  currency: string;
};

export type YooPaymentMethod = {
  type: string;
  id?: string;
  saved?: boolean;
  title?: string;
};

export type YooRecipient = {
  account_id: string;
  gateway_id: string;
};

export type YooCancellationDetails = {
  party: "yoo_money" | "payment_network" | "merchant";
  reason: string;
};

export type YooPayment = {
  id: string;
  status: YooPaymentStatus;
  amount: YooAmount;
  income_amount?: YooAmount;
  description?: string;
  recipient: YooRecipient;
  payment_method?: YooPaymentMethod;
  captured_at?: string;
  created_at: string;
  expires_at?: string;
  confirmation?: YooConfirmation;
  test: boolean;
  refunded_amount?: YooAmount;
  paid: boolean;
  refundable: boolean;
  metadata?: Record<string, string>;
  cancellation_details?: YooCancellationDetails;
};

export type YooCreatePaymentRequest = {
  amount: YooAmount;
  confirmation: {
    type: YooConfirmationType;
    return_url: string;
  };
  capture?: boolean;
  description?: string;
  metadata?: Record<string, string>;
};

export type YooWebhookEventType =
  | "payment.waiting_for_capture"
  | "payment.succeeded"
  | "payment.canceled"
  | "refund.succeeded";

export type YooWebhookEvent = {
  type: YooWebhookEventType;
  event: YooWebhookEventType;
  object: YooPayment;
};

/** Тело HTTP-уведомления ЮKassa: поле `type` = notification */
export type YooHttpNotification = {
  type: "notification";
  event: YooWebhookEventType;
  object: YooPayment;
};
