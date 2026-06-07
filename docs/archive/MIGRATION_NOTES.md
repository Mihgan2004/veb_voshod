# Migration notes: inventory & checkout hardening

## Atomic stock decrement (recommended)

The default path uses **Directus REST** read-modify-write on `products_sizes`. That prevents **double decrement for the same paid order** (via `stock_decremented_at` and optional lock fields) but does **not** guarantee atomicity when two different orders buy the last unit at the same time.

### Option A: PostgreSQL (implemented)

Set in Next.js environment:

```env
DIRECTUS_DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/directus
# optional, default products_sizes
DIRECTUS_PRODUCTS_SIZES_TABLE=products_sizes
```

Requires network access from the app to the Directus Postgres instance. On finalize after payment, stock lines use:

```sql
UPDATE products_sizes
SET quantity = quantity - $qty
WHERE product_id::text = $id AND size = $size AND quantity >= $qty
RETURNING id, quantity;
```

### Option B: Directus custom endpoint / Flow

Create a Directus extension or Flow that runs stock decrement inside a single DB transaction and call it from `decrementStockForOrder` instead of REST PATCH.

### Option C: Accept oversell risk

Leave `DIRECTUS_DATABASE_URL` unset and monitor `stock_error` on orders (optional Directus field).

## Directus fields to verify manually

| Collection | Field | Notes |
|------------|-------|-------|
| orders | `cdek_bill_url` | Rename from `cdek_waybill_url` if old name exists |
| orders | `stock_error` | Optional text for failed decrement |
| orders | `cdek_city_code`, `cdek_pvz_code` | Nullable if you support yandex/ozon without CDEK codes |
| orders | `stock_decrement_lock_id`, `stock_decrement_lock_at` | Optional, for multi-replica locks |

## Assets

Product images use `/api/directus/assets/:id` (server proxy). Ensure `DIRECTUS_URL` and `DIRECTUS_TOKEN` are set on the Next.js server. Alternatively make Directus Files public and switch `assetUrl` to direct `/assets/` URLs.

## CDEK widget

The open proxy `/api/cdek/service` was removed. The map widget uses `/api/cdek/widget` (whitelist: `offices`, `calculate`, `cities` only).
