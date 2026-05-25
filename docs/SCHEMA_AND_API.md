# Схема БД (Directus) и API

Полное описание коллекций Directus и эндпоинтов Next.js API.

---

## Часть 1. Схема БД (Directus)

### Переменные окружения для имён коллекций

| Переменная | По умолчанию | Описание |
|------------|--------------|----------|
| `DIRECTUS_COLLECTIONS_NAME` | `collections` | Коллекции товаров |
| `DIRECTUS_PRODUCTS_NAME` | `products` | Товары |
| `DIRECTUS_ORDERS_NAME` | `orders` | Заказы |
| `DIRECTUS_ORDER_ITEMS_NAME` | `order_items` | Позиции заказа |
| `DIRECTUS_PRODUCTS_SIZES_NAME` | `products_sizes` | Остатки по размерам |

---

### 1. Коллекция `collections` (коллекции товаров)

Группы товаров: CORE, DROP, LIMITED и т.д.

| Ключ поля (API) | Тип | Обязательное | Описание |
|-----------------|-----|---------------|----------|
| `id` | PK (UUID / Integer) | да | Идентификатор |
| `slug` | String | да | Slug для URL (`core`, `drop-001`) |
| `name` | String | да | Название («CORE», «DROP 001») |
| `description` | Text | нет | Описание коллекции |
| `tag` | String | нет | Тег: `CORE`, `DROP`, `LIMITED`, `ARCHIVE`, `ACCESSORIES` |
| `label` | String | нет | Короткая подпись («Коллекция №1») |
| `coverImage` | File (M2O → directus_files) | нет | Обложка |
| `isFeatured` | Boolean | нет | Показывать на главной |
| `sort` | Integer | нет | Порядок сортировки (меньше = выше) |

---

### 2. Коллекция `categories` (категории товаров)

| Ключ поля (API) | Тип | Обязательное | Описание |
|-----------------|-----|---------------|----------|
| `id` | PK | да | — |
| `slug` | String | да | Латиница: `tee`, `hoodie`, `patch`, `cap`, `lanyard`, `accessory`, `other` |
| `name` | String | да | Отображаемое название («Футболки», «Худи») |

В `products` — связь **M2O → categories**. Сайт запрашивает `category.slug`, `category.name`.

---

### 3. Коллекция `products` (товары)

| Ключ поля (API) | Тип | Обязательное | Описание |
|-----------------|-----|---------------|----------|
| `id` | PK (UUID / Integer) | да | Идентификатор |
| `slug` | String | да | Уникальный slug для URL |
| `name` | String | да | Название товара |
| `description` | Text | нет | Описание |
| `price` | Decimal / Integer | да | Цена (руб.) |
| `category` | M2O → categories или String (dropdown) | нет | Категория |
| `collection` | M2O → collections | нет | Коллекция |
| `image` | File (M2O → directus_files) | нет | Главное изображение |
| `images` | Files (M2M, Multiple) | нет | Галерея |
| `sizes` | JSON / CSV | нет | Массив размеров `["S","M","L","XL"]` или `["ONE SIZE"]` |
| `inStock` | Boolean | нет | В наличии |
| `isFeatured` | Boolean | нет | В блоке «Избранное» |
| `code` | String | нет | Артикул |
| `batch` | String | нет | Партия / батч |
| `color` | String | нет | Цвет |
| `fabric` | String | нет | Состав / материал |
| `density` | String | нет | Плотность (г/м²) |
| `print` | String | нет | Тип нанесения |
| `stock` | O2M → products_sizes | нет | Остатки по размерам (опционально) |

Запрашиваемые с фронта поля:  
`id,slug,name,description,price,image,images.directus_files_id,sizes,inStock,code,batch,isFeatured,color,fabric,density,print,category,category.slug,category.name,collection.id`

---

### 4. Коллекция `products_sizes` (остатки по размерам)

Одна строка = один размер одного товара + количество.

| Ключ поля (API) | Тип | Обязательное | Описание |
|-----------------|-----|---------------|----------|
| `id` | PK (UUID) | да | — |
| `product_id` | M2O → products | да | Товар (On delete: CASCADE) |
| `size` | String | да | S, M, L, XL, XXL, ONE SIZE |
| `quantity` | Integer | да | Остаток (default: 0, min: 0) |

Связь с `products`: в products поле **stock** (O2M), Related: `products_sizes`, FK: `product_id`.  
При успешной оплате заказа остатки списываются автоматически (webhook ЮКасса).

---

### 5. Коллекция `orders` (заказы)

| Ключ поля (API) | Тип | Обязательное | Описание |
|-----------------|-----|---------------|----------|
| `id` | PK (Integer, Auto) | да | Идентификатор заказа |
| `name` | String | да | Имя заказчика |
| `email` | String | да | Email |
| `phone` | String | нет | Телефон |
| `comment` | Text | нет | Комментарий |
| `total` | Decimal/Integer | да | Сумма (руб.), с доставкой |
| `status` | String | нет | См. таблицу статусов ниже |
| `date_created` | Timestamp | нет | Дата создания (авто) |
| `delivery_type` | String | нет | `pvz`, `postamat`, `courier` |
| `delivery_address` | Text | нет | Адрес доставки / ПВЗ |
| `cdek_pvz_code` | String | нет | Код ПВЗ СДЭК |
| `delivery_cost` | Integer | нет | Стоимость доставки (руб.) |
| `payment_id` | String | нет | ID платежа ЮКасса |
| `payment_status` | String | нет | `pending`, `succeeded`, `canceled` |

**Статусы заказа:** `new`, `pending_payment`, `paid`, `payment_failed`, `confirmed`, `shipped`, `delivered`, `cancelled`.

---

### 6. Коллекция `order_items` (позиции заказа)

| Ключ поля (API) | Тип | Обязательное | Описание |
|-----------------|-----|---------------|----------|
| `id` | PK | да | — |
| `order` | M2O → orders | да | Заказ |
| `product` | M2O → products | нет | Товар (может быть null) |
| `product_slug` | String | нет | Slug товара (для истории) |
| `product_name` | String | нет | Название товара |
| `size` | String | нет | Выбранный размер |
| `qty` | Integer | да | Количество |
| `price` | Decimal/Integer | да | Цена за единицу на момент заказа |

---

### Сводка коллекций

| Коллекция | Назначение |
|-----------|------------|
| `collections` | Группы товаров (CORE, DROP и т.д.) |
| `categories` | Категории (футболки, худи, патчи и т.д.) |
| `products` | Товары: фото, размеры, артикул, описание |
| `products_sizes` | Остатки по размерам, списание при оплате |
| `orders` | Заказы: контакты, сумма, доставка, платёж |
| `order_items` | Строки заказа: товар, размер, кол-во, цена |

---

## Часть 2. API (Next.js)

Базовый URL: `https://voshod.shop` (или `http://localhost:3000`). Все ответы — JSON.

---

### Заказы (без оплаты)

#### `POST /api/orders`

Создание заказа без платёжной интеграции (простая форма).

**Request body:**

```json
{
  "customer": {
    "name": "Иван Иванов",
    "email": "ivan@example.com",
    "phone": "+7 999 123-45-67",
    "comment": "Позвонить за час"
  },
  "cart": [
    {
      "product": { "id": "...", "slug": "tee-x", "name": "Tee", "price": 1500 },
      "size": "M",
      "qty": 2
    }
  ]
}
```

**Response 200:**

```json
{ "ok": true, "orderId": 123 }
```

**Errors:** `400` — INVALID_PAYLOAD; `500` — ORDER_FAILED.

---

### Чекаут (оплата ЮКасса + СДЭК)

#### `POST /api/checkout`

Создаёт заказ в Directus, платёж в ЮКасса, возвращает URL для оплаты.

**Request body:**

```json
{
  "customer": {
    "name": "Иван Иванов",
    "email": "ivan@example.com",
    "phone": "+7 999 123-45-67",
    "comment": ""
  },
  "cart": [
    {
      "product": { "id": "...", "slug": "tee-x", "name": "Tee", "price": 1500 },
      "size": "M",
      "qty": 2
    }
  ],
  "delivery": {
    "type": "pvz",
    "address": "г. Москва, ул. Примерная, 1",
    "cdekPvzCode": "MSK123",
    "cost": 350
  }
}
```

- `delivery.type`: `pvz` | `postamat` | `courier`
- `delivery.cost` — число (руб.), ≥ 0

**Response 200:**

```json
{
  "ok": true,
  "orderId": 123,
  "confirmationUrl": "https://yookassa.ru/checkout/..."
}
```

**Errors:** `400` — INVALID_PAYLOAD; `500` — PAYMENT_ERROR, CHECKOUT_FAILED.

---

### Платежи (webhook ЮКасса)

#### `POST /api/payments/webhook`

Вызывается ЮКасса при смене статуса платежа. Тело — событие ЮКасса (например `payment.succeeded`, `payment.canceled`). При `payment.succeeded` заказ переводится в статус `paid`, списываются остатки в `products_sizes`.

**Response 200:** `{ "ok": true }`  
**Errors:** `400` — INVALID_PAYLOAD; `403` — неверный IP (production); `500` — WEBHOOK_ERROR.

#### `GET /api/payments/webhook`

Проверка доступности: `{ "status": "ok", "service": "yookassa-webhook" }`.

---

### СДЭК: расчёт стоимости

#### `POST /api/cdek/calculate`

Расчёт стоимости доставки СДЭК.

**Request body:**

```json
{
  "toCityCode": 44,
  "tariffCode": "136",
  "packages": [
    { "weight": 500, "length": 30, "width": 20, "height": 10 }
  ]
}
```

- `toCityCode` — код города СДЭК (обязательно).
- `tariffCode` — опционально, по умолчанию тариф ПВЗ–ПВЗ.
- `packages` — опционально, по умолчанию один пакет с дефолтными размерами.

**Response 200:**

```json
{
  "ok": true,
  "delivery_sum": 350,
  "total_sum": 350,
  "period_min": 2,
  "period_max": 4,
  "currency": "RUB"
}
```

**Errors:** `400` — INVALID_PAYLOAD; `500` — CALCULATION_FAILED.

---

### СДЭК: поиск городов

#### `GET /api/cdek/cities?q=Моск`

Поиск городов СДЭК по подстроке (минимум 2 символа).

**Response 200:**

```json
{
  "ok": true,
  "cities": [
    { "code": 44, "name": "Москва" }
  ]
}
```

**Errors:** `400` — INVALID_QUERY; `500` — SEARCH_FAILED.

---

### СДЭК: прокси к API СДЭК

#### `POST /api/cdek/widget` (заменяет удалённый `/api/cdek/service`)

Прокси для виджета СДЭК (офисы, расчёт, города, регионы).

**Request body:**

```json
{
  "action": "offices",
  "params": { "city_code": 44, "type": "PVZ" }
}
```

Допустимые `action`: `offices`, `calculate`, `cities`, `regions`.  
**Response:** JSON от СДЭК API (без обёртки `ok`).

**Errors:** `400` — Unknown action; `500` — SERVICE_ERROR.

#### `GET /api/cdek/widget`

Проверка: `{ "status": "ok", "service": "cdek-proxy" }`.

---

### Отладка

#### `GET /api/debug/images`

Диагностика каталога и изображений: количество товаров, примеры картинок, проверка доступности первой картинки. Не для продакшена.

---

## Сводка API

| Метод | Путь | Назначение |
|-------|------|------------|
| POST | `/api/orders` | Создать заказ (без оплаты) |
| POST | `/api/checkout` | Чекаут: заказ + платёж ЮКасса, вернуть URL оплаты |
| POST | `/api/payments/webhook` | Webhook ЮКасса (оплата → статус заказа + списание остатков) |
| GET | `/api/payments/webhook` | Проверка webhook |
| POST | `/api/cdek/calculate` | Расчёт стоимости доставки СДЭК |
| GET | `/api/cdek/cities?q=...` | Поиск городов СДЭК |
| POST | `/api/cdek/widget` | Ограниченный адаптер для виджета СДЭК (offices, calculate, cities) |
| GET | `/api/cdek/widget` | Health check |
| GET | `/api/directus/assets/[id]` | Прокси изображений Directus без токена в URL |
| GET | `/api/debug/images` | Диагностика каталога/картинок |

Каталог (коллекции, товары) отдаётся через SSR/ISR из Directus, отдельного публичного REST API для каталога нет — данные подтягиваются в `catalog.listCollections()` и `catalog.listProducts()` на сервере.
