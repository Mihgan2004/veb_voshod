"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCheckout } from "@/lib/checkout/checkout-store";
import { useCart, type CartLine } from "@/lib/cart/cart-store";

type StepSummaryProps = {
  onBack: () => void;
};

const deliveryTypeLabels = {
  pvz: "Пункт выдачи СДЭК",
  postamat: "Постамат СДЭК",
  courier: "Курьерская доставка",
};

const providerLabels = {
  cdek: "СДЭК",
  yandex: "Яндекс Доставка",
  ozon: "Озон Доставка",
};

const GOLD_GRADIENT = "bg-gradient-to-r from-amber-700 via-yellow-500 to-amber-700 bg-[length:200%_100%] animate-gold-shimmer bg-clip-text text-transparent";

export function StepSummary({ onBack }: StepSummaryProps) {
  const contacts = useCheckout((s) => s.contacts);
  const deliveryProvider = useCheckout((s) => s.deliveryProvider);
  const deliveryType = useCheckout((s) => s.deliveryType);
  const deliveryCost = useCheckout((s) => s.deliveryCost);
  const deliveryDays = useCheckout((s) => s.deliveryDays);
  const getDeliveryAddress = useCheckout((s) => s.getDeliveryAddress);
  const cdekPoint = useCheckout((s) => s.cdekPoint);
  const courierAddress = useCheckout((s) => s.courierAddress);
  const agreedToTerms = useCheckout((s) => s.agreedToTerms);
  const setAgreedToTerms = useCheckout((s) => s.setAgreedToTerms);

  const cart = useCart((s) => s.cart);
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  const total = subtotal + deliveryCost;

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deliveryLabel = deliveryProvider === "cdek"
    ? deliveryTypeLabels[deliveryType]
    : providerLabels[deliveryProvider];

  const showCostRow = deliveryProvider === "cdek" && deliveryCost > 0;
  const costPending = deliveryProvider === "yandex" || deliveryProvider === "ozon";

  async function handlePayment() {
    if (submitting || !agreedToTerms) return;

    setSubmitting(true);
    setError(null);

    try {
      const cdekCityCode =
        deliveryProvider === "cdek"
          ? (cdekPoint?.cityCode ?? courierAddress?.cityCode)
          : undefined;

      const payload = {
        customer: {
          name: contacts.name.trim(),
          email: contacts.email.trim(),
          phone: contacts.phone.trim() || undefined,
          comment: contacts.comment.trim() || undefined,
        },
        cart,
        delivery: {
          type: deliveryType,
          provider: deliveryProvider,
          address: getDeliveryAddress(),
          cdekPvzCode: cdekPoint?.code,
          cdekCityCode,
          cost: deliveryCost,
        },
      };

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.message || "Ошибка при создании заказа");
      }

      if (data.confirmationUrl) {
        window.location.href = data.confirmationUrl;
      } else {
        throw new Error("Не получена ссылка для оплаты");
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Произошла ошибка";
      setError(message);
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-mono tracking-[0.28em] uppercase text-white/45 mb-4">
          Проверьте данные заказа
        </p>
      </div>

      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-3">
        <p className="text-[11px] font-mono tracking-[0.2em] uppercase text-white/45">
          Контакты
        </p>
        <div className="space-y-1">
          <p className="text-[14px] text-white">{contacts.name}</p>
          <p className="text-[13px] text-white/60">{contacts.email}</p>
          {contacts.phone && (
            <p className="text-[13px] text-white/60">{contacts.phone}</p>
          )}
          {contacts.comment && (
            <p className="text-[13px] text-white/50 italic mt-2">
              {contacts.comment}
            </p>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-3">
        <p className="text-[11px] font-mono tracking-[0.2em] uppercase text-white/45">
          Доставка
        </p>
        <div className="space-y-1">
          <p className="text-[14px] text-white">{deliveryLabel}</p>
          <p className="text-[13px] text-white/60">{getDeliveryAddress()}</p>
          {cdekPoint && (
            <p className="text-[12px] text-white/40">{cdekPoint.workTime}</p>
          )}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/[0.06]">
            {showCostRow ? (
              <>
                <span className="text-[13px] text-white/50">
                  Срок: {deliveryDays}
                </span>
            <span className="text-[14px] font-medium text-white vx-price">
              {deliveryCost.toLocaleString("ru-RU")} ₽
            </span>
              </>
            ) : costPending ? (
              <span className="text-[13px] text-white/50">
                Стоимость уточняется менеджером
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-4">
        <p className="text-[11px] font-mono tracking-[0.2em] uppercase text-white/45">
          Товары
        </p>
        <div className="space-y-3">
          {cart.map((item: CartLine) => {
            const src =
              item.product.imagePlaceholder ||
              (item.product.images?.length ? item.product.images[0] : null) ||
              item.product.image ||
              "/globe.svg";

            return (
              <div key={item.cartId} className="flex gap-3">
                <div className="relative w-14 h-16 shrink-0 overflow-hidden rounded-lg border border-white/5">
                  <Image
                    src={src}
                    alt={item.product.name}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-white line-clamp-1">
                    {item.product.name}
                  </p>
                  <p className="text-[11px] font-mono text-white/45 uppercase tracking-wider mt-0.5">
                    {item.size} × {item.qty}
                  </p>
                </div>
                <p className="text-[14px] font-medium text-white vx-price">
                  {(item.product.price * item.qty).toLocaleString("ru-RU")} ₽
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[13px] text-white/50">Товары</span>
          <span className="text-[14px] text-white vx-price">
            {subtotal.toLocaleString("ru-RU")} ₽
          </span>
        </div>
        {showCostRow && (
          <div className="flex items-center justify-between mb-3">
            <span className="text-[13px] text-white/50">Доставка</span>
            <span className="text-[14px] text-white vx-price">
              {deliveryCost.toLocaleString("ru-RU")} ₽
            </span>
          </div>
        )}
        {costPending && (
          <div className="flex items-center justify-between mb-3">
            <span className="text-[13px] text-white/50">Доставка</span>
            <span className="text-[13px] text-white/40">уточняется</span>
          </div>
        )}
        <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
          <span className="text-[14px] font-medium text-white">Итого</span>
          <span className="text-[20px] font-semibold text-white vx-price">
            {total.toLocaleString("ru-RU")} ₽
          </span>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-crimson/40 bg-crimson/10 px-4 py-3 text-[13px] text-crimson">
          {error}
        </div>
      )}

      {/* Agreement checkbox */}
      <label className="flex items-start gap-3 cursor-pointer group">
        <div className="relative mt-0.5 shrink-0">
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-5 h-5 rounded border border-white/20 bg-white/[0.03] transition-all peer-checked:border-gold/50 peer-checked:bg-gold/10 peer-focus-visible:ring-1 peer-focus-visible:ring-gold/30 group-hover:border-white/30" />
          <svg
            className="absolute inset-0 w-5 h-5 text-gold opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none p-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <span className="text-[13px] text-white/60 leading-relaxed">
          Нажимая на кнопку вы соглашаетесь с{" "}
          <Link href="/legal/policy" className={`${GOLD_GRADIENT} hover:underline`}>
            Политикой конфиденциальности
          </Link>
          , а также с{" "}
          <Link href="/legal/offer" className={`${GOLD_GRADIENT} hover:underline`}>
            Условиями продажи
          </Link>
          {" "}и{" "}
          <Link href="/legal/shipping" className={`${GOLD_GRADIENT} hover:underline`}>
            Условиями доставки
          </Link>
        </span>
      </label>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="flex-1 vx-back-btn"
        >
          Назад
        </button>
        <button
          type="button"
          onClick={handlePayment}
          disabled={submitting || !agreedToTerms}
          className="flex-1 vx-gold-btn"
        >
          {submitting ? "Переход к оплате..." : `Оплатить ${total.toLocaleString("ru-RU")}\u00A0₽`}
        </button>
      </div>

      <p className="text-[11px] text-white/35 text-center leading-relaxed">
        После нажатия кнопки вы будете перенаправлены на страницу оплаты ЮКасса
      </p>
    </div>
  );
}
