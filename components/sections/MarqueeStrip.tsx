import { Russo_One } from "next/font/google";

const russoOne = Russo_One({
  weight: "400",
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-marquee",
});

const MARQUEE_TEXT = "ВОСХОД х ОТКРЫТИЕ";

export function MarqueeStrip() {
  const repeated = Array(20).fill(MARQUEE_TEXT).join("  •  ");

  return (
    <section
      className={`
        relative w-full overflow-hidden
        py-2.5 sm:py-3
        border-y border-white/[0.04]
        bg-[#07090c]
        ${russoOne.variable}
      `}
    >
      <div className="overflow-hidden">
        <div
          className="inline-flex whitespace-nowrap text-[8px] sm:text-[9px] md:text-[10px] font-medium uppercase tracking-[0.35em] text-white/18 animate-marquee"
          style={{ fontFamily: "var(--font-marquee), sans-serif" }}
        >
          <span className="pr-6">{repeated}</span>
          <span className="pr-6" aria-hidden>{repeated}</span>
        </div>
      </div>
    </section>
  );
}
