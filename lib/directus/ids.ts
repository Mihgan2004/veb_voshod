/** Primary key / M2O id as stored in Directus (integer or UUID string). */
export type DirectusId = string | number;

/**
 * Coerce a value to a Directus relation id without corrupting UUIDs via Number().
 */
export function toDirectusRelationId(id: unknown): DirectusId | null {
  if (id == null || id === "") return null;
  if (typeof id === "number" && Number.isFinite(id)) return id;
  if (typeof id === "string") {
    const t = id.trim();
    if (!t) return null;
    if (/^\d+$/.test(t)) {
      const n = Number(t);
      return Number.isSafeInteger(n) ? n : t;
    }
    return t;
  }
  if (typeof id === "object" && id && "id" in id) {
    return toDirectusRelationId((id as { id: unknown }).id);
  }
  return null;
}

export function directusIdToString(id: DirectusId): string {
  return String(id);
}
