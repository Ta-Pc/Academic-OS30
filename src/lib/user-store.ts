"use client";
// User features removed; expose minimal stub so existing imports do not break.
export type CurrentUser = null;

// Create a proper store-like interface that supports selectors
const store = {
  currentUser: null as CurrentUser,
  hydrate: () => {}, // Stub function to prevent runtime errors
};

export function useUserStore<T>(selector: (state: typeof store) => T): T;
export function useUserStore(): typeof store;
export function useUserStore<T>(selector?: (state: typeof store) => T) {
  if (selector) {
    return selector(store);
  }
  return store;
}


