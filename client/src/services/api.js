import axios from "axios";

// Single shared Axios instance — every API call in the app goes through this.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Runs before every request — attaches the JWT token if we have one,
// so we never have to manually add the Authorization header in components.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
