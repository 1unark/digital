// services/posts.service.ts
import api from '@/lib/api';

export interface Post {
  id: string;
  title: string;
  videoUrl: string;
  thumbnailUrl?: string;
  author: {
    name: string;
    avatar?: string;
  };
  createdAt: Date;
  likes: number;
  views: number;
}

export const postsService = {
  async getPosts(): Promise<Post[]> {
    const response = await api.get('/posts/');
    return Array.isArray(response.data) ? response.data : response.data.results || [];
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