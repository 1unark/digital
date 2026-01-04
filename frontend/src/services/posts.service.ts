// services/posts.service.ts
import api from '@/lib/api';
import { Post } from '@/types/index';

export const postsService = {
  async getPosts(): Promise<Post[]> {
    const response = await api.get('/posts/');
    const data = Array.isArray(response.data) ? response.data : response.data.results || [];
    return data;
  },

  async getPostById(id: string): Promise<Post> {
    const response = await api.get(`/posts/${id}/`);
    return response.data;
  },

  async createPost(formData: FormData): Promise<Post> {
    const response = await api.post('/posts/create/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};