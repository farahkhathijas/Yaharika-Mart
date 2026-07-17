import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AccessibilityState {
  highContrast: boolean;
  largeText: boolean;
  voiceEnabled: boolean;
  fontScale: number; // 0.75 to 1.5

  setHighContrast: (enabled: boolean) => void;
  setLargeText: (enabled: boolean) => void;
  setVoiceEnabled: (enabled: boolean) => void;
  setFontScale: (scale: number) => void;
  applyToDOM: () => void;
}

export const useAccessibilityStore = create<AccessibilityState>()(
  persist(
    (set, get) => ({
      highContrast: false,
      largeText: false,
      voiceEnabled: false,
      fontScale: 1,

      setHighContrast: (enabled) => {
        set({ highContrast: enabled });
        get().applyToDOM();
      },

      setLargeText: (enabled) => {
        set({ largeText: enabled, fontScale: enabled ? 1.2 : 1 });
        get().applyToDOM();
      },

      setVoiceEnabled: (enabled) => set({ voiceEnabled: enabled }),

      setFontScale: (scale) => {
        const clamped = Math.min(1.5, Math.max(0.75, scale));
        set({ fontScale: clamped });
        get().applyToDOM();
      },

      applyToDOM: () => {
        if (typeof document === 'undefined') return;
        const { highContrast, fontScale } = get();
        const html = document.documentElement;

        if (highContrast) {
          html.classList.add('high-contrast');
        } else {
          html.classList.remove('high-contrast');
        }

        html.style.setProperty('--font-scale', fontScale.toString());
      },
    }),
    {
      name: 'yaharika-a11y',
      onRehydrateStorage: () => (state) => {
        // Apply saved settings to DOM after hydration
        state?.applyToDOM();
      },
    }
  )
);
