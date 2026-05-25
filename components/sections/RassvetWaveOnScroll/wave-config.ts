export type WaveSceneConfig = {
  initialWidthFactor: number;
  zoomSpeed: number;
};

export type WaveTier = "mobile" | "tablet" | "desktop";

export const WAVE_CONFIG_BY_TIER: Record<WaveTier, WaveSceneConfig> = {
  mobile: { initialWidthFactor: 0.78, zoomSpeed: 1.35 },
  tablet: { initialWidthFactor: 0.68, zoomSpeed: 1.25 },
  desktop: { initialWidthFactor: 0.48, zoomSpeed: 1.18 },
};

export const WAVE_CONFIG_REDUCED: WaveSceneConfig = {
  initialWidthFactor: 0.85,
  zoomSpeed: 1,
};

export function getWaveTierFromWidth(width: number): WaveTier {
  if (width <= 768) return "mobile";
  if (width <= 1023) return "tablet";
  return "desktop";
}
