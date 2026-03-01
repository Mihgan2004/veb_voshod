import { Russo_One } from "next/font/google";

const russoOne = Russo_One({
  weight: "400",
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-marquee",
});

const MARQUEE_TEXT = "ВОСХОД х ОТКРЫТИЕ";

/**
 * Бегущая строка — тонкая, на всю ширину экрана.
 * Отдельный блок между TeeIntro и Highlights.
 */
export function MarqueeStrip() {
  const repeated = Array(20).fill(MARQUEE_TEXT).join("  •  ");

  return (
    <section
      className={`
        relative w-full overflow-hidden
        py-2 sm:py-2.5
        border-y border-white/[0.06]
        bg-[#0a0c0f]
        ${russoOne.variable}
      `}
    >
      <div className="overflow-hidden">
        <div
          className="inline-flex whitespace-nowrap text-[9px] sm:text-[10px] md:text-[11px] font-medium uppercase tracking-[0.3em] text-white/30 animate-marquee"
          style={{ fontFamily: "var(--font-marquee), sans-serif" }}
        >
          <span className="pr-6">{repeated}</span>
          <span className="pr-6" aria-hidden>{repeated}</span>
        </div>
      </div>
    </section>
  );
}
