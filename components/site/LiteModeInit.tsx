"use client";

import { useLiteMode } from "@/lib/useLiteMode";

/** Инициализирует data-lite на html для облегчённых стилей в слабых браузерах */
export function LiteModeInit() {
  useLiteMode();
  return null;
}
