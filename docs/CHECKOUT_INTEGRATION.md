# Интеграция чекаута: ЮКасса + СДЭК

Пошаговая инструкция по настройке платежей и доставки для магазина РАССВЕТ.

---

## Содержание

1. [Структура модулей](#структура-модулей)
2. [Настройка ЮКасса](#настройка-юкасса)
3. [Настройка СДЭК](#настройка-сдэк)
4. [Настройка Яндекс.Карт](#настройка-яндекскарт)
5. [Переменные окружения](#переменные-окружения)
6. [Настройка Directus](#настройка-directus)
7. [Тестирование](#тестирование)
8. [Продакшен](#продакшен)

---

## Структура модулей

```
lib/
├── yookassa/           # Клиент ЮКасса API v3
│   ├── types.ts        # Типы платежей
│   ├── client.ts       # createPayment, getPayment, verifyWebhookIp
│   └── index.ts
├── cdek/               # Клиент СДЭК API v2
│   ├── types.ts        # Типы доставки, тарифы
│   ├── client.ts       # getToken, calculateTariff, getOffices
│   └── index.ts
├── checkout/           # Стейт чекаута
│   └── checkout-store.ts  # Zustand стор
└── orders/
    └── directus-orders.ts  # Создание/обновление заказов

app/api/
├── checkout/route.ts           # POST — создание заказа + платёж (серверная цена и доставка)
├── yookassa/webhook/route.ts   # POST — webhook от ЮKassa (канонический)
├── payments/webhook/route.ts   # POST — legacy alias webhook
├── directus/assets/[id]/       # GET — прокси файлов Directus без токена в URL
└── cdek/
    ├── calculate/route.ts      # POST — расчёт стоимости (предпросмотр)
    ├── cities/route.ts         # GET — поиск городов
    ├── offices/route.ts        # GET — ПВЗ
    └── widget/route.ts         # POST — ограниченный адаптер для виджета СДЭК

components/checkout/
├── CheckoutPageClient.tsx  # Главный компонент
├── CheckoutProgress.tsx    # Прогресс-бар
├── StepContacts.tsx        # Шаг 1: контакты
├── StepDelivery.tsx        # Шаг 2: выбор доставки
├── StepSummary.tsx         # Шаг 3: подтверждение
└── CdekMapWidget.tsx       # Виджет карты СДЭК
```

---

## Настройка ЮКасса

### 1. Регистрация магазина

1. Зайдите на [yookassa.ru](https://yookassa.ru/)
2. Зарегистрируйтесь и создайте магазин
3. Пройдите верификацию (потребуется ИП/ООО)

### 2. Получение ключей

В личном кабинете ЮКасса:

1. Перейдите в **Интеграция → Ключи API**
2. Скопируйте **shopId** (идентификатор магазина)
3. Создайте секретный ключ и скопируйте его

```env
YOOKASSA_SHOP_ID=123456
YOOKASSA_SECRET_KEY=test_xxxxxxxxxxxxxxxxxxxxx
```

### 3. Настройка Webhook

1. В личном кабинете перейдите в **Интеграция → HTTP-уведомления**
2. Добавьте URL: `https://voshod.shop/api/yookassa/webhook` (дубликат: `/api/payments/webhook`)
3. На production включите `TRUST_PROXY=true`, если запросы идут через nginx/Caddy, который **перезаписывает** `X-Forwarded-For`
4. Выберите события:
   - `payment.succeeded` — платёж завершён успешно
   - `payment.canceled` — платёж отменён

### 4. Тестовый режим

Для тестирования используйте тестовые ключи (начинаются с `test_`). В тестовом режиме можно использовать тестовые карты:

| Карта | Результат |
|-------|-----------|
| 5555 5555 5555 4477 | Успешный платёж |
| 5555 5555 5555 4444 | Отклонён банком |

---

## Настройка СДЭК

### 1. Регистрация интеграции

1. Зайдите на [cdek.ru](https://www.cdek.ru/)
2. В личном кабинете перейдите в **Интеграция**
3. Нажмите **«Создать ключ»**

### 2. Получение ключей

После создания ключа вы получите:

- **Идентификатор аккаунта** (Client ID)
- **Секретный ключ** (Client Secret)

```env
CDEK_CLIENT_ID=wqGwiQx0gg8mLtiEKsUinjVSICCjtTEP
CDEK_CLIENT_SECRET=RmAmgvSgSl1yirlz9QupbzOJVqhCxcP5
```

### 3. Город отправления

Укажите код города, из которого будете отправлять заказы:

```env
CDEK_FROM_CITY_CODE=44  # 44 = Москва
```

Коды городов можно найти через [API СДЭК](https://api-docs.cdek.ru/36982648.html) или использовать:

| Город | Код |
|-------|-----|
| Москва | 44 |
| Санкт-Петербург | 137 |
| Новосибирск | 270 |
| Екатеринбург | 245 |

---

## Настройка Яндекс.Карт

Виджет СДЭК использует Яндекс.Карты для отображения ПВЗ.

### 1. Получение API-ключа

1. Зайдите в [Кабинет Разработчика Яндекс](https://developer.tech.yandex.ru/)
2. Нажмите **«Получить ключ»**
3. Выберите сервис: **«JavaScript API и HTTP Геокодер»**
4. Заполните форму (укажите адрес сайта)
5. Скопируйте созданный ключ

### 2. Настройка HTTP Referer

**Важно:** для безопасности задайте HTTP Referer:

1. В кабинете разработчика найдите созданный ключ
2. Нажмите **«Редактировать»**
3. В поле **HTTP Referer** укажите:
   - `https://voshod.shop/*` (для продакшена)
   - `http://localhost:3000/*` (для разработки)

```env
NEXT_PUBLIC_YANDEX_MAPS_API_KEY=ваш-ключ-яндекс-карт
```

---

## Переменные окружения

### Полный список для `.env.local`

```env
# ============================================
# DIRECTUS (база данных)
# ============================================
CATALOG_SOURCE=directus
DIRECTUS_URL=https://admin.voshod.shop
DIRECTUS_TOKEN=ваш-токен-directus

# ============================================
# ЮКАССА (платежи)
# ============================================
# Получить в личном кабинете: https://yookassa.ru/my/merchant/integration/api-keys
YOOKASSA_SHOP_ID=123456
YOOKASSA_SECRET_KEY=live_xxxxxxxxxxxxxxxxxxxxx
# YOOKASSA_RETURN_URL=https://voshod.shop/checkout/success
# YOOKASSA_WEBHOOK_IP_ALLOWLIST_ENABLED=true
# YOOKASSA_RECEIPT_ENABLED=false
# TRUST_PROXY=true

# ============================================
# СДЭК (доставка)
# ============================================
# Получить в личном кабинете: Интеграция → Создать ключ
CDEK_CLIENT_ID=ваш-client-id
CDEK_CLIENT_SECRET=ваш-client-secret
CDEK_FROM_CITY_CODE=44

# ============================================
# ЯНДЕКС.КАРТЫ (для виджета СДЭК)
# ============================================
# Получить: https://developer.tech.yandex.ru/
NEXT_PUBLIC_YANDEX_MAPS_API_KEY=ваш-ключ-яндекс-карт

# ============================================
# URL САЙТА
# ============================================
NEXT_PUBLIC_SITE_URL=https://voshod.shop
```

### Для локальной разработки

Для тестирования webhook локально используйте [ngrok](https://ngrok.com/):

```bash
ngrok http 3000
```

Затем укажите ngrok URL в настройках webhook ЮКасса и в `NEXT_PUBLIC_SITE_URL`.

---

## Настройка Directus

### Добавьте поля в коллекцию `orders`

| Поле | Тип | Описание |
|------|-----|----------|
| `delivery_type` | String | `pvz`, `postamat`, `courier` |
| `delivery_address` | Text | Полный адрес доставки |
| `cdek_pvz_code` | String | Код ПВЗ СДЭК |
| `delivery_cost` | Integer | Стоимость доставки (руб.) |
| `payment_id` | String | ID платежа ЮКасса |
| `payment_status` | String | `pending`, `succeeded`, `canceled` |

### Статусы заказа

Обновите dropdown для поля `status`:

- `new` — новый (без онлайн-оплаты)
- `pending_payment` — ожидает оплаты
- `paid` — оплачен
- `payment_failed` — ошибка оплаты
- `confirmed` — подтверждён
- `shipped` — отправлен
- `delivered` — доставлен
- `cancelled` — отменён

---

## Тестирование

### 1. Проверка СДЭК API

```bash
# Проверить расчёт доставки
curl -X POST http://localhost:3000/api/cdek/calculate \
  -H "Content-Type: application/json" \
  -d '{"toCityCode": 137, "tariffCode": 136}'
```

### 2. Проверка ЮКасса

1. Используйте тестовые ключи ЮКасса
2. Оформите тестовый заказ
3. На странице оплаты используйте тестовую карту
4. Проверьте webhook: статус заказа должен измениться на `paid`

### 3. Проверка виджета СДЭК

1. Откройте `/checkout`
2. Заполните контакты и перейдите к шагу доставки
3. Введите город в поиск виджета
4. Выберите ПВЗ на карте или из списка
5. Нажмите «Выбрать» — стоимость и срок должны отобразиться

---

## Продакшен

### Чеклист перед запуском

- [ ] Заменить тестовые ключи ЮКасса на боевые (`live_`)
- [ ] Настроить webhook URL на продакшен домен
- [ ] Проверить HTTP Referer в ключе Яндекс.Карт
- [ ] Добавить все поля в Directus
- [ ] Проверить права токена Directus (read + create + update для orders)
- [ ] Настроить SSL (HTTPS обязателен для ЮКасса)

### PM2 / systemd

Переменные окружения можно задать в:

**PM2 (ecosystem.config.js):**
```javascript
module.exports = {
  apps: [{
    name: 'voshod-web',
    script: 'npm',
    args: 'start',
    env: {
      YOOKASSA_SHOP_ID: '...',
      YOOKASSA_SECRET_KEY: '...',
      // ...
    }
  }]
};
```

**systemd:**
```ini
[Service]
Environment="YOOKASSA_SHOP_ID=..."
Environment="YOOKASSA_SECRET_KEY=..."
```

---

## Поддержка

### ЮКасса
- Документация: [yookassa.ru/developers](https://yookassa.ru/developers)
- Поддержка: support@yookassa.ru

### СДЭК
- Документация API: [api-docs.cdek.ru](https://api-docs.cdek.ru/)
- Виджет: [github.com/cdek-it/widget](https://github.com/cdek-it/widget)
- Поддержка: integrator@cdek.ru

### Яндекс.Карты
- Документация: [yandex.ru/dev/jsapi30](https://yandex.ru/dev/jsapi30/doc/ru/)
