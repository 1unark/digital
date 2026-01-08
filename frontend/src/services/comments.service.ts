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

export const commentsService = {
  async getComments(postId: string) {
    const response = await api.get<PostComment[]>(`/comments/?post_id=${postId}`);
    return response.data;
  },

  async getReplies(parentId: string) {
    const response = await api.get<PostComment[]>(`/comments/?parent_id=${parentId}`);
    return response.data;
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