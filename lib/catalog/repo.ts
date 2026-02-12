// lib/catalog/repo.ts
import type { Collection, Product } from "./types";

export type CatalogRepo = {
  listCollections(): Promise<Collection[]>;
  listProducts(): Promise<Product[]>;

  getCollectionBySlug(slug: string): Promise<Collection | null>;
  getProductBySlug(slug: string): Promise<Product | null>;

  // чтобы не ловить “то есть/то нет” по всему проекту:
  listProductsByCollectionId(collectionId: string): Promise<Product[]>;
  getProductsByCollectionId(collectionId: string): Promise<Product[]>;
};
