// services/comments.service.ts
import api from '@/lib/api';
import { PostComment } from '@/types/index';

export interface CreateCommentRequest {
  post: string;
  parent?: string;
  content: string;
}

export interface UpdateCommentRequest {
  content: string;
}

// Define paginated response type
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Define the possible response types for comments
export type CommentsResponse = PostComment[] | PaginatedResponse<PostComment>;

export const commentsService = {
  async getComments(postId: string): Promise<PostComment[]> {
    const response = await api.get<CommentsResponse>(`/comments/?post_id=${postId}`);
    // Handle both paginated and non-paginated responses
    return Array.isArray(response.data) ? response.data : response.data.results;
  },

  async getReplies(postId: string, parentId: string): Promise<PostComment[]> {
    const response = await api.get<CommentsResponse>(`/comments/?post_id=${postId}&parent_id=${parentId}`);
    return Array.isArray(response.data) ? response.data : response.data.results;
  },

  async createComment(data: CreateCommentRequest) {
    const response = await api.post<PostComment>('/comments/', data);
    return response.data;
  },

  async updateComment(commentId: string, data: UpdateCommentRequest) {
    const response = await api.patch<PostComment>(`/comments/${commentId}/`, data);
    return response.data;
  },

  async deleteComment(commentId: string) {
    const response = await api.delete(`/comments/${commentId}/`);
    return response.data;
  },
};