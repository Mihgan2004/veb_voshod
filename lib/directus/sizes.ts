/**
 * Normalizes Products.sizes from Directus (JSON array, CSV string, or JSON string).
 */
export function normalizeProductSizes(raw: unknown): string[] {
  if (raw == null) return [];

  let value: unknown = raw;

  if (typeof value === "string") {
    const t = value.trim();
    if (!t) return [];
    if (t.startsWith("[") || t.startsWith("{")) {
      try {
        value = JSON.parse(t) as unknown;
      } catch {
        return t.split(/[,;|]/).map((s) => s.trim()).filter(Boolean);
      }
    } else {
      return t.split(/[,;|]/).map((s) => s.trim()).filter(Boolean);
    }
  }

  if (!Array.isArray(value)) return [];

  const out: string[] = [];
  for (const item of value) {
    if (typeof item === "string") {
      const s = item.trim();
      if (s) out.push(s);
      continue;
    }
    if (typeof item === "object" && item !== null) {
      const size =
        "size" in item && typeof (item as { size: unknown }).size === "string"
          ? (item as { size: string }).size.trim()
          : "value" in item && typeof (item as { value: unknown }).value === "string"
            ? (item as { value: string }).value.trim()
            : "";
      if (size) out.push(size);
    }
  }

  return [...new Set(out)];
}
