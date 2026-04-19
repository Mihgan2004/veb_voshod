"use client";

import React, { useEffect, useState, useCallback, useRef, Suspense, startTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/lib/cart/cart-store";
import { useCheckout } from "@/lib/checkout/checkout-store";
import { PageShell } from "@/components/site/PageShell";

type UiState = "loading" | "pending" | "paid" | "failed_confirmed" | "technical_issue";

const POLL_INTERVAL_MS = 3_000;
const MAX_POLLS = 40;

type StatusJson = {
  ok?: boolean;
  paymentPhase?: string;
  paymentStatus?: string;
  degraded?: boolean;
};

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const clear = useCart((s) => s.clear);
  const resetCheckout = useCheckout((s) => s.reset);

  const [uiState, setUiState] = useState<UiState>(() => (orderId ? "loading" : "pending"));
  const [pollSession, setPollSession] = useState(0);
  const pollCount = useRef(0);
  const clearedRef = useRef(false);

  const checkStatus = useCallback(async () => {
    if (!orderId) {
      return true;
    }

    try {
      const res = await fetch(`/api/orders/status?orderId=${encodeURIComponent(orderId)}`);

      if (!res.ok) {
        setUiState("technical_issue");
        return true;
      }

      const data = (await res.json()) as StatusJson;
      const phase = data.paymentPhase;

      if (phase === "paid") {
        setUiState("paid");
        return true;
      }

      if (phase === "failed") {
        setUiState("failed_confirmed");
        return true;
      }

      if (phase === "technical") {
        setUiState("technical_issue");
        return true;
      }

      if (phase === "unknown" || phase === "pending") {
        setUiState("pending");
        return false;
      }

      setUiState("pending");
      return false;
    } catch {
      setUiState("technical_issue");
      return true;
    }
  }, [orderId]);

  useEffect(() => {
    if (!orderId) {
      return;
    }

    let timer: ReturnType<typeof setTimeout>;
    let cancelled = false;

    pollCount.current = 0;
    startTransition(() => {
      setUiState("loading");
    });

    async function poll() {
      if (cancelled) return;
      const done = await checkStatus();
      pollCount.current += 1;

      if (!done && pollCount.current < MAX_POLLS && !cancelled) {
        timer = setTimeout(poll, POLL_INTERVAL_MS);
      } else if (!done && pollCount.current >= MAX_POLLS) {
        setUiState("pending");
      }
    }

    poll();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [checkStatus, orderId, pollSession]);

  useEffect(() => {
    if (uiState === "paid" && !clearedRef.current) {
      clearedRef.current = true;
      clear();
      resetCheckout();
    }
  }, [uiState, clear, resetCheckout]);

  if (!orderId) {
    return (
      <div className="animate-fade-in min-h-[60vh] flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <svg className="w-10 h-10 text-white/35" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M4.93 4.93l14.14 14.14M12 2a10 10 0 100 20 10 10 0 000-20z" />
            </svg>
          </div>

          <h1 className="text-[24px] sm:text-[30px] font-semibold tracking-[-0.02em] text-white mb-3">
            Заказ не указан
          </h1>

          <p className="text-[15px] text-white/50 mb-8 leading-relaxed">
            В адресе страницы нет номера заказа. Откройте ссылку из письма после оплаты или вернитесь в каталог.
          </p>

          <div className="space-y-3">
            <Link
              href="/catalog"
              className="block w-full h-12 rounded-xl bg-gold text-graphite font-mono text-[12px] uppercase tracking-[0.2em] hover:bg-gold/90 transition-all flex items-center justify-center"
            >
              В каталог
            </Link>
            <Link
              href="/"
              className="block w-full h-12 rounded-xl border border-white/10 bg-white/[0.02] font-mono text-[12px] uppercase tracking-[0.2em] text-white/60 hover:bg-white/[0.05] hover:text-white/80 transition-all flex items-center justify-center"
            >
              На главную
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (uiState === "loading") {
    return (
      <div className="animate-fade-in min-h-[60vh] flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-white/40 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.25" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="text-[24px] sm:text-[28px] font-semibold tracking-[-0.02em] text-white mb-3">
            Проверяем оплату...
          </h1>
          <p className="text-[15px] text-white/50">
            Пожалуйста, подождите
          </p>
        </div>
      </div>
    );
  }

  if (uiState === "failed_confirmed") {
    return (
      <div className="animate-fade-in min-h-[60vh] flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          <h1 className="text-[28px] sm:text-[36px] font-semibold tracking-[-0.02em] text-white mb-3">
            Оплата не прошла
          </h1>

          {orderId && (
            <p className="text-[18px] text-white/60 mb-2">
              Заказ <span className="font-mono text-white">#{orderId}</span>
            </p>
          )}

          <p className="text-[15px] text-white/50 mb-8 leading-relaxed">
            Платёж был отклонён или отменён. Попробуйте оформить заказ повторно.
          </p>

          <div className="space-y-3">
            <Link
              href="/checkout"
              className="block w-full h-12 rounded-xl bg-gold text-graphite font-mono text-[12px] uppercase tracking-[0.2em] hover:bg-gold/90 transition-all flex items-center justify-center"
            >
              Попробовать снова
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
              Если проблема повторяется, напишите нам на{" "}
              <a href="mailto:info@voshod.shop" className="text-white/60 hover:text-white underline underline-offset-2">
                info@voshod.shop
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (uiState === "technical_issue") {
    return (
      <div className="animate-fade-in min-h-[60vh] flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <svg className="w-10 h-10 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 5a7 7 0 110 14 7 7 0 010-14z" />
            </svg>
          </div>

          <h1 className="text-[24px] sm:text-[30px] font-semibold tracking-[-0.02em] text-white mb-3">
            Не удалось проверить оплату
          </h1>

          {orderId && (
            <p className="text-[18px] text-white/60 mb-2">
              Заказ <span className="font-mono text-white">#{orderId}</span>
            </p>
          )}

          <p className="text-[15px] text-white/50 mb-8 leading-relaxed">
            Сервис временно недоступен или ответ задержался. Статус заказа мы отправим на почту — при необходимости обновите страницу позже.
          </p>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => {
                setPollSession((s) => s + 1);
              }}
              className="block w-full h-12 rounded-xl bg-gold text-graphite font-mono text-[12px] uppercase tracking-[0.2em] hover:bg-gold/90 transition-all flex items-center justify-center"
            >
              Проверить снова
            </button>
            <Link
              href="/"
              className="block w-full h-12 rounded-xl border border-white/10 bg-white/[0.02] font-mono text-[12px] uppercase tracking-[0.2em] text-white/60 hover:bg-white/[0.05] hover:text-white/80 transition-all flex items-center justify-center"
            >
              На главную
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (uiState === "pending" || uiState === "paid") {
    const isPaid = uiState === "paid";
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
            {isPaid ? "Заказ оплачен" : "Заказ оформлен"}
          </h1>

          {orderId && (
            <p className="text-[18px] text-white/60 mb-2">
              {isPaid ? "Номер заказа: " : "Номер заказа: "}
              <span className="font-mono text-white">#{orderId}</span>
            </p>
          )}

          <p className="text-[15px] text-white/50 mb-8 leading-relaxed">
            {isPaid
              ? "Спасибо за покупку! Мы отправим уведомление о статусе заказа на вашу почту."
              : "Заказ оформлен, ожидаем подтверждение оплаты. Если вы уже оплатили, статус обновится через минуту — мы также пришлём письмо на почту."}
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
