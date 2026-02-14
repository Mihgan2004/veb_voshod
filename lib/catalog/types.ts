// lib/catalog/types.ts

export type ProductStatus = "available" | "preorder" | "sold_out";

export type Category = "tee" | "hoodie" | "patch" | "cap" | "lanyard" | "accessory" | "other";

export type CollectionTag = "CORE" | "DROP" | "LIMITED" | "ARCHIVE" | "ACCESSORIES";

/** Состав и характеристики товара (из Directus / моков). */
export type ProductSpecs = {
  /** Артикул (code в Directus). */
  code?: string;
  /** Партия / батч. */
  batch?: string;
  /** Материал / состав (fabric, composition в Directus). */
  fabric?: string;
  /** Плотность (г/м² и т.п.). */
  density?: string;
  /** Тип нанесения (принт, вышивка и т.д.). */
  print?: string;
  /** Цвет товара. */
  color?: string;
};

export type Product = {
  id: string;
  slug: string;

  name: string;
  /** Полное описание товара (из Directus). */
  description: string;

  price: number;

  category: Category;

  inStock: boolean;
  isFeatured: boolean;
  status: ProductStatus;
  badge?: string;

  /** Главное изображение (одно). */
  image: string;
  /** Дополнительные изображения (галерея). Первое может дублировать image. */
  images?: string[];
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
  /** Подпись вместо тега (например «Коллекция №1»). В Directus — поле label. */
  label?: string;

  coverImage?: string;
  isFeatured: boolean;
  sort: number;
};
