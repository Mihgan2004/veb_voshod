/** Прогресс 0…1 внутри секции Earth (useScroll offset start/end). */
export function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}

export function smoothstep01(v: number): number {
  const x = clamp01(v);
  return x * x * (3 - 2 * x);
}

/** Дорисовка лого синхронно со скроллом секции */
export function logoDrawProgress(sectionProgress: number): number {
  return smoothstep01(sectionProgress);
}

/** Освещение: плавно с 8% скролла, полная яркость к 100% */
export function earthLightingProgress(sectionProgress: number): number {
  const shifted = clamp01((sectionProgress - 0.06) / 0.94);
  return smoothstep01(shifted);
}
