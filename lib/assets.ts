/**
 * Единый маппинг всех локальных ассетов из /public.
 * Источник правды для путей — если файл переименован,
 * обновляем ТОЛЬКО здесь.
 */
export const ASSETS = {
  brand: {
    logoDesktop: "/brand/project-voshod_2x.webp",
    logoMobile: "/brand/project-voshod-mobile@2.png",
  },
  header: {
    logo: "/header/logo.png",
  },
  tee: {
    cutout: "/assets/tee/tee-cutout.png",
  },
  video: {
    heroDesktop720: "/video/hero-desktop-720.mp4",
    heroMobile540: "/video/hero-mobile-540.mp4",
    heroMobile1280: "/video/hero-mobile-1280.mp4",
  },
  textParallax: {
    background: "/text-parallax/background-calligraphy.png",
    icons: {
      tacticalMerch: "/text-parallax/icons/tactical-merch.png",
      rassvet: "/text-parallax/icons/rassvet.png",
      solnechnogorsk: "/text-parallax/icons/solnechnogorsk.png",
    },
  },
  lookbook: [
    "/lookbook/lookbook-01.avif",
    "/lookbook/lookbook-02.avif",
    "/lookbook/lookbook-03.avif",
    "/lookbook/lookbook-04.avif",
    "/lookbook/lookbook-05.avif",
    "/lookbook/lookbook-06.avif",
    "/lookbook/lookbook-07.avif",
    "/lookbook/lookbook-08.avif",
    "/lookbook/lookbook-09.avif",
  ],
} as const;
