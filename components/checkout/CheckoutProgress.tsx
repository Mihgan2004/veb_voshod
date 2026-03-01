"use client";

import React from "react";
import type { CheckoutStep } from "@/lib/checkout/checkout-store";

type CheckoutProgressProps = {
  currentStep: CheckoutStep;
};

const steps = [
  { step: 1 as const, label: "Контакты" },
  { step: 2 as const, label: "Доставка" },
  { step: 3 as const, label: "Оплата" },
];

export function CheckoutProgress({ currentStep }: CheckoutProgressProps) {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8 sm:mb-10">
      {steps.map(({ step, label }, index) => {
        const isActive = step === currentStep;
        const isCompleted = step < currentStep;
        const isLast = index === steps.length - 1;

        return (
          <React.Fragment key={step}>
            <div className="flex items-center gap-2 sm:gap-3">
              <div
                className={`
                  flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full
                  text-[11px] sm:text-[12px] font-mono font-medium transition-all
                  ${
                    isActive
                      ? "bg-gold text-graphite"
                      : isCompleted
                        ? "bg-white/10 text-white/80"
                        : "bg-white/[0.04] text-white/40"
                  }
                `}
              >
                {isCompleted ? (
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  step
                )}
              </div>
              <span
                className={`
                  text-[11px] sm:text-[12px] font-mono uppercase tracking-[0.15em] transition-colors
                  hidden sm:inline
                  ${
                    isActive
                      ? "text-white"
                      : isCompleted
                        ? "text-white/60"
                        : "text-white/40"
                  }
                `}
              >
                {label}
              </span>
            </div>

            {!isLast && (
              <div
                className={`
                  w-8 sm:w-12 h-px transition-colors
                  ${isCompleted ? "bg-white/20" : "bg-white/[0.06]"}
                `}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
