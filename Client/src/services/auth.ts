// src/services/auth.ts
import api from './api';

export const authService = {
  // 1. Register User
  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // 2. Login User (Remember: FastAPI expects standard form data for login!)
  login: async (email: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append('username', email); // FastAPI OAuth2 expects 'username' field
    formData.append('password', password);

    const response = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    
    // Save the token!
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    return response.data;
  },

  // 3. Logout
  logout: () => {
    localStorage.removeItem('token');
  }
};