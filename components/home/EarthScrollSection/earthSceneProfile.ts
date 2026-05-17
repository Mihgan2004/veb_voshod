export type EarthSceneProfile = {
  isMobile: boolean;
  dpr: number;
  segments: number;
  enableRim: boolean;
  antialias: boolean;
  earthScale: number;
  earthY: number;
  cameraZ: number;
  fov: number;
  toneMapping: boolean;
  starCount: number;
  scrollSpanVh: number;
};

export function getEarthSceneProfile(): EarthSceneProfile {
  if (typeof window === "undefined") {
    return {
      isMobile: false,
      dpr: 1.5,
      segments: 48,
      enableRim: true,
      antialias: true,
      earthScale: 1.55,
      earthY: -0.06,
      cameraZ: 6.1,
      fov: 46,
      toneMapping: true,
      starCount: 900,
      scrollSpanVh: 480,
    };
  }

  const isMobile = window.innerWidth <= 768;

  if (isMobile) {
    return {
      isMobile: true,
      dpr: 1,
      segments: 32,
      enableRim: false,
      antialias: false,
      earthScale: 1.42,
      earthY: -0.04,
      cameraZ: 6.4,
      fov: 50,
      toneMapping: false,
      starCount: 380,
      scrollSpanVh: 300,
    };
  }

  return {
    isMobile: false,
    dpr: Math.min(window.devicePixelRatio || 1, 1.75),
    segments: 48,
    enableRim: true,
    antialias: true,
    earthScale: 1.55,
    earthY: -0.06,
    cameraZ: 6.1,
    fov: 46,
    toneMapping: true,
    starCount: 900,
    scrollSpanVh: 480,
  };
}
