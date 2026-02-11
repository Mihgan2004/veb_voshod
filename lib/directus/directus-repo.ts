import type { CatalogRepo, ListProductsParams } from "./repo";
import type { Collection, CollectionTag, Product, ProductCategory, ProductSpecs, ProductStatus } from "./types";
import { directusAssetUrl, directusGet } from "@/lib/directus/client";

type DirectusResponse<T> = { data: T };

type DirectusCollection = {
  id: string;
  slug: string;
  name: string;
  tag?: string | null;
  description?: string | null;
};

type DirectusProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  collection: string;
  category: string;
  status: string;
  limitedCount?: number | null;
  description?: string | null;
  specs?: Record<string, unknown> | null;
  image?: string | null;
  sizes?: unknown;
  inStock?: unknown;
};

const normalizeTag = (t: unknown): CollectionTag => {
  const v = String(t ?? "").toUpperCase();
  if (v === "CORE" || v === "LIMITED" || v === "ARCHIVE" || v === "ACCESSORIES") return v as CollectionTag;
  return "CORE";
};

const normalizeCategory = (c: unknown): ProductCategory => {
  const v = String(c ?? "");
  if (v === "tee" || v === "hoodie" || v === "patch" || v === "accessory") return v as ProductCategory;
  return "tee";
};

const normalizeStatus = (s: unknown): ProductStatus => {
  const v = String(s ?? "");
  if (v === "available" || v === "preorder" || v === "limited" || v === "archive") return v as ProductStatus;
  return "available";
};

const normalizeSpecs = (raw: unknown): ProductSpecs => {
  const o = (raw && typeof raw === "object") ? (raw as Record<string, unknown>) : {};
  return {
    code: String(o.code ?? "—"),
    batch: String(o.batch ?? "—"),
    material: o.material ? String(o.material) : undefined,
    gsm: o.gsm ? String(o.gsm) : undefined,
  };
};

function mapCollection(c: DirectusCollection): Collection {
  return {
    id: c.id,
    slug: c.slug,
    name: c.name,
    tag: normalizeTag(c.tag),
    description: c.description ?? "",
  };
}

function mapProduct(p: DirectusProduct): Product {
  const image = p.image ? directusAssetUrl(p.image) : "https://picsum.photos/800/1000?random=99";
  const sizes =
    Array.isArray(p.sizes) ? p.sizes.map(String) :
    typeof p.sizes === "string" ? [p.sizes] :
    ["ONE SIZE"];

  const inStock = typeof p.inStock === "boolean" ? p.inStock : p.status !== "archive";

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: Number(p.price ?? 0),
    collectionId: p.collection,
    category: normalizeCategory(p.category),
    status: normalizeStatus(p.status),
    limitedCount: p.limitedCount ?? undefined,
    description: p.description ?? "",
    specs: normalizeSpecs(p.specs),
    image,
    imagePlaceholder: image,
    inStock,
    sizes,
  };
}

export function createDirectusCatalogRepo(): CatalogRepo {
  return {
    async listCollections(): Promise<Collection[]> {
      const r = await directusGet<DirectusResponse<DirectusCollection[]>>(
        `/items/collections?fields=id,slug,name,tag,description&sort=sort,created_at`
      );
      return r.data.map(mapCollection);
    },

    async getCollectionBySlug(slug: string): Promise<Collection | null> {
      const r = await directusGet<DirectusResponse<DirectusCollection[]>>(
        `/items/collections?fields=id,slug,name,tag,description&filter[slug][_eq]=${encodeURIComponent(slug)}&limit=1`
      );
      return r.data[0] ? mapCollection(r.data[0]) : null;
    },

    async listProducts(params?: ListProductsParams): Promise<Product[]> {
      const { collectionId, limit } = params ?? {};
      const filter = collectionId ? `&filter[collection][_eq]=${encodeURIComponent(collectionId)}` : "";
      const lim = typeof limit === "number" ? `&limit=${limit}` : "";
      const r = await directusGet<DirectusResponse<DirectusProduct[]>>(
        `/items/products?fields=id,slug,name,price,collection,category,status,limitedCount,description,specs,image,sizes,inStock&sort=sort,created_at${filter}${lim}`
      );
      return r.data.map(mapProduct);
    },

    async getProductBySlug(slug: string): Promise<Product | null> {
      const r = await directusGet<DirectusResponse<DirectusProduct[]>>(
        `/items/products?fields=id,slug,name,price,collection,category,status,limitedCount,description,specs,image,sizes,inStock&filter[slug][_eq]=${encodeURIComponent(slug)}&limit=1`
      );
      return r.data[0] ? mapProduct(r.data[0]) : null;
    },

    async listProductsByCollectionSlug(collectionSlug: string): Promise<Product[]> {
      const col = await this.getCollectionBySlug(collectionSlug);
      if (!col) return [];
      return this.listProducts({ collectionId: col.id });
    },
  };
}
