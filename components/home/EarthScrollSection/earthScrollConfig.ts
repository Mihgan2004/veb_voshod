/** Диапазон основного вращения Земли — импортируйте напрямую в EarthMesh (устойчиво к HMR). */
export const EARTH_ROTATE_RANGE = [0.1, 0.52] as const;

/**
 * Диапазоны для EarthMesh / Three.js — те же числа, что в PHASE, но отдельными константами,
 * чтобы меш не импортировал объект PHASE (избегаем сломанных partial-HMR бандлов).
 */
export const EARTH_PHASE_CAMERA_DOLLY = [0.34, 0.52] as const;
export const EARTH_PHASE_EARTH_SETTLE = [0.52, 0.6] as const;
export const EARTH_PHASE_EARTH_FULL_ROTATE = [0.1, 0.34] as const;

/** Scroll-driven phases (0..1) for EarthScrollSection */
export const PHASE = {
  /** Тёмный космос → Земля выходит из темноты */
  bgEarthFade: [0.0, 0.1] as const,
  /** Земля целиком, мягкое вращение */
  earthFullRotate: EARTH_PHASE_EARTH_FULL_ROTATE,
  /**
   * Интервал основного вращения Земли по скроллу (до фазы замедления перед картой).
   * Совпадает с поддиапазоном earthFullRotate + cameraDolly в текущей хореографии.
   */
  earthRotate: EARTH_ROTATE_RANGE,
  /** Камера визуально приближается */
  cameraDolly: EARTH_PHASE_CAMERA_DOLLY,
  /** Замедление перед картой */
  earthSettle: EARTH_PHASE_EARTH_SETTLE,
  /** Затемнение 3D, HUD Россия (контур) */
  earthDimHudRussia: [0.6, 0.68] as const,
  /** Россия + маркер МО */
  russiaMarker: [0.68, 0.76] as const,
  /** Переход к контуру МО */
  moscowTransition: [0.76, 0.84] as const,
  /** МО + маркер Солнечногорска */
  moscowSolMarker: [0.84, 0.9] as const,
  /** Солнечногорск, выноска */
  solCallout: [0.9, 0.96] as const,
  /** Финал + CTA */
  finalCta: [0.96, 1.0] as const,
} as const;

export function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

/** Standard smoothstep 0..1 for x in [edge0, edge1] */
export function smoothstep(edge0: number, edge1: number, x: number) {
  if (!Number.isFinite(edge0) || !Number.isFinite(edge1) || !Number.isFinite(x)) return 0;
  if (edge1 === edge0) return x >= edge1 ? 1 : 0;
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

export function mapRange(value: number, inMin: number, inMax: number, outMin: number, outMax: number) {
  if (!Number.isFinite(value) || !Number.isFinite(inMin) || !Number.isFinite(inMax)) return outMin;
  if (inMax === inMin) return outMin;
  const t = clamp((value - inMin) / (inMax - inMin), 0, 1);
  return outMin + t * (outMax - outMin);
}

/** 0..1 progress within [start, end], clamped */
export function phaseProgress(progress: number, start: number, end: number) {
  if (end <= start) return 0;
  return clamp((progress - start) / (end - start), 0, 1);
}

/** @deprecated use phaseProgress + smoothstep at call site */
export function clamp01(v: number) {
  return clamp(v, 0, 1);
}

export function invLerp(a: number, b: number, v: number) {
  if (a === b) return 0;
  return clamp((v - a) / (b - a), 0, 1);
}

export function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** Eased 0..1 over [start, end] */
export function rangeT(progress: number, start: number, end: number, easing = easeInOutCubic) {
  const t = invLerp(start, end, progress);
  return easing ? easing(t) : t;
}
