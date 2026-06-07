# Схема Directus для РАССВЕТ

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

| Поле              | Тип              | Описание |
|-------------------|------------------|----------|
| `id`              | PK (Integer, Auto) | Идентификатор заказа |
| `name`            | String           | Имя заказчика |
| `email`           | String           | Email |
| `phone`           | String           | Телефон (опционально) |
| `comment`         | Text             | Комментарий к заказу |
| `total`           | Decimal/Integer  | Сумма заказа (руб.), включая доставку |
| `status`          | String           | Статус: `new`, `pending_payment`, `paid`, `payment_failed`, `confirmed`, `shipped`, `delivered`, `cancelled` |
| `delivery_type`   | String           | Тип доставки: `pvz`, `postamat`, `courier` |
| `delivery_address`| Text             | Полный адрес доставки или ПВЗ |
| `cdek_pvz_code`   | String           | Код пункта выдачи СДЭК (для ПВЗ/постамат) |
| `delivery_cost`   | Integer          | Стоимость доставки (руб.) |
| `payment_id`      | String           | ID платежа в ЮКасса |
| `payment_status`  | String           | Статус платежа: `pending`, `succeeded`, `canceled` |

**Статусы заказа:**
- `new` — новый заказ (для ручной обработки, без оплаты онлайн)
- `pending_payment` — ожидает оплаты
- `paid` — оплачен
- `payment_failed` — ошибка оплаты
- `confirmed` — подтверждён, готовится к отправке
- `shipped` — отправлен
- `delivered` — доставлен
- `cancelled` — отменён

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

# ЮКасса (платежи)
YOOKASSA_SHOP_ID=...          # ID магазина в ЮКасса
YOOKASSA_SECRET_KEY=...       # Секретный ключ API

# СДЭК API v2 (доставка)
CDEK_CLIENT_ID=...            # Client ID из личного кабинета СДЭК
CDEK_CLIENT_SECRET=...        # Client Secret
CDEK_FROM_CITY_CODE=44        # Код города отправления (44 = Москва)

# URL сайта (для return_url и webhook)
NEXT_PUBLIC_SITE_URL=https://voshod.shop
```

После создания полей в Directus убедитесь, что в **Products** есть поля `description`, `color`, `fabric`, `density`, `print`, `code`, `batch` и галерея `images` (Multiple Files). Тогда карточка товара и страница товара будут показывать все данные.

### Изображения и категории на главной

- **Коллекции (coverImage):** поле `coverImage` в коллекции — тип **File** (M2O → directus_files). Загрузи обложку и выбери её в записи. URL будет `{DIRECTUS_URL}/assets/{id}`.
- **Категории:** в **products** поле `category` — либо **String** (dropdown: tee, hoodie, patch, cap, accessory, other), либо **M2O → categories** с полем `slug`. Категории для фильтра в каталоге берутся из товаров.
- **На главной** отображаются коллекции с `isFeatured: true`, отсортированные по `sort`. При ошибке Directus показываются статичные коллекции.

---

## Интеграции

### ЮКасса (платежи)

1. Зарегистрируйтесь в [ЮКасса](https://yookassa.ru/) и создайте магазин
2. В личном кабинете получите `shopId` и `secretKey`
3. Настройте webhook URL: `https://voshod.shop/api/payments/webhook`
4. Выберите события для webhook: `payment.succeeded`, `payment.canceled`

### СДЭК (доставка)

1. Зарегистрируйтесь в [СДЭК](https://www.cdek.ru/ru/integration/) для получения API v2
2. В личном кабинете получите `Client ID` и `Client Secret`
3. Определите код города отправления (по умолчанию 44 = Москва)

### Webhook ЮКасса

Webhook URL для настройки в личном кабинете ЮКасса:
```
POST https://voshod.shop/api/payments/webhook
```

ЮКасса отправляет события:
- `payment.succeeded` — платёж успешно завершён → заказ переходит в статус `paid`
- `payment.canceled` — платёж отменён → заказ переходит в статус `payment_failed`
