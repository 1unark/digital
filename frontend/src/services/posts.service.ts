// services/posts.service.ts
import api from '@/lib/api';
import { Post, Category } from '@/types/index';
import { AxiosProgressEvent } from 'axios';

export const postsService = {
  async getCategories(): Promise<Category[]> {
    const response = await api.get('/posts/categories/');
    return response.data.results || response.data;
  },

  async getPosts(categorySlug?: string): Promise<Post[]> {
    const params: { category?: string } = {};
    
    if (categorySlug && categorySlug !== 'all') {
      params.category = categorySlug;
    }
    
    console.log('Fetching posts with params:', params);
    const response = await api.get('/posts/', { params });
    console.log('Response:', response.data);
    
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