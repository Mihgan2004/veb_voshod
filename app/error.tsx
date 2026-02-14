"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CatalogUnavailableError } from "@/lib/catalog";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const isCatalogError = error instanceof CatalogUnavailableError;

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center px-4 py-16">
      <p className="text-[18px] sm:text-[22px] font-light text-white/90 text-center">
        Что-то пошло не так…
      </p>
      <p className="mt-3 text-[13px] sm:text-[14px] text-white/50 text-center max-w-md">
        {isCatalogError
          ? "Сервис каталога временно недоступен. Попробуйте обновить страницу."
          : "Попробуйте обновить страницу или вернуться на главную."}
      </p>
      <div className="mt-8 flex gap-4">
        <button
          onClick={reset}
          className="h-12 px-6 rounded-full border border-white/10 bg-white/[0.04] text-[11px] uppercase tracking-[0.2em] text-white/80 hover:border-white/20 hover:bg-white/[0.08] transition-colors"
        >
          Повторить
        </button>
        <Link
          href="/"
          className="h-12 px-6 rounded-full border border-white/10 bg-white/[0.04] text-[11px] uppercase tracking-[0.2em] text-white/80 hover:border-white/20 hover:bg-white/[0.08] transition-colors flex items-center justify-center"
        >
          На главную
        </Link>
      </div>
    </div>
  );
}
