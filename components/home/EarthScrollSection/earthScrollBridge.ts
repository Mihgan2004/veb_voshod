/**
 * Прогресс скролла секции (0…1) для R3F.
 * Отдельный модуль без framer-motion — Earth читает только его.
 */
let sectionProgress = 0;

export const earthScrollBridge = {
  get(): number {
    return sectionProgress;
  },
  set(value: number): void {
    sectionProgress = value;
  },
};
