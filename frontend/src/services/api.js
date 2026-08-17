// Phase 1 Placeholder - Backend API client configuration
// Real Axios instance and interceptors will be implemented in Phase 2.

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const handleApiError = (error) => {
  console.warn('API Error placeholder:', error);
};
