# Развёртывание VOSKHOD на сервере

Пошаговая инструкция: Directus + Next.js на Ubuntu 22.04.

---

## 1. Подготовка сервера

### 1.1 Установка софта (если ещё не установлен)

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Node.js 20 LTS (через NodeSource)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Docker и Docker Compose
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
# Выйти и зайти снова, чтобы группа docker применилась

# PM2
sudo npm install -g pm2

# Nginx
sudo apt install -y nginx
```

### 1.2 Создание пользователя (опционально)

```bash
sudo adduser deploy
sudo usermod -aG docker deploy
sudo usermod -aG sudo deploy
```

---

## 2. Directus (Docker)

### 2.1 Клонирование / копирование файлов

Скопируй папку `deploy/directus/` на сервер (через git, scp или rsync).

### 2.2 Настройка Directus

```bash
cd /home/deploy/directus   # или путь к deploy/directus

# Создай .env из примера
cp .env.example .env
nano .env
```

**Заполни .env:**

```
POSTGRES_PASSWORD=<сложный_пароль_для_postgres>
KEY=$(openssl rand -hex 32)        # сгенерируй и вставь
SECRET=$(openssl rand -hex 32)     # сгенерируй и вставь
ADMIN_EMAIL=admin@voshod.shop
ADMIN_PASSWORD=<сложный_пароль_для_admin>
PUBLIC_URL=https://admin.voshod.shop
```

### 2.3 Запуск Directus

```bash
docker compose up -d
docker compose ps
```

Directus будет доступен на порту 8055. Проверь: `http://IP_СЕРВЕРА:8055`

### 2.4 Настройка Directus после первого входа

1. Войди в админку (ADMIN_EMAIL / ADMIN_PASSWORD).
2. Создай коллекции по `DIRECTUS_SCHEMA.md` и `docs/DIRECTUS_ORDERS_SCHEMA.md`:
   - `collections`, `products`, `categories` (опционально)
   - `orders`, `order_items`
3. Создай роль «Storefront» с правами Read на каталог и Create на orders/order_items.
4. Создай API-токен для этой роли и сохрани — он пойдёт в `DIRECTUS_TOKEN` для Next.js.

---

## 3. Next.js (voshod-web)

### 3.1 Развёртывание проекта

```bash
cd /home/deploy/voshod-web   # путь к проекту

# Установка зависимостей
npm ci

# Переменные окружения
cp .env.example .env.local
nano .env.local
```

**Заполни .env.local:**

```
CATALOG_SOURCE=directus
DIRECTUS_URL=https://admin.voshod.shop
DIRECTUS_TOKEN=<токен_из_Directus>
```

### 3.2 Сборка и запуск через PM2

```bash
npm run build
pm2 start ecosystem.config.cjs

# Автозапуск при перезагрузке сервера
pm2 startup
pm2 save
```

Проверь: `http://IP_СЕРВЕРА:3000`

---

## 4. Nginx + SSL (Let's Encrypt)

### 4.1 Получение SSL-сертификата

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot certonly --nginx -d voshod.shop -d www.voshod.shop -d admin.voshod.shop
```

Сертификаты будут в `/etc/letsencrypt/live/voshod.shop/`.

### 4.2 Подключение конфига Nginx

```bash
sudo cp /home/deploy/voshod-web/deploy/nginx/voshod.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/voshod.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4.3 DNS

Создай A-записи для домена:
- `voshod.shop` → IP сервера
- `www.voshod.shop` → IP сервера
- `admin.voshod.shop` → IP сервера

---

## 5. Обновление проекта (учёт локальных правок на сервере)

Если вносил правки на сервере, перед обновлением:

```bash
# Сохранить локальные правки (если нужны)
git stash push -m "server edits"

# Подтянуть из репо
git pull origin main

# Сборка
npm install   # или npm ci, если lock file синхронизирован
npm run build
pm2 restart voshod-web
```

Или сбросить локальные правки и взять версию из репо:

```bash
git fetch origin
git reset --hard origin/main
npm install && npm run build && pm2 restart voshod-web
```

---

## 6. Полезные команды

| Действие | Команда |
|----------|---------|
| Логи Next.js | `pm2 logs voshod-web` |
| Перезапуск Next.js | `pm2 restart voshod-web` |
| Статус Directus | `cd deploy/directus && docker compose ps` |
| Логи Directus | `docker compose logs -f directus` |
| Обновление (без локальных правок) | `git reset --hard origin/main && npm install && npm run build && pm2 restart voshod-web` |

---

## 7. Структура портов

| Сервис | Порт | Внутренний адрес |
|--------|------|------------------|
| Next.js | 3000 | http://127.0.0.1:3000 |
| Directus | 8055 | http://127.0.0.1:8055 |
| PostgreSQL | 5432 | Только внутри Docker |

---

## 8. Бэкапы Directus

```bash
# Бэкап PostgreSQL
docker exec directus-postgres pg_dump -U directus directus > backup_$(date +%Y%m%d).sql

# Бэкап загрузок
tar -czvf directus_uploads_$(date +%Y%m%d).tar.gz -C /var/lib/docker/volumes/... directus_uploads
```
