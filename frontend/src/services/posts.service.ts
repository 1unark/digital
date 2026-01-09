// services/posts.service.ts
import api from '@/lib/api';
import { Post, Category } from '@/types/index';
import { AxiosProgressEvent, AxiosError } from 'axios';

const VIEW_COOLDOWN_MS = 3 * 60 * 60 * 1000; // 3 hours

class PostsService {
  async getCategories(): Promise<Category[]> {
    try {
      const response = await api.get('/posts/categories/');
      return response.data.results || response.data;
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      throw error;
    }
  }

  async getPosts(
    category?: string,
    params?: { cursor?: string | null; limit?: number }
  ): Promise<any> { // Return full response including next cursor
    try {
      const queryParams: any = {};
      if (category) queryParams.category = category;
      if (params?.cursor) queryParams.cursor = params.cursor;
      if (params?.limit) queryParams.limit = params.limit;

      const response = await api.get('/posts/', { params: queryParams });

      // Return full response for cursor pagination
      return response.data;
    } catch (error: any) {
      if (error.response) {
        const err = new Error(`Failed to fetch posts: ${error.response.status}`);
        (err as any).response = error.response;
        throw err;
      }
      throw error;
    }
  }

    async getPostById(id: string): Promise<Post> {
      try {
        const response = await api.get(`/posts/${id}/`);
        return response.data;
      } catch (error) {
        console.error(`Failed to fetch post ${id}:`, error);
        throw error;
      }
    }

  async createPost(
    formData: FormData,
    onProgress?: (progress: number) => void
  ): Promise<Post> {
    try {
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
        timeout: 300000, // 5 minutes for large video uploads
      });
      return response.data;
    } catch (error) {
      console.error('Failed to create post:', error);
      throw error;
    }
  }

  async trackView(postId: string): Promise<void> {
    if (typeof window === 'undefined') return;

    const stringId = String(postId);
    const now = Date.now();

    // Initialize cache
    if (!(window as any)._viewedPosts) {
      (window as any)._viewedPosts = new Map<string, number>();
    }

    const cache: Map<string, number> = (window as any)._viewedPosts;

    // Check cooldown
    const lastViewTime = cache.get(stringId);
    if (lastViewTime && (now - lastViewTime) < VIEW_COOLDOWN_MS) {
      return;
    }

    // Optimistically mark as viewed
    cache.set(stringId, now);

    try {
      await api.post(`/posts/${stringId}/track-view/`, {}, {
        timeout: 5000, // 5 second timeout for tracking
      });
    } catch (error) {
      console.error(`Failed to track view for ${stringId}:`, error);
      // Don't remove from cache - fail silently for analytics
      // User shouldn't be blocked from using app due to tracking failure
    }
  }

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
  }

  async deletePost(postId: string): Promise<void> {
    try {
      await api.delete(`/posts/${postId}/delete/`);
    } catch (error) {
      console.error(`Failed to delete post ${postId}:`, error);
      throw error;
    }
  }

  // Add method to handle post deletion from feed
  async votePost(postId: string, voteType: 'up' | 'down' | 'none'): Promise<Post> {
    try {
      const response = await api.post(`/posts/${postId}/vote/`, { vote_type: voteType });
      return response.data;
    } catch (error) {
      console.error(`Failed to vote on post ${postId}:`, error);
      throw error;
    }
  }
}

export const postsService = new PostsService();