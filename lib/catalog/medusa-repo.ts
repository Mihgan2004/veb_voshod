import type { CatalogRepo } from "./repo";
import {
  getMedusaCollectionByHandle,
  getMedusaProductByHandle,
  listMedusaCollections,
  listMedusaProducts,
  listMedusaProductsByCollectionId,
} from "@/lib/medusa/products";

export function createMedusaRepo(): CatalogRepo {
  return {
    listCollections: listMedusaCollections,
    listProducts: listMedusaProducts,
    getCollectionBySlug: getMedusaCollectionByHandle,
    getProductBySlug: getMedusaProductByHandle,
    listProductsByCollectionId: listMedusaProductsByCollectionId,
    getProductsByCollectionId: listMedusaProductsByCollectionId,
  };
}
