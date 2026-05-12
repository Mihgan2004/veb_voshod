"use client";

import type { ReactNode } from "react";

/**
 * SmoothScrollProvider
 *
 * В проекте уже есть глобальный Lenis через `components/providers/LenisProvider.tsx`
 * (подключен в `app/layout.tsx`). Чтобы не плодить второй raf-loop и не ломать
 * глобальный smooth-scroll, локальный provider секции — это pass-through.
 *
 * Если когда-нибудь глобальный Lenis уберут, тут можно поднять локальный
 * экземпляр по образцу Olivier Larose:
 *
 *   useEffect(() => {
 *     const lenis = new Lenis();
 *     let raf = 0;
 *     const tick = (t: number) => { lenis.raf(t); raf = requestAnimationFrame(tick); };
 *     raf = requestAnimationFrame(tick);
 *     return () => { cancelAnimationFrame(raf); lenis.destroy(); };
 *   }, []);
 */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
