# Деплой VOSKHOD: пошаговая инструкция (от root на сервере)

Ты на сервере `ubuntu@ubuntu-std2-2-8-40gb`, залогинен как root. Ниже — команды по порядку.

---

## Шаг 0. Проверка окружения

```bash
# Проверь, что ты root
whoami
# root

# Проверь Ubuntu
lsb_release -a
# Ubuntu 22.04 или 24.04
```

---

## Шаг 1. Установка софта

Выполняй по порядку:

```bash
# 1. Обновление пакетов
apt update && apt upgrade -y

# 2. Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Проверь:
node -v   # v20.x.x
npm -v

# 3. Docker
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker

# 4. PM2
npm install -g pm2

# 5. Nginx
apt install -y nginx

# 6. Git (если проект будет клонироваться)
apt install -y git
```

---

## Шаг 2. Подготовка директорий

```bash
mkdir -p /home/ubuntu/voshod
cd /home/ubuntu/voshod
```

Далее — два варианта: **через Git** или **через scp/rsync**.

### Вариант A: Клонирование через Git

```bash
cd /home/ubuntu/voshod
git clone <URL_ТВОЕГО_РЕПОЗИТОРИЯ> voshod-web
cd voshod-web
```

### Вариант B: Копирование с локальной машины (с Windows/WSL)

**На твоём компьютере** (PowerShell или WSL):

```powershell
# Через SCP (замени IP на IP твоего сервера, путь к ключу — твой)
scp -i "C:\Users\alant\Downloads\kwvpz493.pem" -r "\\wsl.localhost\Ubuntu\home\alantrei\projects\voshod-web" ubuntu@94.20.229.240:/home/ubuntu/voshod/
```

Или через rsync (в WSL):

```bash
rsync -avz -e "ssh -i /mnt/c/Users/alant/Downloads/kwvpz493.pem" \
  /home/alantrei/projects/voshod-web/ \
  ubuntu@94.20.229.240:/home/ubuntu/voshod/voshod-web/
```

**На сервере** после копирования:

```bash
cd /home/ubuntu/voshod/voshod-web
```

---

## Шаг 3. Directus (Docker)

### 3.1 Создание конфигов Directus

```bash
cd /home/ubuntu/voshod/voshod-web/deploy/directus

# Создай .env
cp .env.example .env
nano .env
```

**Содержимое .env** (замени значения):

```
POSTGRES_PASSWORD=СложныйПароль123!
KEY=вставь_32_символа_hex
SECRET=вставь_32_символа_hex
ADMIN_EMAIL=admin@voshod.shop
ADMIN_PASSWORD=СложныйПароль456!
PUBLIC_URL=https://admin.voshod.shop
```

Сгенерировать KEY и SECRET:

```bash
openssl rand -hex 32
openssl rand -hex 32
```

Вставь результаты в KEY и SECRET в .env.

### 3.2 Запуск Directus

```bash
cd /home/ubuntu/voshod/voshod-web/deploy/directus
docker compose up -d
```

Проверка:

```bash
docker compose ps
# directus и directus-postgres должны быть Up

curl -s http://127.0.0.1:8055/server/health
# {"status":"ok"} или подобное
```

Directus доступен на `http://IP_СЕРВЕРА:8055`. Открой в браузере и войди (ADMIN_EMAIL / ADMIN_PASSWORD).

### 3.3 Настройка Directus (в веб-интерфейсе)

1. Войди в админку.
2. Создай коллекции по `DIRECTUS_SCHEMA.md` и `docs/DIRECTUS_ORDERS_SCHEMA.md`:
   - **collections** (коллекции товаров)
   - **products** (товары)
   - **orders** (заказы)
   - **order_items** (позиции заказа)
3. Создай роль «Storefront»:
   - Read на collections, products
   - Create + Read на orders, order_items
4. Создай токен API для роли Storefront → скопируй его для `.env.local` Next.js.

---

## Шаг 4. Next.js (voshod-web)

### 4.1 Установка зависимостей и переменные

```bash
cd /home/ubuntu/voshod/voshod-web

# Установка зависимостей
npm ci

# Создай .env.local
cp .env.example .env.local
nano .env.local
```

**Содержимое .env.local**:

```
CATALOG_SOURCE=directus
DIRECTUS_URL=https://admin.voshod.shop
DIRECTUS_TOKEN=твой_токен_из_Directus
```

> Если домен ещё не настроен, используй `http://IP_СЕРВЕРА:8055` вместо `https://admin.voshod.shop`. После настройки DNS и SSL замени на `https://admin.voshod.shop`.
>
> **Важно:** если Directus доступен по IP, добавь в `next.config.ts` в `images.remotePatterns` строку:  
> `{ protocol: "http", hostname: "ТВОЙ_IP", pathname: "/assets/**" }`  
> Иначе изображения товаров из Directus не загрузятся.

### 4.2 Сборка и запуск

```bash
cd /home/ubuntu/voshod/voshod-web
npm run build
```

Если сборка прошла успешно:

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
# Выполни команду, которую выведет pm2 startup (sudo env PATH=...)
```

Проверка:

```bash
pm2 status
curl -s http://127.0.0.1:3000 | head -20
```

Сайт доступен на `http://IP_СЕРВЕРА:3000`.

---

## Шаг 5. Nginx и SSL (когда домен указывает на сервер)

### 5.1 DNS

Создай A-записи для домена voshod.shop:
- `voshod.shop` → IP сервера
- `www.voshod.shop` → IP сервера  
- `admin.voshod.shop` → IP сервера

### 5.2 SSL (Let's Encrypt)

```bash
apt install -y certbot python3-certbot-nginx
certbot certonly --nginx -d voshod.shop -d www.voshod.shop -d admin.voshod.shop
```

### 5.3 Конфиг Nginx

```bash
cp /home/ubuntu/voshod/voshod-web/deploy/nginx/voshod.conf /etc/nginx/sites-available/
ln -sf /etc/nginx/sites-available/voshod.conf /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

Убери дефолтный сайт, если мешает:

```bash
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
```

---

## Шаг 6. Доступ по IP до настройки DNS (временный Nginx)

Пока DNS не настроен, можно проксировать через Nginx по IP:

```bash
# Создай временный конфиг
cat > /etc/nginx/sites-available/voshod-ip << 'EOF'
server {
    listen 80;
    server_name _;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    location /directus/ {
        rewrite ^/directus/(.*)$ /$1 break;
        proxy_pass http://127.0.0.1:8055;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

ln -sf /etc/nginx/sites-available/voshod-ip /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
```

Тогда:
- `http://IP/` → Next.js
- `http://IP/directus/` → Directus (осторожно: Directus может ожидать PUBLIC_URL без подпути)

Проще всего до настройки DNS открывать:
- `http://IP:3000` — сайт
- `http://IP:8055` — Directus

И временно открыть порты 3000 и 8055 в файрволе (если используется):

```bash
ufw allow 80
ufw allow 443
ufw allow 3000
ufw allow 8055
ufw enable
```

---

## Шаг 7. Полезные команды

| Задача | Команда |
|--------|---------|
| Логи Next.js | `pm2 logs voshod-web` |
| Перезапуск Next.js | `pm2 restart voshod-web` |
| Статус Directus | `cd /home/ubuntu/voshod/voshod-web/deploy/directus && docker compose ps` |
| Логи Directus | `docker compose logs -f directus` |
| Обновление проекта | `cd /home/ubuntu/voshod/voshod-web && git pull && npm ci && npm run build && pm2 restart voshod-web` |

---

## Чеклист перед продакшеном

- [ ] `.env` Directus: сложные пароли, уникальные KEY/SECRET
- [ ] `.env.local` Next.js: DIRECTUS_TOKEN от роли Storefront
- [ ] Directus: коллекции и права настроены
- [ ] DNS: voshod.shop и admin.voshod.shop указывают на сервер
- [ ] SSL: сертификаты получены
- [ ] Nginx: используется HTTPS-конфиг
- [ ] PM2: `pm2 startup` выполнен
- [ ] Файрвол: открыты только 80 и 443 (3000 и 8055 только localhost)
