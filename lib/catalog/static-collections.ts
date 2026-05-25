import type { Collection } from "./types";

/**
 * Статичный список коллекций — без Directus.
 * Источник правды для витрины коллекций.
 *
 * После замены файлов в public/HighlightsCollections/ увеличь COVER_VERSION,
 * иначе next/image и браузер могут показывать старые обложки.
 */
const COVER_VERSION = "3";
const MOBILE_COVER_VERSION = "1";

export const STATIC_COLLECTIONS: Collection[] = [
  {
    id: "col-1",
    slug: "solnce-pomozhet-nam",
    name: "Солнце поможет нам",
    tag: "DROP",
    label: "Коллекция №1",
    coverImage: `/HighlightsCollections/1.avif?v=${COVER_VERSION}`,
    mobileCoverImage: `/HighlightsCollections/mobile/solnce-pomozhet-nam.png?v=${MOBILE_COVER_VERSION}`,
    isFeatured: true,
    sort: 1,
  },
  {
    id: "col-2",
    slug: "veruy",
    name: "Веруй.",
    tag: "DROP",
    label: "Коллекция №2",
    coverImage: `/HighlightsCollections/2.avif?v=${COVER_VERSION}`,
    mobileCoverImage: `/HighlightsCollections/mobile/veruy.png?v=${MOBILE_COVER_VERSION}`,
    isFeatured: true,
    sort: 2,
  },
  {
    id: "col-3",
    slug: "iz-pod-zemli",
    name: "Из под земли",
    tag: "DROP",
    label: "Коллекция №3",
    coverImage: `/HighlightsCollections/3.avif?v=${COVER_VERSION}`,
    mobileCoverImage: `/HighlightsCollections/mobile/iz-pod-zemli.png?v=${MOBILE_COVER_VERSION}`,
    isFeatured: true,
    sort: 3,
  },
];

/** Уже сжатые AVIF — не гонять через next/image optimizer (sharp/HEIF → null, лаги). */
export function isPrecompressedCoverImage(src: string): boolean {
  return /\.avif(\?|$)/i.test(src);
}

export function getCollectionCoverImage(
  collection: Collection,
  isMobile: boolean,
): string {
  if (isMobile && collection.mobileCoverImage) {
    return collection.mobileCoverImage;
  }
  return collection.coverImage ?? "/globe.svg";
}

export function getStaticCollectionBySlug(slug: string): Collection | null {
  return STATIC_COLLECTIONS.find((c) => c.slug === slug) ?? null;
}
