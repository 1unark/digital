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


  async updateProfile(userId: string, bio: string, avatarFile: File | null): Promise<void> {
    const formData = new FormData();
    formData.append('bio', bio);
    
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    const response = await apiClient.patch(`/users/update-profile/${userId}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },
  

  async getUserVideos(userId: string): Promise<Post[]> {
    const response = await apiClient.get(`/posts/user/${userId}/thumbnails/`);
    
    return Array.isArray(response.data) ? response.data : response.data.results || [];
  },


  async followUser(username: string): Promise<void> {
    await apiClient.post(`/users/follow/${username}/`);
  },

  async unfollowUser(username: string): Promise<void> {
    await apiClient.delete(`/users/follow/${username}/`);
  },
  
};