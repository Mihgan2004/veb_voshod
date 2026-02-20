import { Russo_One } from "next/font/google";

const russoOne = Russo_One({
  weight: "400",
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-marquee",
});

const MARQUEE_TEXT = "ВОСХОД х ОТКРЫТИЕ";

/**
 * Бегущая строка — серверный компонент (SSR), без "use client".
 * Показывается на всех устройствах, в т.ч. мобилка.
 * На мобилке позиция чуть ниже / адаптивная — на стыке между блоками.
 */
export function MarqueeStrip() {
  const repeated = Array(12).fill(MARQUEE_TEXT).join("  •  ");

  return (
    <section
      className={`relative w-full max-w-4xl mx-auto overflow-hidden py-3 sm:py-4 border border-white/10 rounded-lg px-4 sm:px-6 ${russoOne.variable}`}
    >
      <div className="overflow-hidden flex items-center justify-center">
        <div
          className="inline-flex whitespace-nowrap text-[11px] sm:text-[12px] md:text-[13px] font-medium uppercase tracking-[0.28em] text-white/40 animate-marquee"
          style={{ fontFamily: "var(--font-marquee), sans-serif" }}
        >
          <span>{repeated}</span>
          <span aria-hidden>{repeated}</span>
        </div>
      </div>
    </section>
  );
}
