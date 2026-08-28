import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const handleApiError = (error) => {
  console.warn("API Error placeholder:", error);
};

export default api;