"use client";

import type { Collection } from "@/lib/catalog";
import { PerspectiveSectionTransition } from "@/components/sections/PerspectiveSectionTransition/PerspectiveSectionTransition";

export function HighlightsCollections({
  collections,
}: {
  collections: Collection[];
}) {
  return <PerspectiveSectionTransition collections={collections} />;
}
