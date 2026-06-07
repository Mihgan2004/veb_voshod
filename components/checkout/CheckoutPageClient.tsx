"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart, type CartLine } from "@/lib/cart/cart-store";
import { useCheckout } from "@/lib/checkout/checkout-store";
import { CheckoutProgress } from "./CheckoutProgress";
import { StepContacts } from "./StepContacts";
import { StepDelivery } from "./StepDelivery";
import { StepSummary } from "./StepSummary";

export function CheckoutPageClient() {
  const router = useRouter();
  const cart = useCart((s) => s.cart);
  const loading = useCart((s) => s.loading);
  const step = useCheckout((s) => s.step);
  const setStep = useCheckout((s) => s.setStep);
  const deliveryCost = useCheckout((s) => s.deliveryCost);

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  const total = subtotal + deliveryCost;
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  useEffect(() => {
    if (!loading && cart.length === 0) {
      router.push("/cart");
    }
  }, [cart.length, loading, router]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  if (loading || cart.length === 0) {
    return (
      <div className="animate-fade-in min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-[15px] text-white/50">
            {loading ? "Загружаем корзину..." : "Корзина пуста"}
          </p>
          <Link
            href="/catalog"
            className="mt-4 inline-flex items-center justify-center h-12 px-6 rounded-xl border border-white/15 bg-white/[0.04] text-[12px] font-mono uppercase tracking-[0.2em] text-white/80 hover:bg-white/[0.08] hover:text-white transition-all"
          >
            Перейти в каталог
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in min-h-screen">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <h1 className="text-[24px] sm:text-[32px] font-semibold tracking-[-0.02em] text-white">
            Оформление заказа
          </h1>
        </div>
        <Link
          href="/cart"
          className="text-[11px] font-mono uppercase tracking-widest text-white/40 hover:text-white/70 transition-colors"
        >
          ← Вернуться в корзину
        </Link>
      </div>

      <CheckoutProgress currentStep={step} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
        <div className="lg:col-span-2">
          {step === 1 && <StepContacts onNext={() => setStep(2)} />}
          {step === 2 && (
            <StepDelivery
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && <StepSummary onBack={() => setStep(2)} />}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-28 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 space-y-5">
            <div>
              <p className="text-[11px] font-mono tracking-[0.28em] uppercase text-white/45 mb-3">
                Ваш заказ
              </p>
              <p className="text-[12px] text-white/50">
                {totalItems} {totalItems === 1 ? "товар" : totalItems < 5 ? "товара" : "товаров"}
              </p>
            </div>

            <div className="h-px bg-white/[0.06]" />

            <div className="space-y-3 max-h-[240px] overflow-y-auto scrollbar-none">
              {cart.map((item: CartLine) => {
                const src =
                  item.product.imagePlaceholder ||
                  (item.product.images?.length ? item.product.images[0] : null) ||
                  item.product.image ||
                  "/globe.svg";

                return (
                  <div key={item.lineItemId} className="flex gap-3">
                    <div className="relative w-12 h-14 shrink-0 overflow-hidden rounded-lg border border-white/5">
                      <Image
                        src={src}
                        alt={item.product.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] text-white line-clamp-1">
                        {item.product.name}
                      </p>
                      <p className="text-[10px] font-mono text-white/40 uppercase mt-0.5">
                        {item.size} × {item.qty}
                      </p>
                    </div>
                    <p className="text-[12px] font-medium text-white vx-price">
                      {(item.product.price * item.qty).toLocaleString("ru-RU")} ₽
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="h-px bg-white/[0.06]" />

            <div className="space-y-2">
              <div className="flex justify-between text-[13px]">
                <span className="text-white/50">Товары</span>
                <span className="text-white vx-price">
                  {subtotal.toLocaleString("ru-RU")} ₽
                </span>
              </div>
              {deliveryCost > 0 && (
                <div className="flex justify-between text-[13px]">
                  <span className="text-white/50">Доставка</span>
                  <span className="text-white vx-price">
                    {deliveryCost.toLocaleString("ru-RU")} ₽
                  </span>
                </div>
              )}
            </div>

            <div className="h-px bg-white/[0.06]" />

            <div className="flex justify-between items-center">
              <span className="text-[14px] font-medium text-white">Итого</span>
              <span className="text-[22px] font-semibold text-white vx-price">
                {total.toLocaleString("ru-RU")} ₽
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
