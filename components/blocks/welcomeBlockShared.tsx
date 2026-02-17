"use client";

import React, { useEffect, useState } from "react";
import { Russo_One } from "next/font/google";

export const russoOne = Russo_One({
  weight: "400",
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-welcome",
});

export const WELCOME_TEXT = "ДОБРО\nПОЖАЛОВАТЬ";
const TYPEWRITER_MS = 65;

export function WelcomeTypewriter({ disabled }: { disabled: boolean }) {
  const [visible, setVisible] = useState(0);
  const [done, setDone] = useState(false);
  const fullLen = WELCOME_TEXT.length;

  useEffect(() => {
    if (disabled) {
      setVisible(fullLen);
      setDone(true);
      return;
    }
    if (visible >= fullLen) {
      setDone(true);
      return;
    }
    const t = setTimeout(() => setVisible((v) => v + 1), TYPEWRITER_MS);
    return () => clearTimeout(t);
  }, [visible, disabled, fullLen]);

  if (disabled) return <>{WELCOME_TEXT}</>;

  const display = WELCOME_TEXT.slice(0, visible);
  return (
    <>
      {display}
      {!done && (
        <span
          className="inline-block w-[3px] h-[0.9em] bg-white/50 ml-0.5 align-middle animate-pulse"
          aria-hidden
        />
      )}
    </>
  );
}
