import type { CatalogRepo } from "./repo";
import { collections, products } from "./mock-data";

export function createMockRepo(): CatalogRepo {
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
    async getProductsByCollectionId(collectionId: string) {
      return products.filter((p) => p.collectionId === collectionId);
    },
    async listProductsByCollectionId(collectionId: string) {
      return products.filter((p) => p.collectionId === collectionId);
    },
  };
}

// Для обратной совместимости (опционально)
export const mockRepo = createMockRepo();