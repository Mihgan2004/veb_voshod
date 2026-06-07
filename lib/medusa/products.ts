import { getMedusa, getRegionId } from "./client";
import { mapMedusaCollection, mapMedusaProduct } from "./mappers";
import { PRODUCT_LIST_FIELDS } from "./types";
import type { Collection, Product } from "@/lib/catalog/types";

const PAGE_SIZE = 100;

async function listAllProducts(query?: {
  q?: string;
  collection_id?: string;
  handle?: string;
}): Promise<Product[]> {
  const sdk = getMedusa();
  const regionId = getRegionId();
  const products: Product[] = [];
  let offset = 0;

  for (;;) {
    const { products: batch, count } = await sdk.store.product.list({
      region_id: regionId,
      limit: PAGE_SIZE,
      offset,
      fields: PRODUCT_LIST_FIELDS,
      ...query,
    });

    for (const row of batch) {
      const mapped = mapMedusaProduct(row);
      if (mapped) products.push(mapped);
    }

    offset += batch.length;
    if (offset >= count || batch.length === 0) break;
  }

  return products;
}

export async function listMedusaProducts(): Promise<Product[]> {
  return listAllProducts();
}

export async function getMedusaProductByHandle(
  handle: string,
): Promise<Product | null> {
  const products = await listAllProducts({ handle });
  return products.find((p) => p.slug === handle) ?? null;
}

export async function listMedusaCollections(): Promise<Collection[]> {
  const sdk = getMedusa();
  const collections: Collection[] = [];
  let offset = 0;

  for (;;) {
    const { collections: batch, count } = await sdk.store.collection.list({
      limit: PAGE_SIZE,
      offset,
      fields: "id,handle,title,metadata",
    });

    batch.forEach((row, index) => {
      const mapped = mapMedusaCollection(row, offset + index);
      if (mapped) collections.push(mapped);
    });

    offset += batch.length;
    if (offset >= count || batch.length === 0) break;
  }

  return collections;
}

export async function getMedusaCollectionByHandle(
  handle: string,
): Promise<Collection | null> {
  const collections = await listMedusaCollections();
  return collections.find((c) => c.slug === handle) ?? null;
}

export async function listMedusaProductsByCollectionId(
  collectionId: string,
): Promise<Product[]> {
  const products = await listAllProducts({ collection_id: collectionId });
  return products.filter((p) => p.collectionId === collectionId);
}
