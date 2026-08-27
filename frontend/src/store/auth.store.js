// Phase 1 Auth Store Placeholder - Future Zustand or Context state

export const authStore = {
  user: null,
  isAuthenticated: false,
  setUser: (user) => { authStore.user = user; },
  setAuthenticated: (val) => { authStore.isAuthenticated = val; }
};
