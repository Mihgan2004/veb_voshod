"use client";

import React, { type CSSProperties, useEffect, useState } from "react";
import Link from "next/link";
import type { MotionValue } from "framer-motion";

import styles from "./earth-scroll-section.module.css";
import { phaseSmooth, phaseVisibility } from "./phases";
import {
  MOSCOW_OBLAST_PATH,
  MOSCOW_OBLAST_VIEWBOX,
  SOLNECHNOGORSK_POINT,
} from "./geo";

/**
 * PhaseOverlays
 *
 * HTML/SVG-слой поверх 3D-Canvas. По сторибоарду:
 *
 *   1. «Hero»    (0.00–0.25) — «ДОБРО ПОЖАЛОВАТЬ / ВОСХОД» + scroll cue.
 *   2. «Globe»   (0.25–0.50) — пусто, Земля «дышит».
 *   3. «Russia»  (0.50–0.75) — пусто (камера подлетает), оверлей-меток нет
 *                              — Россия видна на самой Земле.
 *   4. «Moscow»  (0.75–1.00) — контур Московской области + маркер
 *                              «город Солнечногорск» с leader line + CTA.
 *
 * Все панели всегда смонтированы; opacity управляется
 * `phaseVisibility(scrollYProgress)`, и каждая едет на ±18-24px по Y
 * (паралакс-вход/выход).
 *
 * Все КРИТИЧНЫЕ layout-свойства продублированы инлайн — страховка от
 * случая, когда CSS-модуль не догрузился (Turbopack lightning-css
 * жёстко относится к нестандартным CSS-фичам).
 */
export function PhaseOverlays({
  scrollYProgress,
}: {
  scrollYProgress: MotionValue<number>;
}) {
  const [p, setP] = useState(() => scrollYProgress.get());

  useEffect(() => {
    const unsub = scrollYProgress.on("change", (v) => setP(v));
    return () => unsub();
  }, [scrollYProgress]);

  const heroVis = phaseVisibility(p, "hero", 0.05);
  const moscowVis = phaseVisibility(p, "moscow", 0.05);

  /* Plant moscowPhase smoothly: контур и кнопка вылезают НЕ в самом
   * начале последней четверти, а чуть позже, после того как камера уже
   * долетела. */
  const moscowPhase = phaseSmooth(p, "moscow");
  const moOutlineVis = clamp01((moscowPhase - 0.15) / 0.5);
  const ctaVis = clamp01((moscowPhase - 0.55) / 0.4);

  const heroShift = (1 - heroVis) * 18;

  const overlayRoot: CSSProperties = {
    position: "absolute",
    inset: 0,
    zIndex: 2,
    pointerEvents: "none",
    color: "#fff",
  };

  const panelCenter: CSSProperties = {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "24px",
    transition: "opacity 0.18s ease-out",
  };

  return (
    <div className={styles.overlayRoot} style={overlayRoot}>
      {/* ---------- PHASE 1: HERO — текст внизу, как в референсе ---------- */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: "9vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "18px",
          opacity: heroVis,
          transform: `translate3d(0, ${heroShift}px, 0)`,
        }}
      >
        <div className={styles.heroEyebrow}>Добро пожаловать</div>
        <div className={styles.heroTitle}>ВОСХОД</div>
        <div className={styles.scrollCue}>
          <span className={styles.scrollCueLabel}>прокрутите вниз</span>
          <span className={styles.scrollCueLine} />
        </div>
      </div>

      {/* ---------- PHASE 4: MO outline + Solnechnogorsk + CTA ---------- */}
      <div
        style={{
          ...panelCenter,
          opacity: moscowVis,
          gap: "20px",
        }}
      >
        {/* SVG-композиция с контуром МО и маркером Солнечногорска.
            Появляется и слегка увеличивается с phaseMoscow. */}
        <div
          style={{
            position: "relative",
            width: "min(70vw, 720px)",
            maxHeight: "62vh",
            opacity: moOutlineVis,
            transform: `scale(${0.92 + moOutlineVis * 0.08})`,
            transition: "transform 0.18s ease-out",
          }}
        >
          <MoscowOblastSVG />
        </div>

        {/* CTA — появляется в самом конце phase 4. */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: "10vh",
            transform: `translate(-50%, ${(1 - ctaVis) * 14}px)`,
            opacity: ctaVis,
            transition: "transform 0.2s ease-out, opacity 0.2s ease-out",
          }}
        >
          <Link href="/catalog" className={styles.cta}>
            ПЕРЕЙТИ В КАТАЛОГ
            <span className={styles.ctaArrow} aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  SVG Московской области с маркером Солнечногорска
 * ------------------------------------------------------------------ */
function MoscowOblastSVG() {
  const cx = SOLNECHNOGORSK_POINT.x;
  const cy = SOLNECHNOGORSK_POINT.y;
  return (
    <svg
      viewBox={MOSCOW_OBLAST_VIEWBOX}
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "auto", display: "block" }}
      aria-hidden
    >
      <defs>
        <linearGradient id="moStroke" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#cfe6ff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#5aa6ff" stopOpacity="0.85" />
        </linearGradient>
      </defs>

      {/* мягкая внутренняя заливка */}
      <path
        d={MOSCOW_OBLAST_PATH}
        fill="rgba(110, 170, 255, 0.06)"
        stroke="rgba(154, 216, 255, 0.18)"
        strokeWidth={1.4}
      />

      {/* основная неоновая обводка */}
      <path
        className={styles.outlineGlow}
        d={MOSCOW_OBLAST_PATH}
        fill="none"
        stroke="url(#moStroke)"
        strokeWidth={2.2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* leader-line к подписи (вверх-вправо) */}
      <line
        x1={cx}
        y1={cy}
        x2={cx + 80}
        y2={cy - 70}
        stroke="rgba(220, 235, 255, 0.7)"
        strokeWidth={1.2}
      />
      <line
        x1={cx + 80}
        y1={cy - 70}
        x2={cx + 180}
        y2={cy - 70}
        stroke="rgba(220, 235, 255, 0.7)"
        strokeWidth={1.2}
      />

      {/* плашка с подписью «город Солнечногорск» */}
      <g transform={`translate(${cx + 100}, ${cy - 92})`}>
        <rect
          x={0}
          y={0}
          width={196}
          height={32}
          rx={4}
          fill="rgba(8, 14, 28, 0.6)"
          stroke="rgba(154, 216, 255, 0.5)"
          strokeWidth={1}
        />
        <text
          x={98}
          y={21}
          textAnchor="middle"
          fill="rgba(230, 240, 255, 0.95)"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          fontSize={12}
          letterSpacing="1.4"
        >
          город Солнечногорск
        </text>
      </g>

      {/* пульсирующий круг */}
      <circle
        className={styles.svgPulse}
        cx={cx}
        cy={cy}
        r={14}
        fill="none"
        stroke="rgba(154, 216, 255, 0.7)"
        strokeWidth={1.4}
      />
      {/* ядро маркера */}
      <circle cx={cx} cy={cy} r={4.5} fill="#ffffff" />
      <circle
        cx={cx}
        cy={cy}
        r={4.5}
        fill="none"
        stroke="rgba(154, 216, 255, 0.85)"
        strokeWidth={1.4}
      />
    </svg>
  );
}

function clamp01(v: number) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}
