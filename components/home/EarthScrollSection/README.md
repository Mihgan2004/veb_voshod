# EarthScrollSection

- **Скролл:** `--earth-scroll-span` (~420vh десктоп, ~360vh мобилка); липкая сцена `100vh`/`100dvh`. Освещение Земли и сила золотого rim растут с `scrollYProgress` (сумрак → ~половина диска в свете к концу секции).
- **Земля:** WebGL в `earthLayer`, прозрачный фон; key/warm/fill directional + ambient интерполируются в `Earth.tsx`.
- **Логотип «РАССВЕТ»:** SVG-обводка **поверх** сферы (`logoOverlay`, z-index 2), анимация `pathLength` от общего `scrollYProgress` с `<main>`.
- **Контуры:** `rassvetTracedPaths.ts` генерируется из вашего растрового макета:
  ```bash
  node scripts/trace-rassvet-logo.mjs path/to/logo.jpg public/branding/rassvet-logo-traced.svg
  ```
  Маска — жёлтые пиксели на тёмном фоне (как в исходном файле). После правок макета перезапустите скрипт.
- **Lenis:** только глобальный провайдер — см. `SmoothScroll.tsx`.
