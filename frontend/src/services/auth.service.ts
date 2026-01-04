// services/auth.service.ts
import api from '@/lib/api';

export interface User {
  id: number;
  username: string;
  email: string;
}

interface LoginResponse {
  access: string;
  refresh: string;
  user_id: number;
  username: string;
}

export const authService = {
  async login(usernameOrEmail: string, password: string): Promise<LoginResponse> {
    const response = await api.post('/auth/login/', { login: usernameOrEmail, password });
    return response.data;
  },

  async register(username: string, email: string, password: string): Promise<void> {
    await api.post('/auth/register/', { username, email, password });
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get('/auth/me/');
    return response.data;
  },

  async getUserProfile(userId: number): Promise<User> {
    const response = await api.get(`/auth/profile/${userId}/`);
    return response.data;
  },

  saveTokens(access: string, refresh: string): void {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
  },

  clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  getStoredTokens() {
    return {
      accessToken: localStorage.getItem('access_token'),
      refreshToken: localStorage.getItem('refresh_token'),
    };
  },
};