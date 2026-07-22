import { create } from 'zustand';

interface BrightnessStore {
  level: number;
  setLevel: (n: number) => void;
}

export const useBrightnessStore = create<BrightnessStore>((set) => {
  const stored = typeof window !== 'undefined'
    ? localStorage.getItem('prd-chamber-brightness')
    : null;
  const initial = stored ? Number(stored) : 75;

  if (typeof document !== 'undefined') {
    queueMicrotask(() => {
      document.body.style.filter = `brightness(${initial}%)`;
    });
  }

  return {
    level: initial,
    setLevel: (n: number) =>
      set(() => {
        document.body.style.filter = `brightness(${n}%)`;
        localStorage.setItem('prd-chamber-brightness', String(n));
        return { level: n };
      }),
  };
});
