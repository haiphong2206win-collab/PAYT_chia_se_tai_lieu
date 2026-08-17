// Phase 1 Auth Store Placeholder - Future Zustand or Context state
import { MOCK_USER } from '../mock/user';

export const authStore = {
  user: MOCK_USER,
  isAuthenticated: true,
  setUser: (user) => { authStore.user = user; },
  setAuthenticated: (val) => { authStore.isAuthenticated = val; }
};
