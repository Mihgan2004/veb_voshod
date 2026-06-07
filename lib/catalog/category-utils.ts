import type { Category } from "./types";

export function normalizeCategorySlug(v: unknown): Category {
  const slug =
    typeof v === "string"
      ? v
      : typeof v === "object" && v && "handle" in v
        ? (v as { handle?: unknown }).handle
        : typeof v === "object" && v && "slug" in v
          ? (v as { slug?: unknown }).slug
          : "";

  const s = String(slug).toLowerCase().trim();

  if (
    s === "tee" ||
    s === "hoodie" ||
    s === "patch" ||
    s === "cap" ||
    s === "lanyard"
  ) {
    return s as Category;
  }
  if (s === "accessory" || s === "accessories") return "accessory";

  if (s === "футболка" || s === "футболки") return "tee";
  if (s === "худи" || s === "свитшот") return "hoodie";
  if (s === "нашлепка" || s === "патч") return "patch";
  if (s === "кепка" || s === "шапка") return "cap";
  if (s === "аксессуар" || s === "аксессуары") return "accessory";

  return "other";
}
