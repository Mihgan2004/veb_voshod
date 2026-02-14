// components/cart/CartPageClient.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart/cart-store";

const inputBase =
  "w-full rounded-xl border bg-white/[0.03] px-4 py-3 text-[14px] text-white placeholder:text-white/35 outline-none transition-colors focus:border-white/25 focus:ring-1 focus:ring-white/10";

export function CartPageClient() {
  const cart = useCart((s) => s.cart);
  const removeFromCart = useCart((s) => s.removeFromCart);
  const clear = useCart((s) => s.clear);

  const total = cart.reduce((sum, i) => sum + i.product.price * i.qty, 0);
  const totalItems = cart.reduce((sum, i) => sum + i.qty, 0);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [touched, setTouched] = useState({ name: false, email: false });
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const nameValid = name.trim().length >= 2;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canSubmit = cart.length > 0 && nameValid && emailValid && !submitting;

  async function handleCheckout() {
    if (!canSubmit) return;
    setSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    setTouched({ name: true, email: true });

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: { name: name.trim(), email: email.trim(), phone: phone.trim() || undefined, comment: comment.trim() || undefined },
          cart,
        }),
      });

      const json = (await res.json().catch(() => null)) as
        | { orderId?: string | number; error?: string; message?: string }
        | null;

      if (!res.ok) {
        const details = json?.message || json?.error || "ORDER_FAILED";
        throw new Error(details);
      }

      setSuccessMessage(
        json?.orderId
          ? `Заказ №${json.orderId} принят. Мы свяжемся с вами для подтверждения и доставки.`
          : "Заказ принят. Мы свяжемся с вами в ближайшее время.",
      );
      clear();
      setName("");
      setEmail("");
      setPhone("");
      setComment("");
      setTouched({ name: false, email: false });
    } catch (e) {
      console.error(e);
      const message =
        e instanceof Error && e.message && e.message !== "ORDER_FAILED"
          ? e.message
          : "Не удалось отправить заказ. Проверьте данные или напишите нам напрямую.";
      setErrorMessage(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="animate-fade-in min-h-screen">
      {/* Заголовок */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 sm:mb-10">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <h1 className="text-[24px] sm:text-[32px] font-semibold tracking-[-0.02em] text-white">
            Корзина
          </h1>
          <span className="h-px w-8 sm:w-12 bg-white/10 shrink-0" />
          <span className="text-[11px] font-mono tracking-[0.28em] uppercase text-white/45 truncate">
            {cart.length === 0
              ? "пусто"
              : `${totalItems} ${totalItems === 1 ? "товар" : totalItems < 5 ? "товара" : "товаров"}`}
          </span>
        </div>
        {cart.length > 0 && (
          <button
            type="button"
            onClick={clear}
            className="text-[11px] font-mono uppercase tracking-widest text-white/40 hover:text-white/70 transition-colors"
          >
            Очистить корзину
          </button>
        )}
      </div>

      {cart.length === 0 ? (
        /* Пустая корзина */
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8 sm:p-12 text-center">
          <p className="text-[15px] text-white/50">В корзине пока ничего нет.</p>
          <p className="mt-2 text-[13px] text-white/40">
            Выберите товары в каталоге и добавьте их в корзину.
          </p>
          <Link
            href="/catalog"
            className="mt-6 inline-flex items-center justify-center h-12 px-6 rounded-xl border border-white/15 bg-white/[0.04] text-[12px] font-mono uppercase tracking-[0.2em] text-white/80 hover:bg-white/[0.08] hover:text-white transition-all"
          >
            Перейти в каталог
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          {/* Список товаров */}
          <div className="lg:col-span-2 space-y-4">
            <p className="text-[11px] font-mono tracking-[0.28em] uppercase text-white/45 mb-4">
              Товары в корзине
            </p>
            {cart.map((item) => {
              const src =
                item.product.imagePlaceholder ||
                (item.product.images?.length ? item.product.images[0] : null) ||
                item.product.image ||
                "/globe.svg";

              return (
                <div
                  key={item.cartId}
                  className="flex gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition-colors hover:border-white/[0.1]"
                >
                  <div className="relative w-20 h-24 sm:w-24 sm:h-28 shrink-0 overflow-hidden rounded-lg border border-white/5">
                    <Image
                      src={src}
                      alt={item.product.name}
                      fill
                      unoptimized={false}
                      sizes="96px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap justify-between gap-2">
                      <div>
                        <p className="text-[13px] sm:text-[14px] font-medium text-white leading-tight line-clamp-2">
                          {item.product.name}
                        </p>
                        <p className="mt-1 text-[11px] font-mono text-white/45 uppercase tracking-wider">
                          {item.product.specs?.color && `${item.product.specs.color} · `}
                          Размер {item.size} × {item.qty}
                        </p>
                      </div>
                      <p className="text-[14px] font-semibold text-white tabular-nums shrink-0">
                        {(item.product.price * item.qty).toLocaleString("ru-RU")} ₽
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.cartId)}
                      className="mt-3 text-[11px] font-mono uppercase tracking-wider text-white/40 hover:text-crimson transition-colors"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Оформление заказа */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 space-y-6">
              <div>
                <p className="text-[11px] font-mono tracking-[0.28em] uppercase text-white/45">
                  Итого
                </p>
                <p className="mt-2 text-[24px] font-semibold text-white tabular-nums">
                  {total.toLocaleString("ru-RU")} ₽
                </p>
              </div>

              <div className="h-px bg-white/[0.06]" />

              <div>
                <p className="text-[11px] font-mono tracking-[0.28em] uppercase text-white/45 mb-4">
                  Контактные данные
                </p>
                <p className="text-[12px] text-white/40 mb-4">
                  Укажите имя и email — мы свяжемся с вами для подтверждения заказа и доставки.
                </p>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="cart-name" className="block text-[12px] text-white/50 mb-1.5">
                      Имя <span className="text-crimson">*</span>
                    </label>
                    <input
                      id="cart-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                      placeholder="Как к вам обращаться"
                      className={`${inputBase} ${touched.name && !nameValid ? "border-red-500/50" : "border-white/10"}`}
                      autoComplete="name"
                    />
                    {touched.name && !nameValid && name.trim() !== "" && (
                      <p className="mt-1 text-[11px] text-crimson">Минимум 2 символа</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="cart-email" className="block text-[12px] text-white/50 mb-1.5">
                      Email <span className="text-crimson">*</span>
                    </label>
                    <input
                      id="cart-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                      placeholder="example@mail.ru"
                      className={`${inputBase} ${touched.email && !emailValid && email.trim() !== "" ? "border-red-500/50" : "border-white/10"}`}
                      autoComplete="email"
                    />
                    {touched.email && email.trim() !== "" && !emailValid && (
                      <p className="mt-1 text-[11px] text-crimson">Введите корректный email</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="cart-phone" className="block text-[12px] text-white/50 mb-1.5">
                      Телефон
                    </label>
                    <input
                      id="cart-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+7 (999) 123-45-67"
                      className={`${inputBase} border-white/10`}
                      autoComplete="tel"
                    />
                  </div>
                  <div>
                    <label htmlFor="cart-comment" className="block text-[12px] text-white/50 mb-1.5">
                      Комментарий к заказу
                    </label>
                    <textarea
                      id="cart-comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Пожелания по доставке или заказу"
                      rows={3}
                      className={`${inputBase} border-white/10 resize-none`}
                    />
                  </div>
                </div>
              </div>

              {successMessage && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-[13px] text-emerald-300 leading-relaxed">
                  {successMessage}
                </div>
              )}
              {errorMessage && (
                <div className="rounded-xl border border-crimson/40 bg-crimson/10 px-4 py-3 text-[13px] text-crimson leading-relaxed">
                  {errorMessage}
                </div>
              )}

              <button
                type="button"
                disabled={!canSubmit}
                onClick={handleCheckout}
                className={`w-full h-12 rounded-xl font-mono text-[12px] uppercase tracking-[0.2em] transition-all ${
                  canSubmit
                    ? "bg-gold text-graphite hover:bg-gold/90 active:scale-[0.99]"
                    : "bg-white/5 border border-white/10 text-white/30 cursor-not-allowed"
                }`}
              >
                {submitting ? "Отправка…" : "Оформить заказ"}
              </button>

              <p className="text-[11px] text-white/35 leading-relaxed">
                После отправки мы свяжемся с вами для уточнения доставки и оплаты.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
