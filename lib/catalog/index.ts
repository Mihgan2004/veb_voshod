// lib/catalog/index.ts
import type { CatalogRepo } from "./repo";
import { createMockRepo } from "./mock-repo";
import { createMedusaRepo } from "./medusa-repo";
import { getStaticCollectionBySlug } from "./static-collections";
import { assertMedusaEnv, shouldUseMockCatalog } from "@/lib/medusa/env";

export * from "./types";
export type { CatalogRepo } from "./repo";

/** При ошибке каталога пробрасываем ошибку вверх (без silent mock fallback). */
function withErrorInsteadOfMock(primary: CatalogRepo): CatalogRepo {
  return {
    async listCollections() {
      try {
        const res = await primary.listCollections();
        return Array.isArray(res) ? res : [];
      } catch (e) {
        console.error("[catalog] listCollections failed:", e);
        throw new CatalogUnavailableError(
          e instanceof Error ? e.message : undefined,
        );
      }
    },
    async listProducts() {
      try {
        const res = await primary.listProducts();
        return Array.isArray(res) ? res : [];
      } catch (e) {
        console.error("[catalog] listProducts failed:", e);
        throw new CatalogUnavailableError(
          e instanceof Error ? e.message : undefined,
        );
      }
    },
    async getCollectionBySlug(slug: string) {
      try {
        const res = await primary.getCollectionBySlug(slug);
        return res ?? null;
      } catch (e) {
        console.error("[catalog] getCollectionBySlug failed:", e);
        throw new CatalogUnavailableError(
          e instanceof Error ? e.message : undefined,
        );
      }
    },
    async getProductBySlug(slug: string) {
      try {
        const res = await primary.getProductBySlug(slug);
        return res ?? null;
      } catch (e) {
        console.error("[catalog] getProductBySlug failed:", e);
        throw new CatalogUnavailableError(
          e instanceof Error ? e.message : undefined,
        );
      }
    },
    async listProductsByCollectionId(collectionId: string) {
      try {
        const res = await primary.listProductsByCollectionId(collectionId);
        return Array.isArray(res) ? res : [];
      } catch (e) {
        console.error("[catalog] listProductsByCollectionId failed:", e);
        throw new CatalogUnavailableError(
          e instanceof Error ? e.message : undefined,
        );
      }
    },
    async getProductsByCollectionId(collectionId: string) {
      try {
        const res = await primary.getProductsByCollectionId(collectionId);
        return Array.isArray(res) ? res : [];
      } catch (e) {
        console.error("[catalog] getProductsByCollectionId failed:", e);
        throw new CatalogUnavailableError(
          e instanceof Error ? e.message : undefined,
        );
      }
    },
  };
}

export class CatalogUnavailableError extends Error {
  constructor(detail?: string) {
    super(
      detail
        ? `Catalog unavailable: ${detail}`
        : "Catalog unavailable. Check Medusa backend connection and env variables.",
    );
    this.name = "CatalogUnavailableError";
  }
}

/** getCollectionBySlug: сначала статика (ссылки с главной), иначе Medusa/mock */
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

/**
 * Каталог:
 * - production / default → Medusa (требует NEXT_PUBLIC_MEDUSA_* env)
 * - local dev only: CATALOG_SOURCE=mock → mock repo
 */
function pickRepo(): CatalogRepo {
  if (shouldUseMockCatalog()) {
    console.info("[catalog] Using mock catalog (CATALOG_SOURCE=mock, non-production)");
    return withStaticCollectionFallback(createMockRepo());
  }

  assertMedusaEnv();
  return withStaticCollectionFallback(
    withErrorInsteadOfMock(createMedusaRepo()),
  );
}

export const catalog: CatalogRepo = pickRepo();
export {
  STATIC_COLLECTIONS,
  getCollectionCoverImage,
  isPrecompressedCoverImage,
} from "./static-collections";
