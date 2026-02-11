// lib/types.ts

export type ProductCategory = "tee" | "hoodie" | "patch" | "accessory";
export type Category = ProductCategory;

export type ProductStatus = "available" | "preorder" | "limited" | "archive";

export type CollectionTag = "CORE" | "LIMITED" | "ARCHIVE" | "ACCESSORIES";

export type ProductSpecs = {
  code: string;
  batch: string;
  material?: string;
  gsm?: string;
};

export type Collection = {
  id: string;
  slug: string;
  name: string;
  tag: CollectionTag;
  description: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  price: number;

  collectionId: string;

  category: ProductCategory;
  status: ProductStatus;

  description: string;

  // media
  image: string;             // основная картинка (может совпадать с placeholder)
  imagePlaceholder: string;  // фоллбек/плейсхолдер

  // commerce
  inStock: boolean;
  sizes: string[]; // [] допустим, но лучше ["ONE SIZE"]

  limitedCount?: number;
  specs: ProductSpecs;
};
