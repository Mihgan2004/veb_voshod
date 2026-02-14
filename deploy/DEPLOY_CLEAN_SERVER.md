# Деплой с нуля: чистый сервер → работающий voshod.shop

Ты на чистом Ubuntu-сервере. IP: **146.185.210.216**.  
DNS уже настроен: @, www, admin, api, studio, supabase → 146.185.210.216.

---

## Порядок действий

1. Подключиться к серверу по SSH  
2. Установить софт (Node, Docker, Nginx, PM2, Git)  
3. Скопировать проект на сервер  
4. Запустить Directus (Docker)  
5. Запустить Next.js (PM2)  
6. Настроить SSL и Nginx  
7. Проверить работу  

---

## Шаг 0. Подключение к серверу

**На своём компьютере** (PowerShell или WSL). Ключ — тот, что скачал при создании ВМ (например `ubuntu-STD2-2-8-40GB-kwvpz493.pem`):

```bash
ssh -i "путь/к/твоему/ключу.pem" ubuntu@146.185.210.216
```

> Если юзер при создании ВМ был `ubuntu` — используй `ubuntu`. Если root — `root@146.185.210.216`.

После входа ты в консоли сервера. Все следующие команды выполняются **на сервере**.

---

## Шаг 1. Обновление системы

```bash
sudo apt update && sudo apt upgrade -y
```

---

## Шаг 2. Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

Проверка:
```bash
node -v
npm -v
```

---

## Шаг 3. Docker

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo systemctl enable docker
sudo systemctl start docker
```

Проверка:
```bash
sudo docker run hello-world
```

---

## Шаг 4. PM2

```bash
sudo npm install -g pm2
```

---

## Шаг 5. Nginx

```bash
sudo apt install -y nginx
```

---

## Шаг 6. Git (если будешь клонировать репо)

```bash
sudo apt install -y git
```

---

## Шаг 7. Создание папок и копирование проекта

### Вариант A: Клонирование через Git

```bash
sudo mkdir -p /home/ubuntu/voshod
sudo chown ubuntu:ubuntu /home/ubuntu/voshod
cd /home/ubuntu/voshod
git clone https://github.com/ТВОЙ_USER/voshod-web.git
cd voshod-web
```

### Вариант B: Копирование с компьютера (scp/rsync)

**На твоём компьютере** (WSL):

```bash
rsync -avz -e "ssh -i /mnt/c/Users/alant/Downloads/ТВОЙ_КЛЮЧ.pem" \
  /home/alantrei/projects/voshod-web/ \
  ubuntu@146.185.210.216:/home/ubuntu/voshod/voshod-web/
```

**На сервере**:

```bash
cd /home/ubuntu/voshod/voshod-web
```

---

## Шаг 8. Directus

### 8.1 Создать .env

```bash
cd /home/ubuntu/voshod/voshod-web/deploy/directus
cp .env.example .env
nano .env
```

Заполни:
```
POSTGRES_PASSWORD=ПридумайСложныйПароль123!
KEY=сюда_32_символа_hex
SECRET=сюда_другие_32_символа_hex
ADMIN_EMAIL=admin@voshod.shop
ADMIN_PASSWORD=ПарольАдминки456!
PUBLIC_URL=https://admin.voshod.shop
```

Сгенерировать KEY и SECRET:
```bash
openssl rand -hex 32
openssl rand -hex 32
```
Вставь результаты в KEY и SECRET.

Сохрани файл: `Ctrl+O`, Enter, `Ctrl+X`.

### 8.2 Запустить Directus

```bash
cd /home/ubuntu/voshod/voshod-web/deploy/directus
sudo docker compose up -d
```

Проверка:
```bash
sudo docker compose ps
curl -s http://127.0.0.1:8055/server/health
```

---

## Шаг 9. Next.js

### 9.1 Установить зависимости и .env.local

```bash
cd /home/ubuntu/voshod/voshod-web
npm ci
cp .env.example .env.local
nano .env.local
```

Заполни:
```
CATALOG_SOURCE=directus
DIRECTUS_URL=https://admin.voshod.shop
DIRECTUS_TOKEN=
```

> `DIRECTUS_TOKEN` пока оставь пустым. Создашь токен в Directus после первого входа (см. шаг 10), потом вернёшься и допишешь.

Сохрани: `Ctrl+O`, Enter, `Ctrl+X`.

### 9.2 Собрать и запустить

```bash
cd /home/ubuntu/voshod/voshod-web
npm run build
```

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

Скопируй и выполни команду, которую выведет `pm2 startup` (начинается с `sudo env PATH=...`).

Проверка:
```bash
pm2 status
curl -s http://127.0.0.1:3000 | head -5
```

---

## Шаг 10. SSL (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot certonly --nginx \
  -d voshod.shop \
  -d www.voshod.shop \
  -d admin.voshod.shop \
  -d api.voshod.shop \
  -d studio.voshod.shop \
  -d supabase.voshod.shop
```

Введи email и согласись с условиями. Сертификаты появятся в `/etc/letsencrypt/live/voshod.shop/`.

---

## Шаг 11. Nginx

### 11.1 Убрать дефолтный сайт и подключить конфиг voshod

```bash
sudo rm -f /etc/nginx/sites-enabled/default
sudo cp /home/ubuntu/voshod/voshod-web/deploy/nginx/voshod.conf /etc/nginx/sites-available/
sudo ln -sf /etc/nginx/sites-available/voshod.conf /etc/nginx/sites-enabled/
```

### 11.2 Проверить и перезагрузить

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## Шаг 12. Готово. Первый вход в Directus

Проверь в браузере:
- **https://voshod.shop** — сайт
- **https://www.voshod.shop** — сайт
- **https://admin.voshod.shop** — админка Directus
- **https://api.voshod.shop** — редирект на voshod.shop (зарезервировано)

**Войди в Directus** (https://admin.voshod.shop) с ADMIN_EMAIL / ADMIN_PASSWORD. Затем:
1. Создай коллекции по `DIRECTUS_SCHEMA.md` и `docs/DIRECTUS_ORDERS_SCHEMA.md`
2. Создай роль «Storefront» с правами Read на каталог, Create на orders/order_items
3. Создай API-токен для роли Storefront
4. Вставь токен в `/home/ubuntu/voshod/voshod-web/.env.local` в `DIRECTUS_TOKEN=`
5. Перезапусти Next.js: `pm2 restart voshod-web`

---

## DNS-записи (уже сделаны)

| Хост   | Тип | Значение         | Назначение              |
|--------|-----|------------------|-------------------------|
| @      | A   | 146.185.210.216 | voshod.shop → Next.js   |
| www    | A   | 146.185.210.216 | www → Next.js           |
| admin  | A   | 146.185.210.216 | admin → Directus        |
| api    | A   | 146.185.210.216 | редирект на voshod.shop |
| studio | A   | 146.185.210.216 | редирект на voshod.shop |
| supabase | A | 146.185.210.216 | редирект на voshod.shop |

---

## Полезные команды

| Задача              | Команда                                                        |
|---------------------|----------------------------------------------------------------|
| Логи Next.js        | `pm2 logs voshod-web`                                          |
| Перезапуск Next.js  | `pm2 restart voshod-web`                                       |
| Статус Directus     | `cd /home/ubuntu/voshod/voshod-web/deploy/directus && sudo docker compose ps` |
| Логи Directus       | `sudo docker compose logs -f directus`                         |
| Обновить проект     | `cd /home/ubuntu/voshod/voshod-web && git pull && npm ci && npm run build && pm2 restart voshod-web` |
