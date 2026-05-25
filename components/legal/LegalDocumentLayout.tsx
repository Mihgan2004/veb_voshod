import Link from "next/link";
import type { ReactNode } from "react";

export function LegalDocumentLayout({
  title,
  children,
  publishedAt,
}: {
  title: string;
  children: ReactNode;
  publishedAt: string;
}) {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="text-[11px] font-mono uppercase tracking-widest text-white/40 hover:text-white/70 transition-colors"
        >
          ← На главную
        </Link>

        <h1 className="mt-6 text-[24px] sm:text-[32px] font-semibold tracking-[-0.02em] text-white">
          {title}
        </h1>

        <div className="mt-8">{children}</div>

        <p className="mt-10 text-[12px] text-white/30 pt-4 border-t border-white/[0.06]">
          Дата публикации: {publishedAt}. Действующая редакция.
        </p>
      </div>
    </div>
  );
}
