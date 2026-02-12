# Схема коллекций Directus для заказов

Чтобы заказы с сайта корректно попадали в Directus, создай две коллекции с **точно такими ключами полей** (Key). Имена полей в интерфейсе (надписи) могут быть любыми.

---

## 1. Коллекция `orders`

- **Ключ коллекции (API):** `orders`
- **Отображаемое имя:** например, «Orders» или «Заказы»

| Поле в интерфейсе | Ключ поля (API) | Тип        | Обязательное |
|-------------------|-----------------|------------|--------------|
| ID                | `id`            | Primary Key (auto) | да |
| Status            | `status`        | String     | нет          |
| Name              | `name`          | String     | да           |
| Email             | `email`         | String     | да           |
| Phone             | `phone`         | String     | нет          |
| Comment           | `comment`       | Text       | нет          |
| Total             | `total`         | Decimal / Float | да   |
| Date Created      | `date_created`  | Timestamp  | нет (авто)   |

При создании полей в Directus обязательно проверь, что **Key** совпадает с колонкой «Ключ поля (API)» (в нижнем регистре, без пробелов).

---

## 2. Коллекция `order_items`

- **Ключ коллекции (API):** `order_items`
- **Отображаемое имя:** например, «Order Items» или «Позиции заказа»

| Поле в интерфейсе | Ключ поля (API) | Тип              | Обязательное |
|-------------------|-----------------|------------------|--------------|
| ID                | `id`            | Primary Key (auto) | да |
| Order             | `order`         | Many to One → **orders** | да |
| Product           | `product`       | Many to One → **products** | нет |
| Product Slug      | `product_slug`  | String            | нет          |
| Product Name      | `product_name`  | String            | нет          |
| Size              | `size`          | String            | нет          |
| Qty               | `qty`           | Integer           | да           |
| Price             | `price`         | Decimal / Float   | да           |

- Связь **Order**: Many to One, коллекция `orders`. Поле в `order_items` должно называться именно `order` (ключ API).
- Связь **Product**: Many to One, коллекция `products`. Можно сделать необязательной, если заказы бывают и с мок-товарами без id в Directus.

При создании полей вручную в Directus в разделе «Поля и макет» после добавления поля открой его настройки и в поле **Key** (Ключ) укажи точное значение из таблицы (например `product_slug`, `product_name`).

---

## 3. Права для роли Storefront (или той, чей токен в `DIRECTUS_TOKEN`)

### Права на коллекции

- **orders:** Create, Read (при необходимости — Update).
- **order_items:** Create, Read (при необходимости — Update).

Без Create заказы и позиции создаваться не будут (403).

### Важно: права на поля (Field Permissions)

Если роль имеет Create на коллекции, но **отдельные поля** имеют ограничения — Directus примет запрос (200), но не сохранит значения в эти поля. В результате записи будут создаваться пустыми.

**Что сделать:**

1. Зайди в **Контроль доступа** (Access Control) → выбери роль Storefront.
2. Открой настройки прав для коллекции **order_items**.
3. Проверь, что для полей `order`, `product`, `product_slug`, `product_name`, `size`, `qty`, `price` стоит **«Использовать стандартные»** или **«Полный доступ»** (Full) при Create — не «Скрыть» и не «Только чтение».
4. Аналогично для **orders**: `name`, `email`, `phone`, `comment`, `total`, `status` должны разрешать запись при Create.

---

## 4. Переменные окружения (.env.local)

```env
DIRECTUS_URL=https://admin.voshod.shop
DIRECTUS_TOKEN=твой_токен_роли_с_правами_Create
DIRECTUS_ORDERS_NAME=orders
DIRECTUS_ORDER_ITEMS_NAME=order_items
```

Если имена коллекций совпадают с `orders` и `order_items`, переменные `DIRECTUS_ORDERS_NAME` и `DIRECTUS_ORDER_ITEMS_NAME` можно не задавать.

---

## 5. Формат запроса к Directus REST API

Для создания одной записи Directus ожидает тело запроса с **полями на верхнем уровне**, а не в обёртке `{ data: {...} }`:

```json
{ "order": 1, "product_slug": "tee-x", "product_name": "Tee", "size": "M", "qty": 1, "price": 1500 }
```

Наш код уже использует этот формат.

---

## 6. После создания коллекций

1. Сохрани настройки полей (в Directus всё сохраняется автоматически).
2. Выдай роли Storefront права Create (и Read) на `orders` и `order_items`.
3. Перезапусти приложение и оформи тестовый заказ — в Order Items должны заполниться `product_slug`, `product_name`, `size`, `qty`, `price` и связь `order`.
