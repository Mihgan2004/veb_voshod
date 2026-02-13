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

function withFallback(primary: CatalogRepo, fallback: CatalogRepo): CatalogRepo {
  return {
    async listCollections() {
      try {
        const res = await primary.listCollections();
        return Array.isArray(res) ? res : await fallback.listCollections();
      } catch (e) {
        console.error("[catalog] listCollections failed, fallback to mock:", e);
        return fallback.listCollections();
      }
    },
    async listProducts() {
      try {
        const res = await primary.listProducts();
        return Array.isArray(res) ? res : await fallback.listProducts();
      } catch (e) {
        console.error("[catalog] listProducts failed, fallback to mock:", e);
        return fallback.listProducts();
      }
    },
    async getCollectionBySlug(slug: string) {
      try {
        const res = await primary.getCollectionBySlug(slug);
        return res ?? fallback.getCollectionBySlug(slug);
      } catch (e) {
        console.error("[catalog] getCollectionBySlug failed, fallback:", e);
        return fallback.getCollectionBySlug(slug);
      }
    },
    async getProductBySlug(slug: string) {
      try {
        const res = await primary.getProductBySlug(slug);
        return res ?? fallback.getProductBySlug(slug);
      } catch (e) {
        console.error("[catalog] getProductBySlug failed, fallback:", e);
        return fallback.getProductBySlug(slug);
      }
    },
    async listProductsByCollectionId(collectionId: string) {
      try {
        const res = await primary.listProductsByCollectionId(collectionId);
        return Array.isArray(res) ? res : await fallback.listProductsByCollectionId(collectionId);
      } catch (e) {
        console.error("[catalog] listProductsByCollectionId failed, fallback:", e);
        return fallback.listProductsByCollectionId(collectionId);
      }
    },
    async getProductsByCollectionId(collectionId: string) {
      try {
        const res = await primary.getProductsByCollectionId(collectionId);
        return Array.isArray(res) ? res : await fallback.getProductsByCollectionId(collectionId);
      } catch (e) {
        console.error("[catalog] getProductsByCollectionId failed, fallback:", e);
        return fallback.getProductsByCollectionId(collectionId);
      }
    },
  };
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

/** Каталог: коллекции и товары из Directus при CATALOG_SOURCE=directus; иначе mock. Ссылки с главной (статика) резолвятся через getCollectionBySlug. */
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
      repo = withFallback(directus, mock);
    }
  }

  return withStaticCollectionFallback(repo);
}

export const catalog: CatalogRepo = pickRepo();
export { STATIC_COLLECTIONS } from "./static-collections";
