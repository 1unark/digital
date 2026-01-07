// services/auth.service.ts
import api from '@/lib/api';
import { User } from '@/types/index';

interface LoginResponse {
  access: string;
  refresh: string;
  user_id: string;
  username: string;
}

export const authService = {
  async login(usernameOrEmail: string, password: string): Promise<LoginResponse> {
    const response = await api.post('/users/login/', { login: usernameOrEmail, password });
    return response.data;
  },

  async register(username: string, email: string, password: string): Promise<void> {
    await api.post('/users/register/', { username, email, password });
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get('/users/me/');
    return response.data;
  },

  async getUserProfile(userId: number): Promise<User> {
    const response = await api.get(`/users/profile/${userId}/`);
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