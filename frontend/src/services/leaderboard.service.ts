// services/leaderboard.service.ts
import apiClient from '@/lib/api';
import { LeaderboardEntry } from '@/types/index';


export const leaderboardService = {
  async getTopCreators(): Promise<LeaderboardEntry[]> {
    const response = await apiClient.get('/users/leaderboard/');
    return response.data.slice(0, 50);
  }
};