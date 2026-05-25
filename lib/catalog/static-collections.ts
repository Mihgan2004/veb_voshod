import type { Collection } from "./types";

/**
 * Статичный список коллекций — без Directus.
 * Источник правды для витрины коллекций.
 *
 * После замены файлов в public/HighlightsCollections/ увеличь COVER_VERSION,
 * иначе next/image и браузер могут показывать старые обложки.
 */
const COVER_VERSION = "2";

export const STATIC_COLLECTIONS: Collection[] = [
  {
    id: "col-1",
    slug: "solnce-pomozhet-nam",
    name: "Солнце поможет нам",
    tag: "DROP",
    label: "Коллекция №1",
    coverImage: `/HighlightsCollections/1.avif?v=${COVER_VERSION}`,
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
    isFeatured: true,
    sort: 3,
  },
];

export function getStaticCollectionBySlug(slug: string): Collection | null {
  return STATIC_COLLECTIONS.find((c) => c.slug === slug) ?? null;
}
