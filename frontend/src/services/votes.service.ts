// services/votes.service.ts
import api from '@/lib/api';

export const votesService = {
  async vote(postId: string, voteType: 1 | 2) {
    const response = await api.post(`/votes/${postId}/`, { vote_type: voteType });
    return response.data;
  },

  async removeVote(postId: string) {
    const response = await api.delete(`/votes/${postId}/delete/`);
    return response.data;
  },
};