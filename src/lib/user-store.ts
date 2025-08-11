"use client";
// User features removed; expose minimal stub so existing imports do not break.
export type CurrentUser = null;

// Create a proper store-like interface that supports selectors
const store = {
  currentUser: null as CurrentUser,
  hydrate: () => {}, // Stub function to prevent runtime errors
};

export const useUserStore = (selector?: (state: typeof store) => any) => {
  if (selector) {
    return selector(store);
  }
  return store;
};


