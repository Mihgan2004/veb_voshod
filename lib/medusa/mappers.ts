import type { HttpTypes } from "@medusajs/types";
import type { CartLine } from "@/lib/cart/cart-store";
import { normalizeCategorySlug } from "@/lib/catalog/category-utils";
import type {
  Collection,
  CollectionTag,
  Product,
  ProductSpecs,
  ProductVariant,
} from "@/lib/catalog/types";
import { normalizeMedusaPrice } from "./price";

type StoreProduct = HttpTypes.StoreProduct;
type StoreProductVariant = HttpTypes.StoreProductVariant;
type StoreCollection = HttpTypes.StoreCollection;
type StoreCart = HttpTypes.StoreCart;
type StoreCartLineItem = HttpTypes.StoreCartLineItem;

const FALLBACK_IMAGE = "/globe.svg";

function metadataString(
  metadata: Record<string, unknown> | null | undefined,
  key: string,
): string | undefined {
  const value = metadata?.[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function variantPriceAmount(variant: StoreProductVariant): number {
  const calculated = variant.calculated_price;
  const currency = calculated?.currency_code ?? "rub";
  if (calculated?.calculated_amount != null) {
    return normalizeMedusaPrice(calculated.calculated_amount, currency);
  }
  return 0;
}

function lineItemUnitPrice(item: StoreCartLineItem): number {
  if (typeof item.unit_price === "number") {
    return normalizeMedusaPrice(item.unit_price, "rub");
  }
  if (item.variant) {
    return variantPriceAmount(item.variant);
  }
  return 0;
}

function extractVariantSize(variant: StoreProductVariant): string {
  const options = variant.options ?? [];
  const sizeOption = options.find((option) => {
    const title = option.option?.title?.toLowerCase() ?? "";
    return title === "size" || title === "размер";
  });
  if (sizeOption?.value) return sizeOption.value;
  if (options[0]?.value) return options[0].value;
  return "ONE SIZE";
}

function variantInStock(variant: StoreProductVariant): boolean {
  if (!variant.manage_inventory) return true;
  const qty = variant.inventory_quantity;
  if (typeof qty === "number") return qty > 0;
  return Boolean(variant.allow_backorder);
}

function mapVariants(variants: StoreProductVariant[] | null | undefined): {
  variants: ProductVariant[];
  sizes: string[];
} {
  const mapped =
    variants?.map((variant) => ({
      variantId: variant.id,
      size: extractVariantSize(variant),
      price: variantPriceAmount(variant),
      inStock: variantInStock(variant),
    })) ?? [];

  const sizes = Array.from(new Set(mapped.map((v) => v.size)));
  return { variants: mapped, sizes };
}

function mapSpecs(metadata: Record<string, unknown> | null | undefined): ProductSpecs | undefined {
  const specs: ProductSpecs = {
    code: metadataString(metadata, "code"),
    batch: metadataString(metadata, "batch"),
    fabric: metadataString(metadata, "fabric"),
    density: metadataString(metadata, "density"),
    print: metadataString(metadata, "print"),
    color: metadataString(metadata, "color"),
  };

  const hasValue = Object.values(specs).some(Boolean);
  return hasValue ? specs : undefined;
}

function productImages(product: StoreProduct): {
  image: string;
  images?: string[];
} {
  const urls = (product.images ?? [])
    .map((img) => img.url)
    .filter((url): url is string => Boolean(url));

  const thumbnail = product.thumbnail ?? urls[0] ?? FALLBACK_IMAGE;
  const allImages = thumbnail
    ? [thumbnail, ...urls.filter((url) => url !== thumbnail)]
    : urls;

  return {
    image: thumbnail || FALLBACK_IMAGE,
    images: allImages.length > 0 ? allImages : [FALLBACK_IMAGE],
  };
}

function normalizeCollectionTag(v: unknown): CollectionTag {
  const upper = String(v ?? "").toUpperCase();
  if (upper === "CORE") return "CORE";
  if (upper === "DROP") return "DROP";
  if (upper === "LIMITED") return "LIMITED";
  if (upper === "ARCHIVE") return "ARCHIVE";
  if (upper === "ACCESSORIES") return "ACCESSORIES";
  return "CORE";
}

export function mapMedusaProduct(product: StoreProduct): Product | null {
  if (!product.id || !product.handle || !product.title) return null;

  const { variants, sizes } = mapVariants(product.variants);
  const defaultVariant = variants.find((v) => v.inStock) ?? variants[0];
  const price = defaultVariant?.price ?? 0;
  const inStock = variants.length === 0 ? true : variants.some((v) => v.inStock);
  const category = product.categories?.[0];
  const { image, images } = productImages(product);
  const specs = mapSpecs(product.metadata);

  return {
    id: product.id,
    slug: product.handle,
    name: product.title,
    description: product.description ?? "",
    price,
    category: normalizeCategorySlug(category),
    categoryName: category?.name ?? undefined,
    inStock,
    isFeatured: false,
    status: inStock ? "available" : "sold_out",
    image,
    images,
    sizes: sizes.length > 0 ? sizes : ["ONE SIZE"],
    variants: variants.length > 0 ? variants : undefined,
    specs,
    collectionId: product.collection?.id ?? undefined,
  };
}

export function mapMedusaCollection(
  collection: StoreCollection,
  index = 0,
): Collection | null {
  if (!collection.id || !collection.handle || !collection.title) return null;

  const metadata = collection.metadata as Record<string, unknown> | null | undefined;

  return {
    id: collection.id,
    slug: collection.handle,
    name: collection.title,
    description: collection.metadata
      ? metadataString(metadata, "description")
      : undefined,
    tag: normalizeCollectionTag(metadata?.tag),
    label: metadataString(metadata, "label"),
    coverImage: metadataString(metadata, "coverImage"),
    isFeatured: false,
    sort: index,
  };
}

function lineItemToProduct(item: StoreCartLineItem): Product {
  const product = item.product;
  const variant = item.variant;
  const unitPrice = lineItemUnitPrice(item);
  const size = variant ? extractVariantSize(variant) : "ONE SIZE";
  const variantId = variant?.id ?? item.variant_id ?? "";
  const specs = mapSpecs(product?.metadata);
  const image = product?.thumbnail ?? item.thumbnail ?? FALLBACK_IMAGE;

  return {
    id: product?.id ?? item.product_id ?? item.id,
    slug: product?.handle ?? item.id,
    name: product?.title ?? item.title ?? "Товар",
    description: product?.description ?? "",
    price: unitPrice,
    category: normalizeCategorySlug(product?.categories?.[0]),
    categoryName: product?.categories?.[0]?.name,
    inStock: true,
    status: "available",
    image,
    images: [image],
    sizes: [size],
    variants: variantId
      ? [{ variantId, size, price: unitPrice, inStock: true }]
      : undefined,
    specs,
  };
}

export function mapMedusaCartToLines(cart: StoreCart): CartLine[] {
  const medusaCartId = cart.id;

  return (cart.items ?? []).map((item) => {
    const variant = item.variant;
    const size = variant ? extractVariantSize(variant) : "ONE SIZE";
    const variantId = variant?.id ?? item.variant_id ?? "";

    return {
      cartId: medusaCartId,
      lineItemId: item.id,
      product: lineItemToProduct(item),
      size,
      qty: item.quantity,
      variantId,
    };
  });
}

export function findVariantId(product: Product, size: string): string | null {
  if (!product.variants?.length) return null;
  const variant = product.variants.find((v) => v.size === size);
  if (variant) return variant.variantId;
  if (product.variants.length === 1) return product.variants[0].variantId;
  return null;
}
