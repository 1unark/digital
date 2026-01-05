// services/posts.service.ts
import api from '@/lib/api';
import { Post } from '@/types/index';
import { AxiosProgressEvent } from 'axios';

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

  async createPost(
    formData: FormData, 
    onProgress?: (progress: number) => void
  ): Promise<Post> {
    const response = await api.post('/posts/create/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent: AxiosProgressEvent) => {
        if (progressEvent.total && onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
    return response.data;
  },
};