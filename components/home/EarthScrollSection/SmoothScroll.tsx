"use client";

import type { ReactNode } from "react";

/**
 * В оригинале Olivier Larose здесь создаётся экземпляр Lenis и `window.scrollTo(0, 0)`.
 * В проекте veb_voshod плавный скролл уже подключён глобально (`LenisProvider` в `app/layout.tsx`).
 * Второй Lenis ломает поведение сайта и смещает пользователя при загрузке — оставляем только обёртку.
 */
export default function SmoothScroll({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
