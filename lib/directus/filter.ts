/**
 * Serialize a Directus filter object into query string segments.
 * Example: { id: { _eq: 5 } } → filter[id][_eq]=5
 */
export function serializeDirectusFilter(
  filter: Record<string, unknown>,
  prefix = "filter"
): string {
  const parts: string[] = [];

  function walk(obj: Record<string, unknown>, path: string[]) {
    for (const [key, val] of Object.entries(obj)) {
      const next = [...path, key];
      if (val !== null && typeof val === "object" && !Array.isArray(val)) {
        walk(val as Record<string, unknown>, next);
      } else {
        const paramKey = `${prefix}[${next.join("][")}]`;
        let encoded: string;
        if (val === null) {
          encoded = "";
        } else if (Array.isArray(val)) {
          encoded = JSON.stringify(val);
        } else {
          encoded = String(val);
        }
        parts.push(`${paramKey}=${encodeURIComponent(encoded)}`);
      }
    }
  }

  walk(filter, []);
  return parts.join("&");
}

/** filter[id][_in]=["a","b"] for batch reads */
export function filterIdIn(ids: (string | number)[]): string {
  const unique = [...new Set(ids.map(String))];
  const filter = { id: { _in: unique } };
  return serializeDirectusFilter(filter);
}
