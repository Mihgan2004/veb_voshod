import Link from "next/link";

const SECTION_RE = /^(\d+)\.(\s|[^\d])/;
const SUBSECTION_RE = /^(\d+\.\d+)\.\s/;

function linkify(text: string) {
  const parts = text.split(/(https?:\/\/[^\s]+|tratonis2004@mail\.ru)/g);
  return parts.map((part, index) => {
    if (part.startsWith("http")) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/80 hover:text-gold underline underline-offset-2 transition-colors"
        >
          {part.replace(/^https?:\/\//, "")}
        </a>
      );
    }
    if (part === "tratonis2004@mail.ru") {
      return (
        <a
          key={index}
          href="mailto:tratonis2004@mail.ru"
          className="text-white/80 hover:text-gold underline underline-offset-2 transition-colors"
        >
          {part}
        </a>
      );
    }
    if (part.includes("Политикой обработки персональных данных")) {
      const [before, after] = part.split(/«Политикой обработки персональных данных»/);
      return (
        <span key={index}>
          {before}«
          <Link href="/legal/policy" className="text-white/80 hover:text-gold underline underline-offset-2">
            Политикой обработки персональных данных
          </Link>
          »{after}
        </span>
      );
    }
    return part;
  });
}

function paragraphClass(text: string) {
  if (SECTION_RE.test(text) && !SUBSECTION_RE.test(text)) {
    return "text-[16px] font-semibold text-white/80";
  }
  if (SUBSECTION_RE.test(text)) {
    return "text-white/60";
  }
  return "text-white/60";
}

function paragraphTag(text: string) {
  if (SECTION_RE.test(text) && !SUBSECTION_RE.test(text)) {
    return "h2";
  }
  return "p";
}

export function LegalParagraphs({
  paragraphs,
  skipTitle,
}: {
  paragraphs: string[];
  skipTitle?: boolean;
}) {
  return (
    <div className="space-y-4 text-[14px] sm:text-[15px] leading-relaxed">
      {paragraphs.map((text, index) => {
        if (skipTitle && index === 0) return null;
        if (skipTitle && index === 1 && text.includes("публикует настоящий")) {
          return (
            <p key={index} className="text-white/60">
              {linkify(text)}
            </p>
          );
        }

        const Tag = paragraphTag(text) as "h2" | "p";
        const className = `${paragraphClass(text)} ${Tag === "h2" ? "mt-6 mb-2" : ""}`;

        return (
          <Tag key={`${index}-${text.slice(0, 24)}`} className={className}>
            {linkify(text)}
          </Tag>
        );
      })}
    </div>
  );
}
