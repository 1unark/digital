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
  plusTwoCount: number;
  totalScore: number;
  views: number;
  userVote?: 1 | 2 | null;
}

export const postsService = {
  async getPosts(): Promise<Post[]> {
    const response = await api.get('/posts/');
    const data = Array.isArray(response.data) ? response.data : response.data.results || [];
    return data.map((post: any) => ({
      ...post,
      id: String(post.id)
    }));
  },

  async getPostById(id: string): Promise<Post> {
    const response = await api.get(`/posts/${id}/`);
    return {
      ...response.data,
      id: String(response.data.id)
    };
  },

  async createPost(formData: FormData): Promise<Post> {
    const response = await api.post('/posts/create/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return {
      ...response.data,
      id: String(response.data.id)
    };
  },
};