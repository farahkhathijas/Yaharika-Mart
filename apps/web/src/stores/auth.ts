import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { IUser } from '@yaharika/shared-types';

interface AuthState {
  user: IUser | null;
  token: string | null;
  isLoggedIn: boolean;
  setUser: (user: IUser | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoggedIn: false,
      setUser: (user) => set({ user, isLoggedIn: !!user }),
      setToken: (token) => set({ token }),
      logout: () => set({ user: null, token: null, isLoggedIn: false }),
    }),
    {
      name: 'auth-store',
    }
  )
);
