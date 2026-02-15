"use client";

import { Russo_One } from "next/font/google";

const russoOne = Russo_One({
  weight: "400",
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-marquee",
});

const MARQUEE_TEXT = "ВОСХОД х ОТКРЫТИЕ";

export function MarqueeStrip() {
  const repeated = Array(12).fill(MARQUEE_TEXT).join("  •  ");

  return (
    <section
      className="relative w-full overflow-hidden bg-[#07090c] py-3 sm:py-4 my-10 sm:my-14 border-t border-white/[0.04] border-b border-white/[0.04]"
    >
      <div className="overflow-hidden">
        <div
          className={`inline-flex whitespace-nowrap text-[11px] sm:text-[13px] md:text-[14px] uppercase tracking-[0.35em] text-white/25 animate-marquee ${russoOne.variable}`}
          style={{ fontFamily: "var(--font-marquee), sans-serif" }}
        >
          <span>{repeated}</span>
          <span aria-hidden>{repeated}</span>
        </div>
      </div>
    </section>
  );
}
