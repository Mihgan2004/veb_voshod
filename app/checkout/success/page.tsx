"use client";

import React, { useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/lib/cart/cart-store";
import { useCheckout } from "@/lib/checkout/checkout-store";
import { PageShell } from "@/components/site/PageShell";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const clear = useCart((s) => s.clear);
  const resetCheckout = useCheckout((s) => s.reset);

  useEffect(() => {
    clear();
    resetCheckout();
  }, [clear, resetCheckout]);

  return (
    <div className="animate-fade-in min-h-[60vh] flex items-center justify-center">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <svg
            className="w-10 h-10 text-emerald-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-[28px] sm:text-[36px] font-semibold tracking-[-0.02em] text-white mb-3">
          Заказ оформлен
        </h1>

        {orderId && (
          <p className="text-[18px] text-white/60 mb-2">
            Номер заказа: <span className="font-mono text-white">#{orderId}</span>
          </p>
        )}

        <p className="text-[15px] text-white/50 mb-8 leading-relaxed">
          Спасибо за покупку! Мы отправим уведомление о статусе заказа на вашу почту.
        </p>

        <div className="space-y-3">
          <Link
            href="/catalog"
            className="block w-full h-12 rounded-xl bg-gold text-graphite font-mono text-[12px] uppercase tracking-[0.2em] hover:bg-gold/90 transition-all flex items-center justify-center"
          >
            Продолжить покупки
          </Link>
          <Link
            href="/"
            className="block w-full h-12 rounded-xl border border-white/10 bg-white/[0.02] font-mono text-[12px] uppercase tracking-[0.2em] text-white/60 hover:bg-white/[0.05] hover:text-white/80 transition-all flex items-center justify-center"
          >
            На главную
          </Link>
        </div>

        <div className="mt-10 pt-6 border-t border-white/[0.06]">
          <p className="text-[12px] text-white/40 leading-relaxed">
            Если у вас возникли вопросы, напишите нам на{" "}
            <a
              href="mailto:info@voshod.shop"
              className="text-white/60 hover:text-white underline underline-offset-2"
            >
              info@voshod.shop
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <PageShell>
      <Suspense
        fallback={
          <div className="min-h-[60vh] flex items-center justify-center">
            <p className="text-[15px] text-white/50">Загрузка...</p>
          </div>
        }
      >
        <SuccessContent />
      </Suspense>
    </PageShell>
  );
}
