// lib/catalog/types.ts
export type ProductStatus = "available" | "preorder" | "sold_out";

export type Category = "tee" | "hoodie" | "patch" | "accessory" | "other";

export type CollectionTag = "CORE" | "DROP" | "LIMITED" | "ARCHIVE";

export type Currency = "RUB" | "USD" | "EUR";

export type ProductSpecs = {
  fabric?: string;
  fit?: string;
  print?: string;
  code?: string; // <- чтобы не падали mock.ts / mock-data.ts
};

export type Product = {
  id: string;
  slug: string;

  title: string;
  subtitle?: string;

  price: number;
  currency: Currency;

  category: Category;
  status: ProductStatus;

  image?: string; // url или directus file id → мы в repo приведём к url
  badge?: string;

  specs?: ProductSpecs;
  colors?: string[];
  sizes?: string[];

  collectionId?: string;
};

export type Collection = {
  id: string;
  slug: string;

  title: string;
  description?: string;

  tag: CollectionTag;

  coverImage?: string;
};
