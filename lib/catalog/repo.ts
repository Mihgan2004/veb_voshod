import type { Collection, Product } from "./types";

export type ListProductsParams = {
  collectionId?: string;
  limit?: number;
};

export interface CatalogRepo {
  listCollections(): Promise<Collection[]>;
  getCollectionBySlug(slug: string): Promise<Collection | null>;

  listProducts(params?: ListProductsParams): Promise<Product[]>;
  getProductBySlug(slug: string): Promise<Product | null>;

  listProductsByCollectionSlug(collectionSlug: string): Promise<Product[]>;
}
