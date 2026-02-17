import type React from "react";

/**
 * PageShell — единый контейнер для страниц.
 * Обеспечивает одинаковые поля, верхний отступ под pill-nav
 * и нижний отступ для плавающих элементов (кнопка N, stamp и т.д.).
 */
export function PageShell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 pt-24 sm:pt-28 md:pt-32 pb-24 md:pb-32 ${className}`}
    >
      {children}
    </div>
  );
}
