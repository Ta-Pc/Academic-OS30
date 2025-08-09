"use client";
import { create } from 'zustand';

export type CurrentUser = {
  id: string;
  email: string;
  name?: string | null;
} | null;

type UserStore = {
  currentUser: CurrentUser;
  setCurrentUser: (user: CurrentUser) => void;
  hydrate: () => Promise<void>;
};

export const useUserStore = create<UserStore>((set) => ({
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),
  hydrate: async () => {
    try {
      const res = await fetch('/api/session/user', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        set({ currentUser: data?.user ?? null });
      }
    } catch {
      // ignore
    }
  },
}));


