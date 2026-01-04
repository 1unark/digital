// services/votes.service.ts
import api from '@/lib/api';

export const votesService = {
  async vote(postId: number, voteType: 1 | 2) {
    const response = await api.post(`/votes/${postId}/`, { value: voteType });
    return response.data;
  },

  async removeVote(postId: number) {
    const response = await api.delete(`/votes/${postId}/delete/`);
    return response.data;
  },
};