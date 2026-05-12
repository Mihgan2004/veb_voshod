## EarthScrollSection

### Assets

Секция ожидает ассеты в `public/` по структуре из ТЗ:

- `public/textures/earth/*`
- `public/textures/space/*`
- `public/voshod-map/contours/*`

В этом репозитории файлы скопированы из готовых пакетов:

- `…/voshod_earth_textures/public/textures/earth/*`
- `…/voshod_space_fx_assets/public/textures/space/*`
- `…/voshod_contours_ready_package_v3/public/voshod-map/contours/*`

### Зависимости

Нужны:

- `three`
- `@react-three/fiber`

`@react-three/drei` **не используется** (текстуры грузятся через `THREE.TextureLoader` + `useLoader`).

После изменений в `package.json` обязательно выполните локально:

```bash
npm install
```

> Примечание: в среде агента `registry.npmjs.org` может быть недоступен, поэтому lockfile здесь не обновлялся автоматически.

### Reduced motion

При `prefers-reduced-motion: reduce` секция переключается в **статичный финальный** режим (без scroll-driven анимаций) и показывает CTA сразу.
