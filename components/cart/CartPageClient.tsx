'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart/cart-store';

export function CartPageClient() {
  const { cart, removeFromCart, clear } = useCart(s => ({
    cart: s.cart,
    removeFromCart: s.removeFromCart,
    clear: s.clear,
  }));

  const total = cart.reduce((sum, i) => sum + i.product.price * i.qty, 0);

  return (
    <div className="animate-fade-in min-h-screen">
      <div className="flex items-end justify-between mb-10">
        <h1 className="text-3xl sm:text-4xl font-light">CART</h1>
        {cart.length > 0 && (
          <button onClick={clear} className="text-[10px] font-mono uppercase tracking-widest text-gray-500 hover:text-gray-300">
            CLEAR
          </button>
        )}
      </div>

      {cart.length === 0 ? (
        <div className="bg-graphite-light border border-white/5 rounded-2xl p-10 text-center">
          <div className="text-gray-400">Cart is empty.</div>
          <Link href="/catalog" className="mt-6 inline-block text-gold text-xs uppercase tracking-widest hover:underline underline-offset-4">
            Go to catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-4">
            {cart.map(item => (
              <div key={item.cartId} className="flex gap-4 bg-graphite-light border border-white/5 rounded-2xl p-4">
                <img src={item.product.image} alt={item.product.name} className="w-24 h-28 object-cover rounded-xl border border-white/5" />
                <div className="flex-1">
                  <div className="flex justify-between gap-4">
                    <div>
                      <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                        {item.product.category} / {item.size} / QTY {item.qty}
                      </div>
                      <div className="mt-2 text-sm text-gray-200">{item.product.name}</div>
                    </div>
                    <div className="text-sm font-mono text-gold whitespace-nowrap">
                      {(item.product.price * item.qty).toLocaleString('ru-RU')} ₽
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
            ))}
          </div>

          <div className="bg-graphite-light border border-white/5 rounded-2xl p-6 h-fit">
            <div className="text-xs font-mono uppercase tracking-widest text-gray-500">SUMMARY</div>
            <div className="mt-6 flex justify-between text-sm">
              <span className="text-gray-400">Total</span>
              <span className="font-mono text-gold">{total.toLocaleString('ru-RU')} ₽</span>
            </div>
            <button className="mt-8 w-full py-4 rounded-2xl font-mono uppercase tracking-widest text-sm bg-gold/15 border border-gold/40 text-gold hover:bg-gold/20 transition-all">
              CHECKOUT
            </button>
            <div className="mt-4 text-[10px] text-gray-600 leading-relaxed">
              Checkout подключим позже (ЮKassa/СДЭК).
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
