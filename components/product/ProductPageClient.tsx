// components/product/ProductPageClient.tsx
"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { useCart } from "@/lib/cart/cart-store";

/* ================================================================== */
/*  Accordion section                                                  */
/* ================================================================== */

function Accordion({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-white/[0.06]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left group"
      >
        <span className="text-[13px] sm:text-[14px] font-medium uppercase tracking-[0.06em] text-white/80 group-hover:text-white transition-colors duration-200">
          {title}
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className={`text-white/40 sm:transition-transform sm:duration-300 ${open ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div
        className={`overflow-hidden sm:transition-all sm:duration-300 ${
          open ? "max-h-[500px] opacity-100 pb-5" : "max-h-0 opacity-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Quantity selector                                                  */
/* ================================================================== */

function QuantitySelector({
  value,
  onChange,
  max = 10,
}: {
  value: number;
  onChange: (v: number) => void;
  max?: number;
}) {
  return (
    <div className="inline-flex items-center border border-white/10 rounded-xl overflow-hidden">
      <button
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
        className="w-11 h-11 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.04] transition-all duration-200 disabled:opacity-25 disabled:pointer-events-none"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M5 12h14" strokeLinecap="round" />
        </svg>
      </button>
      <span className="w-10 text-center text-[14px] font-medium text-white tabular-nums">
        {value}
      </span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="w-11 h-11 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.04] transition-all duration-200 disabled:opacity-25 disabled:pointer-events-none"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 5v14M5 12h14" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

/* ================================================================== */
/*  Product page                                                       */
/* ================================================================== */

/** Все URL изображений товара: главное + галерея без дубликатов. */
function productImageList(product: Product): string[] {
  const main = product.image || product.imagePlaceholder;
  const list = product.images?.length ? product.images : main ? [main] : [];
  if (main && !list.includes(main)) return [main, ...list];
  return list.length ? list : ["/globe.svg"];
}

export function ProductPageClient({ product }: { product: Product }) {
  const addToCart = useCart((s) => s.addToCart);

  const imageList = productImageList(product);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] ?? "ONE SIZE");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const src = (imageList[selectedImageIndex] ?? product.image) || "/globe.svg";

  const statusLabel =
    product.status === "available"
      ? "IN STOCK"
      : product.status === "preorder"
        ? "PREORDER"
        : "SOLD OUT";

  const handleAdd = useCallback(() => {
    addToCart(product, selectedSize, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  }, [addToCart, product, selectedSize, qty]);

  /* ---- Build spec rows for accordion ---- */
  const compositionRows: { label: string; value: string }[] = [];
  if (product.specs?.fabric) compositionRows.push({ label: "Материал", value: product.specs.fabric });
  if (product.specs?.density) compositionRows.push({ label: "Плотность", value: product.specs.density });
  if (product.specs?.print) compositionRows.push({ label: "Принт", value: product.specs.print });
  if (product.specs?.color) compositionRows.push({ label: "Цвет", value: product.specs.color });
  if (product.specs?.code) compositionRows.push({ label: "Артикул", value: product.specs.code });
  if (product.specs?.batch) compositionRows.push({ label: "Партия", value: product.specs.batch });

  return (
    <div className="animate-fade-in min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 pt-24 sm:pt-28 md:pt-32 pb-16 md:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-start">

          {/* ============================================================ */}
          {/*  LEFT: Gallery + main image                                   */}
          {/* ============================================================ */}
          <div className="lg:sticky lg:top-32 space-y-3">
            <div className="relative bg-white/[0.02] rounded-lg border border-white/[0.06] overflow-hidden aspect-[3/4] min-h-[400px] lg:min-h-[560px] xl:min-h-[640px]">
              <Image
                key={selectedImageIndex}
                src={src}
                alt={product.name}
                fill
                unoptimized={false}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              {product.status !== "available" && (
                <div className="absolute top-0 left-0 px-3 py-1.5 bg-black/80 text-[10px] font-mono uppercase tracking-widest text-white/90">
                  {statusLabel}
                </div>
              )}
            </div>
            {imageList.length > 1 && (
              <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
                {imageList.map((url, i) => {
                  const active = i === selectedImageIndex;
                  return (
                    <button
                      key={`${url}-${i}`}
                      type="button"
                      onClick={() => setSelectedImageIndex(i)}
                      className={`relative shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                        active ? "border-white ring-1 ring-white/30" : "border-white/20 hover:border-white/40"
                      }`}
                    >
                      <Image
                        src={url}
                        alt=""
                        fill
                        unoptimized={false}
                        sizes="64px"
                        className="object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ============================================================ */}
          {/*  RIGHT: Product info + order flow                             */}
          {/* ============================================================ */}
          <div className="flex flex-col">

            {/* Category breadcrumb */}
            <div className="flex items-center gap-2 text-[11px] font-mono tracking-[0.32em] uppercase text-white/40 mb-4">
              <Link href="/catalog" className="hover:text-white/60 transition-colors duration-200">КАТАЛОГ</Link>
              <span className="text-white/20">/</span>
              <span>{product.category.toUpperCase()}</span>
            </div>

            {/* Name */}
            <h1 className="text-[26px] sm:text-[36px] font-semibold tracking-[-0.02em] text-white leading-[1.15]">
              {product.name}
            </h1>

            {/* Price + status + артикул */}
            <div className="mt-4 flex flex-wrap items-baseline gap-4">
              <span className="text-[22px] sm:text-[26px] font-bold text-white tabular-nums">
                {product.price.toLocaleString("ru-RU")}&nbsp;₽
              </span>
              <span className={`text-[11px] font-mono uppercase tracking-[0.2em] ${
                product.inStock ? "text-emerald-400/80" : "text-white/35"
              }`}>
                {statusLabel}
              </span>
              {product.specs?.code && (
                <span className="text-[11px] font-mono text-white/40 tracking-wider">
                  Артикул: {product.specs.code}
                </span>
              )}
            </div>

            {/* Описание товара */}
            {product.description ? (
              <p className="mt-5 text-[14px] leading-[1.7] text-white/55 max-w-[52ch]">
                {product.description}
              </p>
            ) : null}

            {/* ---- Divider ---- */}
            <div className="h-px bg-white/[0.06] mt-8 mb-2" />

            {/* ============================================ */}
            {/*  COLOR (if available)                         */}
            {/* ============================================ */}
            {product.specs?.color && (
              <div className="py-4 border-b border-white/[0.06]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono tracking-[0.32em] uppercase text-white/45">
                    ЦВЕТ
                  </span>
                  <span className="text-[13px] text-white/70">
                    {product.specs.color}
                  </span>
                </div>
              </div>
            )}

            {/* ============================================ */}
            {/*  SIZE SELECTOR                                */}
            {/* ============================================ */}
            <div className="py-5 border-b border-white/[0.06]">
              <div className="text-[11px] font-mono tracking-[0.32em] uppercase text-white/45 mb-3">
                РАЗМЕР
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[48px] h-11 px-3 border rounded-lg font-mono text-[13px] transition-all duration-200 ${
                      selectedSize === size
                        ? "border-white text-white bg-white/[0.08]"
                        : "border-white/10 text-white/50 hover:border-white/25 hover:text-white/70"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* ============================================ */}
            {/*  QUANTITY + ADD TO CART                        */}
            {/* ============================================ */}
            <div className="py-5 border-b border-white/[0.06]">
              <div className="text-[11px] font-mono tracking-[0.32em] uppercase text-white/45 mb-3">
                КОЛИЧЕСТВО
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <QuantitySelector value={qty} onChange={setQty} />

                <button
                  disabled={!product.inStock}
                  onClick={handleAdd}
                  className={`flex-1 min-w-[200px] h-12 sm:h-[52px] rounded-lg text-[12px] sm:text-[13px] uppercase tracking-[0.18em] font-semibold transition-all duration-300 ${
                    added
                      ? "bg-emerald-500/15 border border-emerald-400/40 text-emerald-400"
                      : product.inStock
                        ? "bg-white text-black hover:bg-white/90 active:scale-[0.98]"
                        : "bg-white/[0.04] border border-white/10 text-white/30 cursor-not-allowed"
                  }`}
                >
                  {added
                    ? "ДОБАВЛЕНО ✓"
                    : product.inStock
                      ? "ДОБАВИТЬ В КОРЗИНУ"
                      : "SOLD OUT"
                  }
                </button>
              </div>
            </div>

            {/* ============================================ */}
            {/*  ACCORDION SECTIONS                           */}
            {/* ============================================ */}

            {/* Composition / Specs */}
            {compositionRows.length > 0 && (
              <Accordion title="Состав и характеристики" defaultOpen>
                <div className="space-y-2.5">
                  {compositionRows.map((row) => (
                    <div key={row.label} className="flex items-baseline justify-between gap-4">
                      <span className="text-[12px] font-mono text-white/40 uppercase tracking-wider shrink-0">
                        {row.label}
                      </span>
                      <span className="text-[13px] text-white/70 text-right">
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              </Accordion>
            )}

            {/* Ordering process */}
            <Accordion title="Процесс заказа">
              <div className="space-y-4 text-[13px] leading-[1.65] text-white/55">
                <div className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full border border-white/10 flex items-center justify-center text-[11px] font-mono text-white/50">1</span>
                  <div>
                    <p className="text-white/75 font-medium">Выберите параметры</p>
                    <p className="mt-0.5">Укажите размер, цвет и количество. Добавьте товар в корзину.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full border border-white/10 flex items-center justify-center text-[11px] font-mono text-white/50">2</span>
                  <div>
                    <p className="text-white/75 font-medium">Оформите заказ</p>
                    <p className="mt-0.5">В корзине заполните контактные данные: имя, email и телефон.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full border border-white/10 flex items-center justify-center text-[11px] font-mono text-white/50">3</span>
                  <div>
                    <p className="text-white/75 font-medium">Подтверждение</p>
                    <p className="mt-0.5">Мы свяжемся с вами для подтверждения и уточнения доставки.</p>
                  </div>
                </div>
              </div>
            </Accordion>

            {/* Shipping */}
            <Accordion title="Доставка и возврат">
              <div className="space-y-3 text-[13px] leading-[1.65] text-white/55">
                <p>Доставка по России — СДЭК, Почта России. Срок 3–7 рабочих дней.</p>
                <p>Доставка по Москве — курьер, 1–2 дня.</p>
                <p>Возврат в течение 14 дней с момента получения при сохранении товарного вида.</p>
              </div>
            </Accordion>

            {/* Go to cart link (visible after add) */}
            {added && (
              <div className="mt-5 animate-fade-in">
                <Link
                  href="/cart"
                  className="inline-flex items-center gap-2 text-[12px] font-mono uppercase tracking-[0.2em] text-white/50 hover:text-white/80 transition-colors duration-200"
                >
                  ПЕРЕЙТИ В КОРЗИНУ
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
