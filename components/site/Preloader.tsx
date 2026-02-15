"use client";

import { useEffect, useState } from "react";

const MIN_DURATION_MS = 2000;
const SKIP_KEY = "voshod-preloader-seen";

export function Preloader() {
  const [visible, setVisible] = useState(true);
  const [phase, setPhase] = useState<"show" | "hide">("show");

  useEffect(() => {
    const skip = typeof window !== "undefined" && sessionStorage.getItem(SKIP_KEY);
    if (skip) {
      setVisible(false);
      return;
    }

    const start = Date.now();

    const finish = () => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, MIN_DURATION_MS - elapsed);
      setTimeout(() => {
        setPhase("hide");
        setTimeout(() => {
          setVisible(false);
          sessionStorage.setItem(SKIP_KEY, "1");
        }, 400);
      }, remaining);
    };

    if (document.readyState === "complete") {
      finish();
    } else {
      window.addEventListener("load", finish);
      return () => window.removeEventListener("load", finish);
    }
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-[#0B0D10] transition-opacity duration-500 ease-out ${
        phase === "hide" ? "opacity-0" : "opacity-100"
      }`}
      style={{ pointerEvents: visible ? "auto" : "none" }}
      aria-hidden
    >
      <div className="preloader-icon relative w-24 h-24 sm:w-28 sm:h-28">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          fill="none"
          aria-hidden
        >
          <defs>
            <linearGradient id="preloader-fill" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#C6902E" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#C6902E" stopOpacity="0.95" />
            </linearGradient>
          </defs>

          {/* Полукруг: нижняя дуга (восход над горизонтом) — отрисовка контура */}
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            stroke="rgba(198,144,46,0.85)"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            strokeDasharray="126"
            strokeDashoffset="126"
            className="motion-safe:animate-preloader-stroke"
          />

          {/* Заливка полукруга — появляется после отрисовки, затем вспышка */}
          <path
            d="M 10 50 A 40 40 0 0 1 90 50 L 90 100 L 10 100 Z"
            fill="url(#preloader-fill)"
            className="motion-safe:animate-preloader-fill"
          />
        </svg>
      </div>
    </div>
  );
}
