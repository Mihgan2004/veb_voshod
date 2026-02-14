# Чеклист проверки и оптимизации VOSKHOD

## Сделано

### Изображения
- **Next.js Image Optimization** — включена для картинок из Directus и picsum.photos (хосты в `remotePatterns`)
- **remotePatterns** — добавлены localhost и 127.0.0.1 для теста до настройки DNS
- **Compress** — gzip/brotli включён в next.config

### Каталог и API
- **ISR** — `revalidate = 60` на страницах каталога, коллекций и товаров
- **generateStaticParams** — пререндер страниц при сборке
- **Fallback** — при ошибке Directus используется mock-данные

### Заказы
- API `/api/orders` — валидация payload, создание в Directus
- `product` в order_items — null для мок-товаров (строковые id)

## Что проверить перед деплоем

1. **DIRECTUS_TOKEN** — токен роли с Create на orders и order_items
2. **Права полей** в Directus — не «Скрыть» для order_items при Create
3. **PUBLIC_URL** в Directus — совпадает с доменом (https://admin.voshod.shop)
4. **CORS** — Directus по умолчанию разрешает запросы; при кастомном домене проверь настройки

## Рекомендации при ограниченных ресурсах (4 ГБ RAM)

- Оставить `unoptimized` для LookbookSlider (9 AVIF) — уже сжаты, экономия CPU
- При необходимости отключить image optimization для части компонентов через `unoptimized={true}`
