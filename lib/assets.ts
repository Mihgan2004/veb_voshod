/**
 * Единый маппинг всех локальных ассетов из /public.
 * Источник правды для путей — если файл переименован,
 * обновляем ТОЛЬКО здесь.
 *
 * После замены файлов в public/lookbook/ увеличь LOOKBOOK_VERSION,
 * иначе Cache-Control: immutable отдаёт старые кадры.
 */
const LOOKBOOK_VERSION = "2";

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
    backgroundVertical: "/text-parallax/background-calligraphy-vertical.webp",
    icons: {
      tacticalMerch: "/text-parallax/icons/tactical-merch.png",
      rassvet: "/text-parallax/icons/rassvet.png",
      solnechnogorsk: "/text-parallax/icons/solnechnogorsk.png",
    },
  },
  rassvet: {
    graffitiNadpis: "/images/rassvet/graffiti-nadpis-transparent.webp",
  },
  lookbook: [
    `/lookbook/lookbook-01.avif?v=${LOOKBOOK_VERSION}`,
    `/lookbook/lookbook-02.avif?v=${LOOKBOOK_VERSION}`,
    `/lookbook/lookbook-03.avif?v=${LOOKBOOK_VERSION}`,
    `/lookbook/lookbook-04.avif?v=${LOOKBOOK_VERSION}`,
    `/lookbook/lookbook-05.avif?v=${LOOKBOOK_VERSION}`,
    `/lookbook/lookbook-06.avif?v=${LOOKBOOK_VERSION}`,
    `/lookbook/lookbook-07.avif?v=${LOOKBOOK_VERSION}`,
    `/lookbook/lookbook-08.avif?v=${LOOKBOOK_VERSION}`,
    `/lookbook/lookbook-09.avif?v=${LOOKBOOK_VERSION}`,
  ],
} as const;
