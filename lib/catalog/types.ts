// lib/catalog/types.ts

export type ProductStatus = "available" | "preorder" | "sold_out";

export type Category = "tee" | "hoodie" | "patch" | "cap" | "lanyard" | "accessory" | "other";

export type CollectionTag = "CORE" | "DROP" | "LIMITED" | "ARCHIVE" | "ACCESSORIES";

export type ProductSpecs = {
  code?: string;
  batch?: string;

  // дополнительные поля для моков/витрины
  fabric?: string;
  density?: string;
  print?: string;
  color?: string;
};

export type Product = {
  id: string;
  slug: string;

  name: string;
  description: string;

  price: number;

  category: Category;

  // твоя модель Directus:
  inStock: boolean;
  isFeatured: boolean;

  // удобно оставить computed-поле для UI/моков
  status: ProductStatus;

  // бейдж для витрины (например, NEW/SOLD OUT и т.п.)
  badge?: string;

  image: string;
  imagePlaceholder?: string;

  sizes: string[];

  specs?: ProductSpecs;

  collectionId?: string;
};

export type Collection = {
  id: string;
  slug: string;

  name: string;
  description?: string;

  tag: CollectionTag;

  coverImage?: string;
  isFeatured: boolean;
  sort: number;
};
