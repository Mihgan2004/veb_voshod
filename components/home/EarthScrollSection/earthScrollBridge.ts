/**
 * Прогресс скролла секции (0…1) для R3F — без framer-motion.
 */
let sectionProgress = 0;
const listeners = new Set<() => void>();

export const earthScrollBridge = {
  get(): number {
    return sectionProgress;
  },
  set(value: number): void {
    const next = value < 0 ? 0 : value > 1 ? 1 : value;
    if (next === sectionProgress) return;
    sectionProgress = next;
    listeners.forEach((fn) => fn());
  },
  subscribe(fn: () => void): () => void {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};
