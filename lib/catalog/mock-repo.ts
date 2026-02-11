import type { CatalogRepo, ListProductsParams } from "./repo";
import type { Collection, Product } from "./types";
import { COLLECTIONS, PRODUCTS } from "./mock-data";

export function createMockCatalogRepo(): CatalogRepo {
  return {
    async listCollections(): Promise<Collection[]> {
      return COLLECTIONS;
    },

    async getCollectionBySlug(slug: string): Promise<Collection | null> {
      return COLLECTIONS.find((c) => c.slug === slug) ?? null;
    },

    async listProducts(params?: ListProductsParams): Promise<Product[]> {
      const { collectionId, limit } = params ?? {};
      const filtered = collectionId ? PRODUCTS.filter((p) => p.collectionId === collectionId) : PRODUCTS;
      return typeof limit === "number" ? filtered.slice(0, limit) : filtered;
    },

    async getProductBySlug(slug: string): Promise<Product | null> {
      return PRODUCTS.find((p) => p.slug === slug) ?? null;
    },

    async listProductsByCollectionSlug(collectionSlug: string): Promise<Product[]> {
      const col = COLLECTIONS.find((c) => c.slug === collectionSlug);
      if (!col) return [];
      return PRODUCTS.filter((p) => p.collectionId === col.id);
    },
  };
}
