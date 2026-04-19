"use client";

import { createContext, useContext, type RefObject } from "react";
import type Lenis from "lenis";

export const LenisReactContext = createContext<RefObject<Lenis | null> | null>(null);

export function useLenisRef(): RefObject<Lenis | null> | null {
  return useContext(LenisReactContext);
}
