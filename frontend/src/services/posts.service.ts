// services/posts.service.ts
import api from '@/lib/api';
import { Post, Category } from '@/types/index';
import { AxiosProgressEvent } from 'axios';

// Type for storing view timestamps
interface ViewRecord {
  postId: string;
  timestamp: number;
}

const VIEW_COOLDOWN_MS = 3 * 60 * 60 * 1000; // 3 hours in milliseconds

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
    
    const response = await api.get('/posts/', { params });
    
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

  async trackView(postId: string): Promise<void> {
    if (typeof window === 'undefined') return;

    const stringId = String(postId);
    const now = Date.now();

    // Initialize cache if it doesn't exist
    if (!(window as any)._viewedPosts) {
      (window as any)._viewedPosts = new Map<string, number>();
    }

    const cache: Map<string, number> = (window as any)._viewedPosts;

    // Check if already viewed recently
    const lastViewTime = cache.get(stringId);
    if (lastViewTime) {
      const timeSinceLastView = now - lastViewTime;
      const hoursAgo = Math.floor(timeSinceLastView / (60 * 60 * 1000));
      
      if (timeSinceLastView < VIEW_COOLDOWN_MS) {
        return; 
      }
    }

    // Mark as viewed with current timestamp
    cache.set(stringId, now);

    try {
      // Make the API call to track the view
      await api.post(`/posts/${stringId}/track-view/`);
    } catch (error) {
      console.error(`[Service] Error tracking view for ${stringId}:`, error);
      // Remove from cache if the API call failed so it can be retried
      cache.delete(stringId);
      throw error;
    }
  },

  // Optional: Helper method to clean up old entries (call periodically if needed)
  cleanupViewCache(): void {
    if (typeof window === 'undefined') return;
    
    const cache: Map<string, number> = (window as any)._viewedPosts;
    if (!cache) return;

    const now = Date.now();
    const cutoffTime = now - VIEW_COOLDOWN_MS;

    for (const [postId, timestamp] of cache.entries()) {
      if (timestamp < cutoffTime) {
        cache.delete(postId);
      }
    }
  },
};