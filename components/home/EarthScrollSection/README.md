# EarthScrollSection

4-фазный sticky-сторителлинг главной страницы:
**ВОСХОД → Россия → Московская область → Солнечногорск**.

Полностью свой 3D-стек на `@react-three/fiber`:

- кастомный day/night ShaderMaterial на сфере Земли
  (Blue Marble + NASA Black Marble);
- Fresnel-атмосфера двумя слоями;
- полупрозрачный слой облаков (Lambert + slow spin);
- маркеры городов как sprite на поверхности Земли;
- звёздное небо в 2 слоя + дальнее тёплое солнце;
- камера и rotation Земли управляются через `framer-motion useScroll`
  по 4 фазам;
- HTML/SVG-оверлей синхронизирован с тем же `scrollYProgress`.

## Storyboard

| Phase    | Range       | Что в кадре                                                    |
|----------|-------------|-----------------------------------------------------------------|
| `hero`   | 0.00 – 0.25 | Земля полумесяцем слева, заголовок «Добро пожаловать / ВОСХОД» |
| `globe`  | 0.25 – 0.50 | Земля центрируется, идёт оборот; угловые tech-метки             |
| `russia` | 0.50 – 0.75 | Камера ныряет к России, неоновая обводка страны + маркер Москвы |
| `moscow` | 0.75 – 1.00 | Близко к МО, обводка региона + выноска «город Солнечногорск» + CTA «Перейти в каталог» |

## Файлы

```
components/home/EarthScrollSection/
  EarthScrollSection.tsx           главный client component, useScroll + sticky
  EarthCanvas.tsx                  Canvas + camera + stars + sun + EarthStage
  EarthStage.tsx                   Earth-группа + camera анимация по фазам
  EarthSphere.tsx                  кастомный day/night ShaderMaterial
  Atmosphere.tsx                   Fresnel rim glow (2 слоя)
  Clouds.tsx                       полупрозрачный слой облаков
  CityMarker.tsx                   светящаяся точка lat/lon + pulse-кольцо
  PhaseOverlays.tsx                HTML/SVG-оверлеи (4 панели)
  geo.ts                           SVG path данные Russia + MO + точки городов
  phases.ts                        phase ranges, smoothstep, lat/lon → vec3
  SmoothScrollProvider.tsx         pass-through (Lenis уже глобально)
  earth-scroll-section.module.css  стили (400vh, sticky, panels, neon glow)
  README.md                        этот файл
```

## Ассеты

```
public/earth-scroll/assets/textures/
  day.jpg     ~183 KB — 2K Blue Marble (no clouds)
  night.jpg   ~720 KB — 2K NASA Black Marble (city lights)
  clouds.png  ~1.4 MB — 2K transparent clouds
```

Источники: `mrdoob/three.js` examples + `turban/webgl-earth` (raw.githubusercontent.com).

## Как работает анимация

`useScroll({ target: sectionRef, offset: ["start start", "end end"] })`
даёт чистый `scrollYProgress` ∈ [0..1] на pinned-диапазоне. Один и тот же
motion value передаётся:

- в `EarthCanvas → EarthStage`, где `useFrame` интерполирует
  `camera.position.z` (5.4 → 1.65), `earthGroup.rotation.y/x` и
  `earthGroup.position` через `lerp + phaseSmooth`;
- в `PhaseOverlays`, где `phaseVisibility(p, phase)` управляет
  opacity/transform каждой панели — все 4 панели всегда смонтированы,
  что исключает mount-jitter и даёт плавные cross-fade.

## Зависимости

Уже в `package.json`:

```
three                ^0.177
@react-three/fiber   ^9.6
@react-three/drei    ^10.7    (не используется в финале, но осталось от прошлой итерации)
framer-motion        ^12.38
lenis                ^1.3      (глобально через components/providers/LenisProvider.tsx)
```

## Адаптив

- Desktop: `height: 400vh` scroll-пространства; камера 4.8u → 1.65u.
- Mobile (≤768px): `height: 360vh`; шрифт hero-заголовка clamp 40–96px;
  все панели сужаются (mapWrap 92vw / 80vw).
- `prefers-reduced-motion: reduce` — секция режется до 130vh, обводки
  рисуются без stroke-dash анимации, pulse-маркеры замораживаются.

## Контракт интеграции

В `app/page.tsx` секция вставляется один раз сразу после Hero:

```tsx
<Hero />
<EarthScrollSection />
<HomeScrollProvider>...</HomeScrollProvider>
```

Не оборачивать `<EarthScrollSection>` в общий `<Suspense>`: внутри
секции уже свой `<Suspense fallback={null}>` для chunk'а Canvas.
