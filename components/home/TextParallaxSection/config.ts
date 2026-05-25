export type TextParallaxSlide = {
  src?: string;
  label: string;
  accent?: string;
  direction: "left" | "right";
  iconVariant?: "square" | "tall";
};

const ICON_VERSION = "3";

export const TEXT_PARALLAX_SLIDES: readonly TextParallaxSlide[] = [
  {
    src: `/text-parallax/icons/tactical-merch.png?v=${ICON_VERSION}`,
    label: "ТАКТИЧЕСКИЙ МЕРЧ",
    direction: "left",
    iconVariant: "square",
  },
  {
    src: `/text-parallax/icons/rassvet.png?v=${ICON_VERSION}`,
    label: "ПРОЕКТ РАССВЕТ",
    accent: "РАССВЕТ",
    direction: "right",
    iconVariant: "tall",
  },
  {
    label: "МОСКВА",
    direction: "left",
  },
] as const;
