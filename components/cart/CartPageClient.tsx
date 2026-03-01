"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart/cart-store";

export function CartPageClient() {
  const router = useRouter();
  const cart = useCart((s) => s.cart);
  const removeFromCart = useCart((s) => s.removeFromCart);
  const clear = useCart((s) => s.clear);

  const total = cart.reduce((sum, i) => sum + i.product.price * i.qty, 0);
  const totalItems = cart.reduce((sum, i) => sum + i.qty, 0);

  function handleCheckout() {
    if (cart.length > 0) {
      router.push("/checkout");
    }
  }

  return (
    <div className="animate-fade-in min-h-screen">
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
                <p className="text-[12px] text-white/50 mb-4">
                  Выберите способ доставки и оплатите заказ онлайн.
                </p>
                <ul className="space-y-2 text-[12px] text-white/40">
                  <li className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-gold"
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
                    Доставка СДЭК по всей России
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-gold"
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
                    Оплата картой через ЮКасса
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-gold"
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
                    Безопасная сделка
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={handleCheckout}
                className="w-full h-12 rounded-xl bg-gold text-graphite font-mono text-[12px] uppercase tracking-[0.2em] hover:bg-gold/90 active:scale-[0.99] transition-all"
              >
                Перейти к оформлению
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
