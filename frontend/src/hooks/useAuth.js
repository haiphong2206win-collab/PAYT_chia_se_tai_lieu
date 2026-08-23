// Phase 1 Mock Auth Hook - Provides simple UI state for demonstration
import { useState } from 'react';
import { MOCK_USER } from '../mock/user';

export const useAuth = () => {
  const [user, setUser] = useState(MOCK_USER);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const login = () => {
    setIsAuthenticated(true);
    setUser(MOCK_USER);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  return { user, isAuthenticated, login, logout };
};
