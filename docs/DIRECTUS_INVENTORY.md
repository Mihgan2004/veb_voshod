# Настройка учёта размеров и количества в Directus

Инструкция по настройке складского учёта товаров по размерам.

---

## Текущая схема

Сейчас в коллекции `products`:
- `sizes` — JSON-массив строк (`["S","M","L","XL"]`)
- `inStock` — boolean (в наличии / нет)

**Проблема:** нельзя отслеживать количество по каждому размеру.

---

## Новая схема: products_sizes (junction table)

### 1. Создай junction-таблицу в Directus

**Имя коллекции:** `products_sizes`

| Поле | Тип | Настройки |
|------|-----|-----------|
| `id` | UUID (Primary Key) | Автогенерация |
| `product_id` | M2O → products | On delete: CASCADE |
| `size` | String | Dropdown: S, M, L, XL, XXL, ONE SIZE |
| `quantity` | Integer | Default: 0, Min: 0 |

### 2. Настрой связь в коллекции `products`

1. Открой коллекцию `products` в Directus
2. Добавь поле `stock` типа **O2M (One-to-Many)**
   - Related collection: `products_sizes`
   - Foreign key: `product_id`
3. Старое поле `sizes` можно оставить для обратной совместимости или удалить

### 3. Пример данных

Для футболки `VSHD-TEE-001`:

| product_id | size | quantity |
|------------|------|----------|
| abc-123... | S | 5 |
| abc-123... | M | 12 |
| abc-123... | L | 8 |
| abc-123... | XL | 3 |
| abc-123... | XXL | 0 |

---

## Обновление кода

### 1. Типы (`lib/catalog/types.ts`)

Добавь новый тип:

```typescript
export type SizeStock = {
  size: string;
  quantity: number;
};

export type Product = {
  // ... существующие поля
  sizes: string[];           // доступные размеры (quantity > 0)
  sizeStock?: SizeStock[];   // полная информация по размерам
  totalStock?: number;       // общее количество
};
```

### 2. Directus repo (`lib/catalog/directus-repo.ts`)

Обнови запрос и парсинг:

```typescript
// В запросе добавь поле stock
const res = await client.request<DirectusListResponse<Row>>(
  `/items/${PRODUCTS}?limit=-1&fields=...,stock.size,stock.quantity,...`
);

// При парсинге
const stockItems = Array.isArray(r.stock) 
  ? r.stock.map((s: any) => ({
      size: String(s.size),
      quantity: Number(s.quantity) || 0,
    }))
  : [];

const availableSizes = stockItems
  .filter(s => s.quantity > 0)
  .map(s => s.size);

const totalStock = stockItems.reduce((sum, s) => sum + s.quantity, 0);
const inStock = totalStock > 0;

return {
  // ...
  sizes: availableSizes,
  sizeStock: stockItems,
  totalStock,
  inStock,
};
```

---

## Использование в компонентах

### Выбор размера на странице товара

```tsx
function SizeSelector({ product }: { product: Product }) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="flex gap-2">
      {product.sizeStock?.map((item) => {
        const isAvailable = item.quantity > 0;
        const isLow = item.quantity > 0 && item.quantity <= 3;
        
        return (
          <button
            key={item.size}
            disabled={!isAvailable}
            onClick={() => setSelected(item.size)}
            className={cn(
              "px-4 py-2 border rounded-lg transition-all",
              selected === item.size && "border-gold bg-gold/10",
              !isAvailable && "opacity-30 cursor-not-allowed line-through",
              isLow && "border-orange-500/50"
            )}
          >
            {item.size}
            {isLow && <span className="text-[10px] text-orange-400 ml-1">×{item.quantity}</span>}
          </button>
        );
      })}
    </div>
  );
}
```

### Уменьшение количества при заказе

При создании заказа обновляй quantity в Directus:

```typescript
// В API checkout
async function decrementStock(productId: string, size: string, qty: number) {
  // Найди запись в products_sizes
  const res = await directusClient.request(
    `/items/products_sizes?filter[product_id][_eq]=${productId}&filter[size][_eq]=${size}`
  );
  
  const item = res.data[0];
  if (!item) throw new Error("Size not found");
  
  const newQty = Math.max(0, item.quantity - qty);
  
  await directusClient.request(`/items/products_sizes/${item.id}`, {
    method: "PATCH",
    body: JSON.stringify({ quantity: newQty }),
  });
}
```

---

## Миграция существующих данных

Если у тебя уже есть товары с полем `sizes: ["S","M","L"]`:

1. Создай junction-таблицу `products_sizes`
2. Напиши скрипт миграции:

```javascript
// scripts/migrate-sizes.js
const products = await directus.items('products').readByQuery({ limit: -1 });

for (const product of products.data) {
  if (!product.sizes?.length) continue;
  
  for (const size of product.sizes) {
    await directus.items('products_sizes').createOne({
      product_id: product.id,
      size: size,
      quantity: 10, // начальное количество
    });
  }
}
```

3. Удали старое поле `sizes` из коллекции products (опционально)

---

## Дополнительно: уведомления о низком остатке

В Directus можно настроить Flow:

1. **Trigger:** Item updated in `products_sizes`
2. **Condition:** `quantity <= 3 AND quantity > 0`
3. **Action:** Send email / webhook

Это позволит получать уведомления когда товар заканчивается.
