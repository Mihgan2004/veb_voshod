// lib/catalog/mock-repo.ts
import type { CatalogRepo } from "./repo";
import type { Collection, Product } from "./types";
import { MOCK_COLLECTIONS, MOCK_PRODUCTS } from "./mock-data";

export function createMockRepo(): CatalogRepo {
  const collections: Collection[] = MOCK_COLLECTIONS;
  const products: Product[] = MOCK_PRODUCTS;

  return {
    async listCollections() {
      return collections;
    },

    async listProducts() {
      return products;
    },

    async getCollectionBySlug(slug: string) {
      return collections.find((c) => c.slug === slug) ?? null;
    },

    async getProductBySlug(slug: string) {
      return products.find((p) => p.slug === slug) ?? null;
    },

    async listProductsByCollectionId(collectionId: string) {
      return products.filter((p) => p.collectionId === collectionId);
    },

    async getProductsByCollectionId(collectionId: string) {
      return products.filter((p) => p.collectionId === collectionId);
    },
  };
}
