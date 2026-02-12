// lib/catalog/directus-repo.ts
import type { CatalogRepo } from "./repo";
import type { Collection, Product } from "./types";
import { createDirectusClient } from "@/lib/directus/client";

type DirectusListResponse<T> = { data: T[] };

function toId(v: unknown): string | undefined {
  if (typeof v === "string") return v;
  if (typeof v === "number") return String(v);
  if (typeof v === "object" && v && "id" in v) {
    const id = (v as { id?: unknown }).id;
    return toId(id);
  }
  return undefined;
}

function assetUrl(base: string, file: unknown): string | undefined {
  const id = toId(file);
  return id ? `${base}/assets/${id}` : undefined;
}

function normalizeCollectionTag(v: unknown): Collection["tag"] {
  const raw = typeof v === "string" ? v : "";
  const upper = raw.toUpperCase();

  if (upper === "CORE") return "CORE";
  if (upper === "DROP") return "DROP";
  if (upper === "LIMITED") return "LIMITED";
  if (upper === "ARCHIVE") return "ARCHIVE";
  if (upper === "ACCESSORIES") return "ACCESSORIES";

  // дефолт для некорректных значений
  return "CORE";
}

function normalizeCategorySlug(v: unknown): Product["category"] {
  const slug =
    typeof v === "string"
      ? v
      : typeof v === "object" && v && "slug" in v
        ? (v as any).slug
        : "";

  const s = String(slug).toLowerCase();

  // под твой UI-фильтр + реальный data model
  if (s === "tee" || s === "hoodie" || s === "patch" || s === "cap") return s as any;
  if (s === "accessory" || s === "accessories") return "accessory" as any;
  return "other" as any;
}

export function createDirectusRepo(opts: { url: string; token?: string }): CatalogRepo {
  const client = createDirectusClient(opts);

  const COLLECTIONS = process.env.DIRECTUS_COLLECTIONS_NAME ?? "collections";
  const PRODUCTS = process.env.DIRECTUS_PRODUCTS_NAME ?? "products";

  return {
    async listCollections() {
      type Row = {
        id: unknown;
        slug: unknown;
        name: unknown;
        description?: unknown;
        tag?: unknown;
        coverImage?: unknown; // M2O -> directus_files
        isFeatured?: unknown;
        sort?: unknown;
      };

      // Важно: вытягиваем связи, но нам достаточно coverImage
      const res = await client.request<DirectusListResponse<Row>>(
        `/items/${COLLECTIONS}?limit=-1&fields=id,slug,name,description,tag,coverImage,isFeatured,sort`
      );

      return res.data
        .map((r): Collection | null => {
          const id = toId(r.id);
          const slug = typeof r.slug === "string" ? r.slug : undefined;
          const name = typeof r.name === "string" ? r.name : undefined;
          if (!id || !slug || !name) return null;

          const tag = normalizeCollectionTag(r.tag);
          const description = typeof r.description === "string" ? r.description : undefined;
          const coverImage = assetUrl(client.base, r.coverImage);
          const isFeatured = Boolean(r.isFeatured);
          const sortRaw = r.sort;
          const sort =
            typeof sortRaw === "number"
              ? sortRaw
              : typeof sortRaw === "string"
                ? Number.parseInt(sortRaw, 10) || 0
                : 0;

          return {
            id,
            slug,
            name,
            description,
            tag,
            coverImage,
            isFeatured,
            sort,
          };
        })
        .filter((x): x is Collection => Boolean(x));
    },

    async listProducts() {
      type Row = {
        id: unknown;
        slug: unknown;
        name: unknown;
        price: unknown;
        description?: unknown;

        category?: unknown; // M2O -> categories (нам нужен slug)
        collection?: unknown; // M2O -> collections (нам нужен id)
        image?: unknown; // M2O -> directus_files

        imagePlaceholder?: unknown;
        sizes?: unknown;
        inStock?: unknown;
        code?: unknown;
        batch?: unknown;
        isFeatured?: unknown;
      };

      // Важно: просим вложенные поля у связей
      const res = await client.request<DirectusListResponse<Row>>(
        `/items/${PRODUCTS}?limit=-1&fields=id,slug,name,price,description,image,imagePlaceholder,sizes,inStock,code,batch,isFeatured,category.slug,collection.id`
      );

      return res.data
        .map((r): Product | null => {
          const id = toId(r.id);
          const slug = typeof r.slug === "string" ? r.slug : undefined;
          const name = typeof r.name === "string" ? r.name : undefined;
          if (!id || !slug || !name) return null;

          const priceNum =
            typeof r.price === "number" ? r.price : typeof r.price === "string" ? Number(r.price) : 0;

          const sizes =
            Array.isArray(r.sizes) ? r.sizes.filter((x): x is string => typeof x === "string") : [];

          const inStock = Boolean(r.inStock);
          const isFeatured = Boolean(r.isFeatured);
          const status: Product["status"] = inStock ? "available" : "sold_out";

          return {
            id,
            slug,
            name,
            price: Number.isFinite(priceNum) ? priceNum : 0,
            description: typeof r.description === "string" ? r.description : "",
            category: normalizeCategorySlug(r.category),
            sizes,
            inStock,
            isFeatured,
            status,
            image: assetUrl(client.base, r.image) ?? "",
            imagePlaceholder: typeof r.imagePlaceholder === "string" ? r.imagePlaceholder : undefined,
            collectionId: toId(r.collection),
            specs: {
              code: typeof r.code === "string" ? r.code : undefined,
              batch: typeof r.batch === "string" ? r.batch : undefined,
            },
          };
        })
        .filter((x): x is Product => Boolean(x));
    },

    async getCollectionBySlug(slug: string) {
      const items = await this.listCollections();
      return items.find((c) => c.slug === slug) ?? null;
    },

    async getProductBySlug(slug: string) {
      const items = await this.listProducts();
      return items.find((p) => p.slug === slug) ?? null;
    },

    async listProductsByCollectionId(collectionId: string) {
      const items = await this.listProducts();
      return items.filter((p) => p.collectionId === collectionId);
    },

    async getProductsByCollectionId(collectionId: string) {
      const items = await this.listProducts();
      return items.filter((p) => p.collectionId === collectionId);
    },
  };
}
