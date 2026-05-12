/**
 * Единые этапы scroll-driven последовательности Земля → HUD → Солнечногорск.
 *
 * Прогресс p ∈ [0,1]: начало секции (верх секции во viewport-top) … конец
 * (низ секции во viewport-bottom). См. offset ["start start", "end end"].
 */

export const SECTION_SCROLL_HEIGHT_DESKTOP_VH = 520;
export const SECTION_SCROLL_HEIGHT_MOBILE_VH = 560;

export const MAP_ASSETS = {
  russia: "/voshod-map/contours/01-russia-outline.svg",
  russiaMarked: "/voshod-map/contours/02-russia-with-moscow-oblast-marker.svg",
  moscowOblast: "/voshod-map/contours/03-moscow-oblast-outline.svg",
  moscowMarked: "/voshod-map/contours/04-moscow-oblast-with-solnechnogorsk-marker.svg",
  solnechnogorsk: "/voshod-map/contours/05-solnechnogorsk-outline.svg",
} as const;

/** Номинальные фазы документа (дев-отладка и комментарии). */
export const STORYBOARD_HINTS = {
  earthIntroHero: [0.0, 0.16] as const,
  earthSpinFadeText: [0.16, 0.34] as const,
  approachRussiaBg: [0.34, 0.48] as const,
  russiaHud: [0.44, 0.62] as const,
  toMoscowHud: [0.62, 0.76] as const,
  toSolHud: [0.76, 0.88] as const,
  outlineCallout: [0.88, 0.96] as const,
  finalCta: [0.94, 1.0] as const,
};

export function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return value < 0 ? 0 : value > 1 ? 1 : value;
}

export function smoothstep(edge0: number, edge1: number, value: number): number {
  const x = clamp01((value - edge0) / (edge1 - edge0));
  return x * x * (3 - 2 * x);
}

export function phaseProgress(progress: number, start: number, end: number): number {
  return clamp01((progress - start) / (end - start));
}

export function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

/* ------------------------------------------------------------------ *
 *  Earth — вращение (Euler) по ТЗ пользователя + появление/затухание.
 * ------------------------------------------------------------------ */

export function earthIntroFadeProgress(p: number): number {
  return smoothstep(0, 0.16, p);
}

/** rotateP как в постановке задачи — сглаженный вклад основного yaw. */
export function earthYawDriveProgress(p: number): number {
  return smoothstep(0.05, 0.48, p);
}

export function getEarthTargetRotationEuler(p: number): { x: number; y: number } {
  const t = earthYawDriveProgress(p);
  return {
    y: -0.7 + t * Math.PI * 1.45,
    x: 0.16 - t * 0.05,
  };
}

/** «Киношный» набег камеры до HUD: усилитель масштаба + Z. */
export function earthPrepZoomT(p: number): number {
  return smoothstep(0.34, 0.48, p);
}

/**
 * Основное умножение видимости глобуса:
 * после 0.45 затемняем под HUD, не режем резко до 0.
 */
export function earthVisibilityMultiplier(p: number): number {
  if (p <= 0.45) return 1;
  if (p <= 0.62) return lerp(1, 0.25, smoothstep(0.45, 0.62, p));
  return 0.15;
}

/** Итоговая opacity глобуса (слои + затемняющее полотно ниже HUD). */
export function earthCombinedOpacity(p: number): number {
  return clamp01(earthIntroFadeProgress(p) * earthVisibilityMultiplier(p));
}

/* ------------------------------------------------------------------ *
 *  HUD: Россия → МО → Солнечногорск (чистые функции под useTransform).
 * ------------------------------------------------------------------ */

/** Фон между глобусом и HUD: мягкая «ватная» недосветленность. */
export function hudBackdropOpacity(p: number): number {
  return lerp(0, 0.55, smoothstep(0.42, 0.58, p));
}

/** Россия входит как «летящая» HUD-карта. */
export function russiaHudOpacity(p: number): number {
  return smoothstep(0.44, 0.52, p);
}

export function russiaHudScaleEnter(p: number): number {
  return lerp(0.72, 1.0, smoothstep(0.44, 0.58, p));
}

export function russiaHudTranslateYFrac(p: number): number {
  return lerp(1, 0, smoothstep(0.44, 0.58, p)); /* множитель к +8vh */
}

export function russiaHudBlurPx(p: number): number {
  return lerp(8, 0, smoothstep(0.44, 0.58, p));
}

export function russiaMoscowDotOpacity(p: number): number {
  return smoothstep(0.56, 0.64, p);
}

/** Отъезд «камеры» от карты России к МО: overscale + сдвиг + crossfade. */
export function russiaExitPhaseT(p: number): number {
  return smoothstep(0.62, 0.76, p);
}

export function russiaExitScale(p: number): number {
  const t = russiaExitPhaseT(p);
  return lerp(1, 2.6, t);
}

export function russiaExitTranslateXMul(p: number): number {
  return lerp(0, 1, russiaExitPhaseT(p)); /* на -18vw */
}

export function russiaExitTranslateYMul(p: number): number {
  return lerp(0, 1, russiaExitPhaseT(p)); /* на +8vh */
}

export function russiaExitOpacity(p: number): number {
  return lerp(1, 0.18, russiaExitPhaseT(p));
}

/** Московская область наезжает поверх. */
export function moscowHudOpacity(p: number): number {
  return smoothstep(0.66, 0.76, p);
}

export function moscowHudScaleEnter(p: number): number {
  return lerp(0.42, 1.0, smoothstep(0.66, 0.76, p));
}

export function moscowHudTranslateYFrac(p: number): number {
  return lerp(1, 0, smoothstep(0.66, 0.76, p)); /* старт +5vh */
}

export function moscowExitPhaseT(p: number): number {
  return smoothstep(0.76, 0.88, p);
}

export function moscowExitScale(p: number): number {
  return lerp(1, 2.3, moscowExitPhaseT(p));
}

export function moscowExitTranslateXMul(p: number): number {
  return lerp(0, 1, moscowExitPhaseT(p)); /* к маркеру Солнечногорска */
}

export function moscowExitTranslateYMul(p: number): number {
  return lerp(0, 0.8, moscowExitPhaseT(p));
}

export function moscowExitOpacity(p: number): number {
  return lerp(1, 0.2, moscowExitPhaseT(p));
}

/** Локальный контур Солнечногорска. */
export function solHudOpacity(p: number): number {
  return smoothstep(0.8, 0.88, p);
}

export function solHudScaleEnter(p: number): number {
  return lerp(0.48, 1.0, smoothstep(0.8, 0.88, p));
}

export function solHudTranslateYFrac(p: number): number {
  return lerp(1, 0, smoothstep(0.8, 0.88, p));
}

/** Точка + линия выноски. */
export function calloutDrawProgress(p: number): number {
  return smoothstep(0.88, 0.96, p);
}

export function calloutLineScaleY(p: number): number {
  return calloutDrawProgress(p);
}

export function calloutTextOpacity(p: number): number {
  return smoothstep(0.9, 0.97, p);
}

export function ctaOpacity(p: number): number {
  return smoothstep(0.94, 1.0, p);
}

export function ctaTranslateY(p: number): number {
  return lerp(18, 0, smoothstep(0.94, 1.0, p));
}

/** Текст героя (0–0.34 снятие). */
export function heroTitleOpacity(p: number): number {
  return 1 - smoothstep(0.16, 0.34, p);
}
