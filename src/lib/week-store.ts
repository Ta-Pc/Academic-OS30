"use client";
import { create } from 'zustand';

export type WeekNavState = {
  lastViewedWeek: string | null; // ISO date (start of week) or arbitrary selected date param
  setLastViewedWeek: (date: string | null) => void;
};

export const useWeekStore = create<WeekNavState>((set) => ({
  lastViewedWeek: null,
  setLastViewedWeek: (date) => set({ lastViewedWeek: date }),
}));

// Helper for WeekView container to record current date param
export function rememberWeek(date?: string) {
  // Date param can be undefined -> store null (interpreted as base route)
  useWeekStore.getState().setLastViewedWeek(date ?? null);
}
