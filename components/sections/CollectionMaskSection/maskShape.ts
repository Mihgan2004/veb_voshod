/** vh на один шаг (интро + каждая коллекция). Больше = медленнее анимация */
export const COLLECTION_SCROLL_VH_PER_STEP = 150;

const CX = 50;
const CY = 50;

/** Контрольные точки базовой формы (viewBox 0 0 100 100) */
const MASK_SEGMENTS: readonly (readonly [number, number])[] = [
  [50, 0],
  [50, 42],
  [58, 50],
  [100, 50],
  [58, 50],
  [50, 58],
  [50, 100],
  [50, 58],
  [42, 50],
  [0, 50],
  [42, 50],
  [50, 42],
  [50, 0],
];

function scalePoint(x: number, y: number, scale: number) {
  return {
    x: CX + (x - CX) * scale,
    y: CY + (y - CY) * scale,
  };
}

function point(x: number, y: number, scale: number) {
  const p = scalePoint(x, y, scale);
  return `${p.x} ${p.y}`;
}

/** Полное перекрытие viewBox */
export const FULL_MASK_PATH = "M0 0 H100 V100 H0 Z";

/** Доля скролла-сегмента, на которой ромб дорастает до максимума */
export const COLLECTION_SHAPE_REVEAL_END = 0.72;

/** Масштаб ромба на пике анимации формы */
export const COLLECTION_MASK_MAX_SCALE = 3.2;

/** Ромб с вогнутыми сторонами, масштаб от центра */
export function getMaskPathAtScale(scale: number): string {
  const s = Math.max(scale, 0.0001);
  const [m, c1, c2, c3, c4, c5, c6, c7, c8, c9, c10, c11, c12] = MASK_SEGMENTS;

  return [
    `M${point(m[0], m[1], s)}`,
    `C${point(c1[0], c1[1], s)} ${point(c2[0], c2[1], s)} ${point(c3[0], c3[1], s)}`,
    `C${point(c4[0], c4[1], s)} ${point(c5[0], c5[1], s)} ${point(c6[0], c6[1], s)}`,
    `C${point(c7[0], c7[1], s)} ${point(c8[0], c8[1], s)} ${point(c9[0], c9[1], s)}`,
    `C${point(c10[0], c10[1], s)} ${point(c11[0], c11[1], s)} ${point(c12[0], c12[1], s)}`,
    "Z",
  ].join(" ");
}

export function getMaskPathForProgress(progress: number): string {
  if (progress >= COLLECTION_SHAPE_REVEAL_END) {
    return FULL_MASK_PATH;
  }

  const shapeProgress = progress / COLLECTION_SHAPE_REVEAL_END;
  return getMaskPathAtScale(shapeProgress * COLLECTION_MASK_MAX_SCALE);
}

export function getImageSizeForProgress(progress: number): number {
  if (progress >= COLLECTION_SHAPE_REVEAL_END) {
    return 100;
  }

  const shapeProgress = progress / COLLECTION_SHAPE_REVEAL_END;
  return 135 + (100 - 135) * shapeProgress;
}
