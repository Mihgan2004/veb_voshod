"use client";

import React, { useState } from "react";
import { useCheckout, type ContactsData } from "@/lib/checkout/checkout-store";

const inputBase =
  "w-full rounded-xl border bg-white/[0.03] px-4 py-3 text-[14px] text-white placeholder:text-white/35 outline-none transition-colors focus:border-white/25 focus:ring-1 focus:ring-white/10";

type StepContactsProps = {
  onNext: () => void;
};

export function StepContacts({ onNext }: StepContactsProps) {
  const contacts = useCheckout((s) => s.contacts);
  const setContacts = useCheckout((s) => s.setContacts);
  const isContactsValid = useCheckout((s) => s.isContactsValid);

  const [touched, setTouched] = useState({
    name: false,
    email: false,
  });

  const nameValid = contacts.name.trim().length >= 2;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contacts.email.trim());

  function handleChange(field: keyof ContactsData, value: string) {
    setContacts({ [field]: value });
  }

  function handleBlur(field: "name" | "email") {
    setTouched((t) => ({ ...t, [field]: true }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ name: true, email: true });

    if (isContactsValid()) {
      onNext();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <p className="text-[11px] font-mono tracking-[0.28em] uppercase text-white/45 mb-4">
          Контактные данные
        </p>
        <p className="text-[13px] text-white/50 mb-6">
          Укажите ваши данные для связи. Мы свяжемся с вами для подтверждения заказа.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="checkout-name" className="block text-[12px] text-white/50 mb-1.5">
            Имя <span className="text-crimson">*</span>
          </label>
          <input
            id="checkout-name"
            type="text"
            value={contacts.name}
            onChange={(e) => handleChange("name", e.target.value)}
            onBlur={() => handleBlur("name")}
            placeholder="Как к вам обращаться"
            className={`${inputBase} ${
              touched.name && !nameValid ? "border-red-500/50" : "border-white/10"
            }`}
            autoComplete="name"
          />
          {touched.name && !nameValid && contacts.name.trim() !== "" && (
            <p className="mt-1 text-[11px] text-crimson">Минимум 2 символа</p>
          )}
        </div>

        <div>
          <label htmlFor="checkout-email" className="block text-[12px] text-white/50 mb-1.5">
            Email <span className="text-crimson">*</span>
          </label>
          <input
            id="checkout-email"
            type="email"
            value={contacts.email}
            onChange={(e) => handleChange("email", e.target.value)}
            onBlur={() => handleBlur("email")}
            placeholder="example@mail.ru"
            className={`${inputBase} ${
              touched.email && !emailValid && contacts.email.trim() !== ""
                ? "border-red-500/50"
                : "border-white/10"
            }`}
            autoComplete="email"
          />
          {touched.email && contacts.email.trim() !== "" && !emailValid && (
            <p className="mt-1 text-[11px] text-crimson">Введите корректный email</p>
          )}
        </div>

        <div>
          <label htmlFor="checkout-phone" className="block text-[12px] text-white/50 mb-1.5">
            Телефон
          </label>
          <input
            id="checkout-phone"
            type="tel"
            value={contacts.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            placeholder="+7 (999) 123-45-67"
            className={`${inputBase} border-white/10`}
            autoComplete="tel"
          />
        </div>

        <div>
          <label htmlFor="checkout-comment" className="block text-[12px] text-white/50 mb-1.5">
            Комментарий к заказу
          </label>
          <textarea
            id="checkout-comment"
            value={contacts.comment}
            onChange={(e) => handleChange("comment", e.target.value)}
            placeholder="Пожелания по заказу"
            rows={3}
            className={`${inputBase} border-white/10 resize-none`}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={!isContactsValid()}
        className="w-full vx-gold-btn"
      >
        Продолжить
      </button>
    </form>
  );
}
