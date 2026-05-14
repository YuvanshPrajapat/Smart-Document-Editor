// src/services/api.ts
import axios from 'axios';

// Create a custom axios instance pointing to FastAPI
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
});

// The "Interceptor" - This runs before every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    // DEBUGGING LINE:
    console.log("Interceptor checking token:", token ? "Token Found!" : "NO TOKEN!");
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;