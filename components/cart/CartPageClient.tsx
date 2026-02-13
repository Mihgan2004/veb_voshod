// components/cart/CartPageClient.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart/cart-store";

export function CartPageClient() {
  const cart = useCart((s) => s.cart);
  const removeFromCart = useCart((s) => s.removeFromCart);
  const clear = useCart((s) => s.clear);

  const total = cart.reduce((sum, i) => sum + i.product.price * i.qty, 0);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleCheckout() {
    if (!cart.length) return;
    setSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: { name, email, phone, comment },
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
          ? `Заказ оформлен. Номер заявки: ${json.orderId}`
          : "Заказ оформлен. Мы свяжемся с вами в ближайшее время.",
      );
      clear();
      setName("");
      setEmail("");
      setPhone("");
      setComment("");
    } catch (e) {
      console.error(e);
      const message =
        e instanceof Error && e.message && e.message !== "ORDER_FAILED"
          ? e.message
          : "Не удалось оформить заказ. Попробуйте ещё раз или напишите нам напрямую.";
      setErrorMessage(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="animate-fade-in min-h-screen">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <h1 className="text-[28px] sm:text-[40px] font-medium tracking-[-0.02em] text-white">CART</h1>
          <span className="h-px flex-1 max-w-24 bg-white/10" />
          <span className="text-[11px] font-mono tracking-[0.32em] uppercase text-white/45">{cart.length} ITEM{cart.length === 1 ? "" : "S"}</span>
        </div>
        {cart.length > 0 && (
          <button
            onClick={clear}
            className="text-[10px] font-mono uppercase tracking-widest text-gray-500 hover:text-gray-300"
          >
            CLEAR
          </button>
        )}
      </div>

      {cart.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-10 text-center">
          <div className="text-gray-400">Cart is empty.</div>
          <Link
            href="/catalog"
            className="mt-6 inline-block text-gold text-xs uppercase tracking-widest hover:underline underline-offset-4"
          >
            Go to catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => {
              const src = item.product.imagePlaceholder || item.product.image || "/globe.svg";
              const isRemote = /^https?:\/\//.test(src);

              return (
                <div
                  key={item.cartId}
                  className="flex gap-4 bg-white/[0.02] border border-white/10 rounded-2xl p-4"
                >
                  <div className="relative w-24 h-28 overflow-hidden rounded-xl border border-white/5">
                    <Image
                      src={src}
                      alt={item.product.name}
                      fill
                      unoptimized={isRemote}
                      sizes="96px"
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between gap-4">
                      <div>
                        <div className="text-[11px] font-mono tracking-[0.32em] uppercase text-white/45">
                          {item.product.category} / {item.size} / QTY {item.qty}
                        </div>
                        <div className="mt-2 text-[14px] font-medium text-gray-200">
                          {item.product.name}
                        </div>
                      </div>
                      <div className="text-[14px] font-semibold text-white whitespace-nowrap">
                        {(item.product.price * item.qty).toLocaleString("ru-RU")} ₽
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.cartId)}
                      className="mt-3 text-[10px] font-mono uppercase tracking-widest text-gray-600 hover:text-crimson"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 h-fit space-y-5">
            <div>
              <div className="text-[11px] font-mono tracking-[0.32em] uppercase text-white/45">
                SUMMARY
              </div>
              <div className="mt-4 flex justify-between text-[14px]">
                <span className="text-white/60">Total</span>
                <span className="font-semibold text-white">
                  {total.toLocaleString("ru-RU")} ₽
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-[11px] font-mono tracking-[0.32em] uppercase text-white/45">
                CONTACT
              </div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Имя"
                className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-white/30"
              />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                type="email"
                className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-white/30"
              />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Телефон"
                className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-white/30"
              />
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Комментарий к заказу"
                rows={3}
                className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-white/30 resize-none"
              />
            </div>

            {successMessage ? (
              <div className="text-[11px] text-emerald-400 leading-relaxed bg-emerald-400/5 border border-emerald-400/30 rounded-xl px-3 py-2">
                {successMessage}
              </div>
            ) : null}
            {errorMessage ? (
              <div className="text-[11px] text-crimson leading-relaxed bg-crimson/10 border border-crimson/40 rounded-xl px-3 py-2">
                {errorMessage}
              </div>
            ) : null}

            <button
              disabled={!cart.length || !name || !email || submitting}
              onClick={handleCheckout}
              className={`mt-2 w-full py-4 rounded-2xl font-mono uppercase tracking-widest text-sm transition-all ${
                !cart.length || !name || !email || submitting
                  ? "bg-white/5 border border-white/10 text-gray-600 cursor-not-allowed"
                  : "bg-gold/15 border border-gold/40 text-gold hover:bg-gold/20"
              }`}
            >
              {submitting ? "SENDING…" : "CHECKOUT"}
            </button>

            <div className="mt-1 text-[10px] text-gray-600 leading-relaxed">
              Оплата и доставка подключаются отдельно (ЮKassa / СДЭК). Сейчас заявка уходит как
              заказ в систему.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
