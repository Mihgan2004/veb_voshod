import type { CatalogRepo } from "./repo";
import { createMockRepo } from "./mock-repo"; // ✅ теперь это функция
import { createDirectusRepo } from "./directus-repo";

// ... остальной код без изменений

function pickRepo(): CatalogRepo {
  const source = (
    process.env.CATALOG_SOURCE ??
    process.env.NEXT_PUBLIC_CATALOG_SOURCE ??
    "mock"
  ).toLowerCase();

  const mock = createMockRepo(); // ✅ теперь работает

  if (source === "directus") {
    const url = process.env.DIRECTUS_URL ?? "";
    const token = process.env.DIRECTUS_TOKEN;

    if (url) {
      const directus = createDirectusRepo({ url, token });
      return withFallback(directus, mock);
    }
  }

  return mock;
}

export const catalog: CatalogRepo = pickRepo();