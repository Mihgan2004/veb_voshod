"use client";

import type { Collection } from "@/lib/catalog";
import { CollectionMaskSection } from "@/components/sections/CollectionMaskSection/CollectionMaskSection";

export function HighlightsCollections({
  collections,
}: {
  collections: Collection[];
}) {
  return <CollectionMaskSection collections={collections} />;
}
