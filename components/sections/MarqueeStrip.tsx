import { Russo_One } from "next/font/google";

const russoOne = Russo_One({
  weight: "400",
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-marquee",
});

const MARQUEE_TEXT = "ВОСХОД х ОТКРЫТИЕ";

/**
 * Бегущая строка — компактная, без лишних отступов.
 * Размещается сразу после TeeIntroBlock, между блоками.
 */
export function MarqueeStrip() {
  const repeated = Array(16).fill(MARQUEE_TEXT).join("  •  ");

  return (
    <div
      className={`
        relative w-full max-w-5xl mx-auto overflow-hidden
        py-2.5 sm:py-3 md:py-3.5
        border border-white/[0.08] rounded-xl
        bg-white/[0.02]
        ${russoOne.variable}
      `}
    >
      <div className="overflow-hidden">
        <div
          className="inline-flex whitespace-nowrap text-[10px] sm:text-[11px] md:text-[12px] font-medium uppercase tracking-[0.25em] text-white/35 animate-marquee"
          style={{ fontFamily: "var(--font-marquee), sans-serif" }}
        >
          <span className="pr-4">{repeated}</span>
          <span className="pr-4" aria-hidden>{repeated}</span>
        </div>
      </div>
    </div>
  );
}
