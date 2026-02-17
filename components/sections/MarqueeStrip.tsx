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
      className={`relative w-full overflow-hidden bg-[#07090c] py-2 sm:py-2.5 border-t border-white/[0.04] border-b border-white/[0.04] ${russoOne.variable}
        mt-[min(3.5rem,12vw)] sm:mt-6 md:mt-8`}
    >
      <div className="overflow-hidden">
        <div
          className="inline-flex whitespace-nowrap text-[11px] sm:text-[13px] md:text-[14px] uppercase tracking-[0.35em] text-white/25 animate-marquee"
          style={{ fontFamily: "var(--font-marquee), sans-serif" }}
        >
          <span>{repeated}</span>
          <span aria-hidden>{repeated}</span>
        </div>
      </div>
    </section>
  );
}
