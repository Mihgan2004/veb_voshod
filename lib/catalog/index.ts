// lib/catalog/index.ts
import type { CatalogRepo } from "./repo";
import { createMockCatalogRepo } from "./mock-repo";
import { createDirectusCatalogRepo } from "./directus-repo";

// чтобы в dev без env не падало — по умолчанию mock
const source = process.env.NEXT_PUBLIC_CATALOG_SOURCE ?? "mock";

const repo: CatalogRepo = source === "mock" ? createMockCatalogRepo() : createDirectusCatalogRepo();

export const catalog = repo;

// важно: чтобы `import { Product } from "@/lib/catalog"` работал
export type * from "./types";
export type * from "./repo";
