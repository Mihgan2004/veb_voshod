/*
 * Storyboard EarthScrollSection: 4 фазы скролла.
 *
 *   PHASE 1 (0.00 .. 0.25) — «Hero»  — Земля видна полумесяцем слева,
 *                                       камера далеко, текст
 *                                       «Добро пожаловать / ВОСХОД».
 *   PHASE 2 (0.25 .. 0.50) — «Globe» — Земля по центру, Россия
 *                                       выходит к камере, идёт оборот.
 *   PHASE 3 (0.50 .. 0.75) — «Russia»— Камера приближается, Россия
 *                                       во весь экран, прямая проекция
 *                                       границ и точка Москвы.
 *   PHASE 4 (0.75 .. 1.00) — «Moscow Oblast»
 *                                     — Очень близко, выделена МО,
 *                                       подпись «город Солнечногорск»
 *                                       и CTA «Перейти в каталог».
 *
 * Здесь — только математика прогресса по фазам, чтобы и Canvas
 * (анимация камеры / Земли), и HTML-оверлеи могли получать одни и
 * те же значения и идеально совпадать.
 */

export type PhaseKey = "hero" | "globe" | "russia" | "moscow";

export const PHASE_RANGES: Record<PhaseKey, [number, number]> = {
  hero: [0.0, 0.25],
  globe: [0.25, 0.5],
  russia: [0.5, 0.75],
  moscow: [0.75, 1.0],
};

export function clamp01(v: number): number {
  if (!Number.isFinite(v)) return 0;
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/**
 * Прогресс внутри одной фазы (0..1), линейно. Если общий
 * прогресс ниже фазы — возвращает 0, если выше — 1.
 */
export function phaseProgress(global: number, phase: PhaseKey): number {
  const [a, b] = PHASE_RANGES[phase];
  return clamp01((global - a) / (b - a));
}

/**
 * Smoothstep-progress внутри одной фазы — для плавных fade-in/out
 * без резких краёв.
 */
export function phaseSmooth(global: number, phase: PhaseKey): number {
  const [a, b] = PHASE_RANGES[phase];
  return smoothstep(a, b, global);
}

/**
 * "Visibility" фазы: 0 пока не дошли, плавно поднимается к 1 в начале
 * фазы, держится, плавно опускается к 0 в конце. Удобно для
 * fade-in/out оверлеев.
 */
export function phaseVisibility(global: number, phase: PhaseKey, fade = 0.05): number {
  const [a, b] = PHASE_RANGES[phase];
  const inFade = smoothstep(a - fade, a + fade, global);
  const outFade = 1 - smoothstep(b - fade, b + fade, global);
  return clamp01(inFade * outFade);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/* ------------------------------------------------------------------ *
 *  Геокоординаты, нужные сцене.
 * ------------------------------------------------------------------ */

export const MOSCOW_LAT = 55.7558;
export const MOSCOW_LON = 37.6173;

export const SOLNECHNOGORSK_LAT = 56.1842;
export const SOLNECHNOGORSK_LON = 36.9787;

/**
 * Преобразование (lat, lon) → LOCAL-координаты на THREE.js SphereGeometry
 * с phiStart = Math.PI (сфера сдвинута на 180° под NASA Blue Marble).
 *
 * NASA day.jpg / night.jpg — антимеридиан-центрированная equirectangular:
 *   U=0   → 180°W  U=0.5 → 0°E  U=0.75 → 90°E (Россия)
 *
 * С phiStart=π: phi_geometry = π + u·2π = π + (lon+180°)·π/180
 * Раскрывая через -cos(π+α)=cosα, sin(π+α)=-sinα:
 *   x =  cos(phi_adj) · cos(lat)
 *   y =  sin(lat)
 *   z = -sin(phi_adj) · cos(lat)
 * где phi_adj = (lon + 180°) в радианах.
 *
 * Проверка: lon=90°E → phi_adj=270° → x=0, z=-sin(270°)=1 → смотрит в +Z ✓
 */
export function latLonToVec3(
  latDeg: number,
  lonDeg: number,
  radius = 1,
): [number, number, number] {
  const lat = (latDeg * Math.PI) / 180;
  const phi = ((lonDeg + 180) * Math.PI) / 180;
  const x = radius * Math.cos(phi) * Math.cos(lat);
  const y = radius * Math.sin(lat);
  const z = -radius * Math.sin(phi) * Math.cos(lat);
  return [x, y, z];
}
