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

/** Массив файлов из Directus (M2M или JSON) → массив URL. */
function assetUrls(base: string, value: unknown): string[] {
  if (!value) return [];
  const arr = Array.isArray(value) ? value : [value];
  const urls: string[] = [];
  for (const item of arr) {
    const url = assetUrl(base, item);
    if (url) urls.push(url);
  }
  return urls;
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

  const s = String(slug).toLowerCase().trim();

  // Латинские slug из схемы Directus
  if (s === "tee" || s === "hoodie" || s === "patch" || s === "cap" || s === "lanyard") return s as Product["category"];
  if (s === "accessory" || s === "accessories") return "accessory";

  // Кириллица: часто в Directus slug заполняют по-русски — маппим в латинский тип
  if (s === "футболка" || s === "футболки") return "tee";
  if (s === "худи" || s === "свитшот") return "hoodie";
  if (s === "нашлепка" || s === "патч") return "patch";
  if (s === "кепка" || s === "шапка") return "cap";
  if (s === "аксессуар" || s === "аксессуары") return "accessory";

  return "other";
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
        label?: unknown;
        coverImage?: unknown;
        isFeatured?: unknown;
        sort?: unknown;
      };

      const res = await client.request<DirectusListResponse<Row>>(
        `/items/${COLLECTIONS}?limit=-1&fields=id,slug,name,description,tag,label,coverImage,isFeatured,sort`
      );

      return res.data
        .map((r): Collection | null => {
          const id = toId(r.id);
          const slug = typeof r.slug === "string" ? r.slug : undefined;
          const name = typeof r.name === "string" ? r.name : undefined;
          if (!id || !slug || !name) return null;

          const tag = normalizeCollectionTag(r.tag);
          const description = typeof r.description === "string" ? r.description : undefined;
          const label = typeof r.label === "string" ? r.label : undefined;
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
            label,
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
        description?: unknown;
        price: unknown;
        category?: unknown;
        collection?: unknown;
        image?: unknown;
        /** Галерея: M2M к directus_files — в API массив объектов с id */
        images?: unknown;
        sizes?: unknown;
        inStock?: unknown;
        code?: unknown;
        batch?: unknown;
        isFeatured?: unknown;
        color?: unknown;
        fabric?: unknown;
        density?: unknown;
        print?: unknown;
      };

      const res = await client.request<DirectusListResponse<Row>>(
        `/items/${PRODUCTS}?limit=-1&fields=id,slug,name,description,price,image,images.id,sizes,inStock,code,batch,isFeatured,color,fabric,density,print,category.slug,collection.id`
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

          const mainImage = assetUrl(client.base, r.image);
          const galleryUrls = assetUrls(client.base, r.images);
          const allImages = mainImage
            ? [mainImage, ...galleryUrls.filter((u) => u !== mainImage)]
            : galleryUrls;

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
            image: mainImage ?? galleryUrls[0] ?? "",
            images: allImages.length > 0 ? allImages : undefined,
            collectionId: toId(r.collection),
            specs: {
              code: typeof r.code === "string" ? r.code : undefined,
              batch: typeof r.batch === "string" ? r.batch : undefined,
              fabric: typeof r.fabric === "string" ? r.fabric : undefined,
              density: typeof r.density === "string" ? r.density : undefined,
              print: typeof r.print === "string" ? r.print : undefined,
              color: typeof r.color === "string" ? r.color : undefined,
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
