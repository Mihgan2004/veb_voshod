export function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

export function lerp(start: number, end: number, t: number) {
  return start + (end - start) * t;
}

export function coverPlaneSize(
  viewportWidth: number,
  viewportHeight: number,
  imageAspect: number,
  overscan = 1.04,
) {
  let coverWidth = viewportWidth * overscan;
  let coverHeight = coverWidth / imageAspect;

  if (coverHeight < viewportHeight * overscan) {
    coverHeight = viewportHeight * overscan;
    coverWidth = coverHeight * imageAspect;
  }

  return { coverWidth, coverHeight };
}
