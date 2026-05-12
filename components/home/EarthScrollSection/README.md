# EarthScrollSection

Clean 3D Earth scroll animation для главной страницы. Реализация повторяет
архитектуру [Olivier Larose — 3d-earth-scroll](https://github.com/olivierlarose/3d-earth-scroll):

- `@react-three/fiber` Canvas;
- `useGLTF` для модели `TERRA.glb` (drei);
- `useScroll` от framer-motion даёт `scrollYProgress` секции;
- вращение модели идёт от scroll-прогресса (`useFrame` + lerp);
- глобальный Lenis уже подключен в `app/layout.tsx`, локальный
  `SmoothScrollProvider` — pass-through wrapper по архитектуре файла.

Никаких контуров России / Московской области / Солнечногорска,
никаких выносок и CTA — это базовый этап.

## Файлы

```
components/home/EarthScrollSection/
  EarthScrollSection.tsx           главный client component (useScroll)
  EarthCanvas.tsx                  R3F Canvas + camera + lights
  EarthModel.tsx                   useGLTF(TERRA.glb) + sphere fallback
  SmoothScrollProvider.tsx         pass-through (Lenis уже глобально)
  earth-scroll-section.module.css  стили (sticky + scroll-пространство)
  README.md                        этот файл
```

## Ассеты

```
public/earth-scroll/assets/
  TERRA.glb         (~516 KB) — модель Земли из репозитория Olivier Larose
  color.jpg                  — diffuse / albedo карта Земли
  normal.png                 — normal-map (рельеф)
  occlusion.jpg              — ambient occlusion
```

### Что положено в этом коммите

- `TERRA.glb` — полноценная модель (528 672 байт, валидный glTF v2),
  скачана из `https://raw.githubusercontent.com/olivierlarose/3d-earth-scroll/main/public/assets/TERRA.glb`.
- `color.jpg`, `normal.png`, `occlusion.jpg` — **1×1 placeholder-картинки**
  (нейтральный синий / flat-normal / белый AO). Этого достаточно, чтобы
  `meshStandardMaterial` в fallback-режиме не падал, но визуально без
  деталей. **Их нужно заменить на оригинальные текстуры** из
  репозитория Olivier Larose:

```bash
# Положите вручную в public/earth-scroll/assets/:
#   color.jpg       https://raw.githubusercontent.com/olivierlarose/3d-earth-scroll/main/public/assets/color.jpg
#   normal.png      https://raw.githubusercontent.com/olivierlarose/3d-earth-scroll/main/public/assets/normal.png
#   occlusion.jpg   https://raw.githubusercontent.com/olivierlarose/3d-earth-scroll/main/public/assets/occlusion.jpg
```

> Примечание: основной визуал — модель `TERRA.glb`, в неё уже зашиты
> референс-материалы. Внешние `color/normal/occlusion` нужны только для
> fallback-режима (если GLB по какой-то причине не загрузится).

## Зависимости

В `package.json` уже есть всё необходимое:

```
three                ^0.177
@react-three/fiber   ^9.6
@react-three/drei    ^10.7
framer-motion        ^12.38
lenis                ^1.3      // глобально через components/providers/LenisProvider.tsx
```

### Если зависимости нужно доустановить вручную

```bash
npm install three @react-three/fiber @react-three/drei framer-motion lenis
```

Опционально (если захотите использовать `<motion.mesh>`-API вместо
`useFrame` + lerp):

```bash
npm install framer-motion-3d
```

> На React 19 у `framer-motion-3d` бывают peer-conflicts. В текущей
> реализации этот пакет **не используется**: rotation 3D-объекта
> делается через `useFrame` + scroll progress (см. `EarthModel.tsx`).

### Что специально **не** ставится

- gsap / ScrollTrigger
- r3f-scroll-rig
- postprocessing
- globe.gl / react-globe.gl

## Адаптив

- Desktop: `height: 300vh` scroll-пространства, camera `fov 35`,
  `position [0, 0, 5]`, Земля занимает ~центральную треть viewport.
- Mobile (≤480px): `height: 260vh` — короче, чтобы не растягивать
  узкие экраны. Канва сама масштабируется под контейнер.
- `prefers-reduced-motion: reduce` — секция сжимается до `100vh`,
  scroll-driven вращение остаётся, но без длинной протяжки.

## Reduced motion

`useScroll` продолжает работать, но scroll-пространство урезано до
одного viewport, поэтому полный «оборот Земли» происходит за один
короткий swipe. Никаких отдельных React-state flag не требуется.

## Локальная проверка

```bash
npm run lint
npm run build
```

> В среде CI/агента `fonts.googleapis.com` обычно недоступен — `npm run build`
> может падать на `next/font/google`. Это сетевой блокер, не код.
