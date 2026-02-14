#!/bin/bash
# Скрипт деплоя Next.js — запускать на сервере из корня проекта
set -e

echo "=== Voshod Web Deploy ==="
git pull
npm ci
npm run build
pm2 restart voshod-web || pm2 start ecosystem.config.cjs
echo "Done. Check: pm2 logs voshod-web"
