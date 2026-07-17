import { create } from 'zustand';
import { IUser } from '@yaharika/shared-types';

interface UIState {
  // Auth
  user: IUser | null;
  accessToken: string | null;
  isAuthLoading: boolean;

  // Theme
  isDark: boolean;

  // Notifications
  unreadCount: number;

  // Setters
  setUser: (user: IUser | null) => void;
  setAccessToken: (token: string | null) => void;
  setAuthLoading: (loading: boolean) => void;
  toggleDark: () => void;
  setUnreadCount: (count: number) => void;
  logout: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  user: null,
  accessToken: null,
  isAuthLoading: true,
  isDark: false,
  unreadCount: 0,

  setUser: (user) => set({ user }),
  setAccessToken: (token) => {
    set({ accessToken: token });
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('yaharika-token', token);
      } else {
        localStorage.removeItem('yaharika-token');
      }
    }
  },
  setAuthLoading: (loading) => set({ isAuthLoading: loading }),

  toggleDark: () => {
    set((state) => {
      const newDark = !state.isDark;
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', newDark);
      }
      return { isDark: newDark };
    });
  },

  setUnreadCount: (count) => set({ unreadCount: count }),

  logout: () => {
    set({ user: null, accessToken: null, unreadCount: 0 });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('yaharika-token');
    }
  },
}));
