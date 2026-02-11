// lib/catalog/mock-data.ts
import type { Collection, Product, ProductSpecs } from "./types";

const img = (path: string) => path;

const teeSizes = ["S", "M", "L", "XL"];
const hoodieSizes = ["S", "M", "L", "XL"];
const oneSize = ["ONE SIZE"];

const specs = (s: Partial<ProductSpecs>): ProductSpecs => ({
  code: s.code ?? "—",
  batch: s.batch ?? "—",
  material: s.material,
  gsm: s.gsm,
});

export const collections: Collection[] = [
  {
    id: "col-core",
    slug: "core",
    name: "CORE LINE",
    tag: "CORE",
    description: "База бренда. Тихо. Точно. Надолго.",
  },
  {
    id: "col-drop-001",
    slug: "drop-001",
    name: "DROP 001",
    tag: "LIMITED",
    description: "Ограниченный выпуск. Номерной дроп.",
  },
  {
    id: "col-acc",
    slug: "accessories",
    name: "ACCESSORIES",
    tag: "ACCESSORIES",
    description: "Снаряжение и аксессуары.",
  },
];

export const products: Product[] = [
  {
    id: "p-tee-001",
    slug: "tee-voshod-core",
    name: "TEE / VOSKHOD CORE",
    price: 4900,
    collectionId: "col-core",
    category: "tee",
    status: "available",
    limitedCount: undefined,
    description: "Плотная футболка. Минимализм. Акцент на фактуре.",
    specs: specs({ code: "VSH-TEE-001", batch: "CORE-2026", material: "100% cotton", gsm: "240" }),
    image: img("/mock/products/tee-1.jpg"),
    imagePlaceholder: "https://picsum.photos/800/1000?random=11",
    inStock: true,
    sizes: teeSizes,
  },
  {
    id: "p-hood-001",
    slug: "hoodie-drop-001",
    name: "HOODIE / DROP 001",
    price: 10900,
    collectionId: "col-drop-001",
    category: "hoodie",
    status: "limited",
    limitedCount: 200,
    description: "Лимитированный худи. Номерной дроп.",
    specs: specs({ code: "VSH-HOOD-001", batch: "DROP-001", material: "cotton blend", gsm: "420" }),
    image: img("/mock/products/hood-1.jpg"),
    imagePlaceholder: "https://picsum.photos/800/1000?random=12",
    inStock: true,
    sizes: hoodieSizes,
  },
  {
    id: "p-patch-001",
    slug: "patch-core",
    name: "PATCH / CORE",
    price: 900,
    collectionId: "col-acc",
    category: "patch",
    status: "available",
    description: "Патч на липучке. Точная геометрия.",
    specs: specs({ code: "VSH-PATCH-001", batch: "ACC-2026" }),
    image: img("/mock/products/patch-1.jpg"),
    imagePlaceholder: "https://picsum.photos/800/1000?random=13",
    inStock: true,
    sizes: oneSize,
  },
  {
    id: "p-acc-001",
    slug: "lanyard-voshod",
    name: "LANYARD / VOSKHOD",
    price: 700,
    collectionId: "col-acc",
    category: "accessory",
    status: "available",
    description: "Стропа, фурнитура, минималистичный брендинг.",
    specs: specs({ code: "VSH-ACC-001", batch: "ACC-2026" }),
    image: img("/mock/products/lanyard-1.jpg"),
    imagePlaceholder: "https://picsum.photos/800/1000?random=14",
    inStock: true,
    sizes: oneSize,
  },
];

// mock-repo.ts у тебя импортит uppercase — даём алиасы, НО ВНИЗУ файла:
export const COLLECTIONS = collections;
export const PRODUCTS = products;
