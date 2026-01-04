// services/user.service.ts
import apiClient from '@/lib/api';
import { User, Post } from '@/types/index';

export const userService = {
  async getUserByUsername(username: string): Promise<User> {
    const response = await apiClient.get(`/users/profile/${username}/`);
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get('/users/me/');
    return response.data;
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await apiClient.patch('/users/me/', data);
    return response.data;
  },

  async getUserVideos(username: string): Promise<Post[]> {
    const response = await apiClient.get(`/posts/?username=${username}`);
    return response.data.results || [];
  }
};