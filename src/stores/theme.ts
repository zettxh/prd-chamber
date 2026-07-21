import { create } from 'zustand';

interface ThemeStore {
  dark: boolean;
  toggle: () => void;
}

export const useThemeStore = create<ThemeStore>((set) => {
  const stored = typeof window !== 'undefined'
    ? localStorage.getItem('prd-chamber-theme')
    : null;
  const initial = stored === 'dark';

  // Deferred: apply class after Microtask to avoid SSR mismatch
  if (typeof document !== 'undefined') {
    queueMicrotask(() => {
      document.documentElement.classList.toggle('dark', initial);
    });
  }

  return {
    dark: initial,
    toggle: () =>
      set((s) => {
        const next = !s.dark;
        document.documentElement.classList.toggle('dark', next);
        localStorage.setItem('prd-chamber-theme', next ? 'dark' : 'light');
        return { dark: next };
      }),
  };
});
