# Схема Directus для VOSKHOD

Структура коллекций и полей, которые нужно создать в Directus для работы каталога и заказов.

---

## 1. Коллекция `collections` (коллекции товаров)

| Поле          | Тип       | Обязательное | Описание |
|---------------|-----------|--------------|----------|
| `id`          | UUID / Integer (PK) | да | Идентификатор |
| `slug`        | String    | да | Уникальный slug для URL (например `core`, `drop-001`) |
| `name`        | String    | да | Название (например «CORE», «DROP 001») |
| `description` | Text      | нет | Описание коллекции |
| `tag`         | String    | нет | Тег: `CORE`, `DROP`, `LIMITED`, `ARCHIVE`, `ACCESSORIES` |
| `label`       | String    | нет | Короткая подпись (например «Коллекция №1») |
| `coverImage`  | File (M2O → directus_files) | нет | Обложка коллекции |
| `isFeatured`  | Boolean   | нет | Показывать в блоке на главной |
| `sort`        | Integer   | нет | Порядок сортировки (меньше = выше) |

**Переменная окружения:** `DIRECTUS_COLLECTIONS_NAME=collections` (по умолчанию).

---

## 2. Коллекция `categories` (категории товаров, опционально)

Если используете отдельную коллекцию категорий:

| Поле  | Тип    | Описание |
|-------|--------|----------|
| `id`  | PK     | — |
| `slug`| String | **Обязательно латиница.** Допустимые значения: `tee`, `hoodie`, `patch`, `cap`, `lanyard`, `accessory`, `other`. От slug зависят фильтры в каталоге. |
| `name`| String | Название для админки (можно «Футболка»); на сайте в фильтре показывается по slug (TEE, HOODIE, …). |

В продуктах — связь **M2O на `categories`**. В запросах с фронта используется только `category.slug`.

**Важно:** если в slug указать кириллицу (например «Футболка»), в каталоге такая категория попадёт в «OTHER». Либо задайте slug латиницей (`tee`), либо в коде есть маппинг: «футболка» → tee, «худи» → hoodie и т.д.

Если категории не нужны, в продуктах можно сделать поле `category` типа String (dropdown) со значениями: tee, hoodie, patch, cap, accessory, other.

---

## 3. Коллекция `products` (товары)

| Поле         | Тип       | Обязательное | Описание |
|--------------|------------|--------------|----------|
| `id`         | UUID / Integer (PK) | да | Идентификатор |
| `slug`       | String     | да | Уникальный slug для URL (например `tee-voshod-black`) |
| `name`       | String     | да | Название товара |
| `description`| Text       | нет | Полное описание товара |
| `price`      | Decimal / Integer | да | Цена (в рублях) |
| `category`   | M2O → categories **или** String (dropdown) | нет | Категория: tee, hoodie, patch, cap, accessory, other |
| `collection`| M2O → collections | нет | Коллекция |
| `image`      | File (M2O → directus_files) | нет | Главное изображение |
| `images`     | Files (M2M → directus_files, Multiple) | нет | Галерея изображений (дополнительные фото) |
| `sizes`      | JSON / CSV | нет | Массив размеров, например `["S","M","L","XL"]` или `["ONE SIZE"]` |
| `inStock`    | Boolean    | нет | В наличии |
| `isFeatured` | Boolean    | нет | Показывать в блоке «Избранное» и т.п. |
| `code`       | String     | нет | Артикул (например `VS-TEE-001`) |
| `batch`      | String     | нет | Партия / батч |
| `color`      | String     | нет | Цвет товара (например «Black», «Graphite») |
| `fabric`     | String     | нет | Состав / материал (например «100% хлопок») |
| `density`    | String     | нет | Плотность (например «240 г/м²») |
| `print`      | String     | нет | Тип нанесения (шелкография, вышивка, 3D PVC и т.д.) |

**Важно:**
- В REST-запросах с фронта используются поля:  
  `id,slug,name,description,price,image,images.id,sizes,inStock,code,batch,isFeatured,color,fabric,density,print,category.slug,collection.id`
- Поле `images` в Directus — тип **Files & Images** с опцией **Allow Multiple**. В API возвращается массив объектов с `id` (UUID файла). Фронт собирает URL как `{DIRECTUS_URL}/assets/{id}`.

**Переменная окружения:** `DIRECTUS_PRODUCTS_NAME=products` (по умолчанию).

---

## 4. Коллекция `orders` (заказы)

| Поле     | Тип    | Описание |
|----------|--------|----------|
| `id`     | PK (Integer, Auto) | Идентификатор заказа |
| `name`   | String | Имя заказчика |
| `email`  | String | Email |
| `phone`  | String | Телефон (опционально) |
| `comment`| Text   | Комментарий к заказу |
| `total`  | Decimal/Integer | Сумма заказа (руб.) |
| `status` | String | Статус: `new`, `confirmed`, `shipped`, `cancelled` и т.д. |

**Переменная окружения:** `DIRECTUS_ORDERS_NAME=orders` (по умолчанию).

---

## 5. Коллекция `order_items` (позиции заказа)

| Поле           | Тип    | Описание |
|----------------|--------|----------|
| `id`           | PK     | — |
| `order`       | M2O → orders | Заказ |
| `product`     | M2O → products | Товар (может быть null для мок-товаров) |
| `product_slug`| String | Slug товара (дублируем для истории) |
| `product_name`| String | Название товара |
| `size`        | String | Выбранный размер |
| `qty`         | Integer| Количество |
| `price`       | Decimal/Integer | Цена за единицу на момент заказа |

**Переменная окружения:** `DIRECTUS_ORDER_ITEMS_NAME=order_items` (по умолчанию).

---

## Сводка по коллекциям

| Коллекция     | Назначение |
|---------------|------------|
| `collections` | Группы товаров (CORE, DROP и т.д.) |
| `categories`  | Опционально: категории товаров (tee, hoodie, …) |
| `products`    | Товары: фото, цвет, размеры, состав, артикул, описание |
| `orders`      | Заказы (контакты + сумма) |
| `order_items` | Строки заказа (товар, размер, кол-во, цена) |

---

## Переменные окружения для Next.js

```env
# Источник каталога: directus | mock
CATALOG_SOURCE=directus

# Directus
DIRECTUS_URL=https://admin.voshod.shop
DIRECTUS_TOKEN=...   # для чтения каталога (публичный или с правами) и записи заказов

# Имена коллекций (если отличаются от приведённых выше)
DIRECTUS_COLLECTIONS_NAME=collections
DIRECTUS_PRODUCTS_NAME=products
DIRECTUS_ORDERS_NAME=orders
DIRECTUS_ORDER_ITEMS_NAME=order_items
```

После создания полей в Directus убедитесь, что в **Products** есть поля `description`, `color`, `fabric`, `density`, `print`, `code`, `batch` и галерея `images` (Multiple Files). Тогда карточка товара и страница товара будут показывать все данные.
