// lib/catalog/index.ts
import type { CatalogRepo } from "./repo";
import { createMockRepo } from "./mock-repo";
import { createDirectusRepo } from "./directus-repo";
import {
  STATIC_COLLECTIONS,
  getStaticCollectionBySlug,
} from "./static-collections";

export * from "./types";
export type { CatalogRepo } from "./repo";

/** При ошибке Directus возвращаем пустые данные (без mock) и пробрасываем ошибку вверх */
function withErrorInsteadOfMock(primary: CatalogRepo): CatalogRepo {
  return {
    async listCollections() {
      try {
        const res = await primary.listCollections();
        return Array.isArray(res) ? res : [];
      } catch (e) {
        console.error("[catalog] listCollections failed:", e);
        throw new CatalogUnavailableError();
      }
    },
    async listProducts() {
      try {
        const res = await primary.listProducts();
        return Array.isArray(res) ? res : [];
      } catch (e) {
        console.error("[catalog] listProducts failed:", e);
        throw new CatalogUnavailableError();
      }
    },
    async getCollectionBySlug(slug: string) {
      try {
        const res = await primary.getCollectionBySlug(slug);
        return res ?? null;
      } catch (e) {
        console.error("[catalog] getCollectionBySlug failed:", e);
        throw new CatalogUnavailableError();
      }
    },
    async getProductBySlug(slug: string) {
      try {
        const res = await primary.getProductBySlug(slug);
        return res ?? null;
      } catch (e) {
        console.error("[catalog] getProductBySlug failed:", e);
        throw new CatalogUnavailableError();
      }
    },
    async listProductsByCollectionId(collectionId: string) {
      try {
        const res = await primary.listProductsByCollectionId(collectionId);
        return Array.isArray(res) ? res : [];
      } catch (e) {
        console.error("[catalog] listProductsByCollectionId failed:", e);
        throw new CatalogUnavailableError();
      }
    },
    async getProductsByCollectionId(collectionId: string) {
      try {
        const res = await primary.getProductsByCollectionId(collectionId);
        return Array.isArray(res) ? res : [];
      } catch (e) {
        console.error("[catalog] getProductsByCollectionId failed:", e);
        throw new CatalogUnavailableError();
      }
    },
  };
}

export class CatalogUnavailableError extends Error {
  constructor() {
    super("Catalog unavailable");
    this.name = "CatalogUnavailableError";
  }
}

/** getCollectionBySlug: сначала статика (ссылки с главной), иначе Directus/mock */
function withStaticCollectionFallback(repo: CatalogRepo): CatalogRepo {
  return {
    ...repo,
    async getCollectionBySlug(slug: string) {
      const staticCol = getStaticCollectionBySlug(slug);
      if (staticCol) return staticCol;
      return repo.getCollectionBySlug(slug);
    },
  };
}

/** Каталог: коллекции и товары из Directus при CATALOG_SOURCE=directus; иначе mock. При ошибке Directus — throw CatalogUnavailableError. */
function pickRepo(): CatalogRepo {
  const source = (
    process.env.CATALOG_SOURCE ??
    process.env.NEXT_PUBLIC_CATALOG_SOURCE ??
    "mock"
  ).toLowerCase();

  const mock = createMockRepo();

  let repo: CatalogRepo = mock;
  if (source === "directus") {
    const url = process.env.DIRECTUS_URL ?? "";
    const token = process.env.DIRECTUS_TOKEN;
    if (url) {
      const directus = createDirectusRepo({ url, token });
      repo = withErrorInsteadOfMock(directus);
    }
  }

  return withStaticCollectionFallback(repo);
}

export const catalog: CatalogRepo = pickRepo();
export { STATIC_COLLECTIONS } from "./static-collections";
