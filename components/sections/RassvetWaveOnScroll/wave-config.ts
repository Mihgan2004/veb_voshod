import { ASSETS } from "@/lib/assets";

export const WAVE_IMAGE = ASSETS.lookbook[0];

export type WaveViewportTier = "mobile" | "tablet" | "desktop";

export type WaveSceneConfig = {
  initialWidthFactor: number;
  amplitude: number;
  amplitudeEnd: number;
  waveLength: number;
  segments: [number, number];
  timeSpeed: number;
  coverOverscan: number;
};

export const WAVE_CONFIG_MOBILE: WaveSceneConfig = {
  initialWidthFactor: 0.8,
  amplitude: 0.16,
  amplitudeEnd: 0,
  waveLength: 6,
  segments: [48, 48],
  timeSpeed: 0.03,
  coverOverscan: 1.04,
};

export const WAVE_CONFIG_TABLET: WaveSceneConfig = {
  initialWidthFactor: 0.62,
  amplitude: 0.18,
  amplitudeEnd: 0.02,
  waveLength: 5.75,
  segments: [56, 56],
  timeSpeed: 0.035,
  coverOverscan: 1.04,
};

export const WAVE_CONFIG_DESKTOP: WaveSceneConfig = {
  initialWidthFactor: 0.45,
  amplitude: 0.22,
  amplitudeEnd: 0,
  waveLength: 5.5,
  segments: [64, 64],
  timeSpeed: 0.04,
  coverOverscan: 1.04,
};

export const WAVE_CONFIG_BY_TIER: Record<WaveViewportTier, WaveSceneConfig> = {
  mobile: WAVE_CONFIG_MOBILE,
  tablet: WAVE_CONFIG_TABLET,
  desktop: WAVE_CONFIG_DESKTOP,
};

export const WAVE_CONFIG_REDUCED: Pick<
  WaveSceneConfig,
  "amplitude" | "waveLength" | "timeSpeed" | "amplitudeEnd"
> = {
  amplitude: 0.04,
  amplitudeEnd: 0.01,
  waveLength: 4,
  timeSpeed: 0.01,
};
